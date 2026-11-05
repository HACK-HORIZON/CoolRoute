import { CAMPUS_EDGES, CAMPUS_NODES } from '../data/campusNetwork';
import { EnvironmentalContext, GraphEdge, GraphNode, RouteOption, SegmentCalculation } from '../types';
import { calculateEdgeMicroclimate } from './microclimateEngine';

interface AdjacencyEdge {
  targetNodeId: string;
  edge: GraphEdge;
  forward: boolean;
}

// Build bidirectional adjacency list
function buildAdjacencyList(edges: GraphEdge[]): Map<string, AdjacencyEdge[]> {
  const adj = new Map<string, AdjacencyEdge[]>();

  for (const node of CAMPUS_NODES) {
    adj.set(node.id, []);
  }

  for (const edge of edges) {
    adj.get(edge.source)?.push({ targetNodeId: edge.target, edge, forward: true });
    adj.get(edge.target)?.push({ targetNodeId: edge.source, edge, forward: false });
  }

  return adj;
}

const adjacencyList = buildAdjacencyList(CAMPUS_EDGES);
const nodeMap = new Map<string, GraphNode>(CAMPUS_NODES.map((n) => [n.id, n]));

/**
 * Calculates dynamic routing cost for an edge under a specific routing objective
 */
function computeEdgeRoutingCost(
  segment: SegmentCalculation,
  targetNode: GraphNode | undefined,
  mode: 'fastest' | 'coolest' | 'balanced'
): number {
  const baseTimeSeconds = segment.durationSeconds;

  if (mode === 'fastest') {
    // Pure time-minimization (heat-agnostic)
    return baseTimeSeconds;
  }

  // Thermal stress cost
  const comfortThreshold = 26.0;
  const excessHeat = Math.max(0, segment.perceivedHeatIndexC - comfortThreshold);

  // Amenity discounts
  let amenityBonusSeconds = 0;
  if (targetNode?.poiType === 'water_fountain') amenityBonusSeconds += 25;
  if (targetNode?.poiType === 'cooling_hub') amenityBonusSeconds += 45;
  if (targetNode?.poiType === 'shaded_bench') amenityBonusSeconds += 15;
  if (targetNode?.poiType === 'misting_station') amenityBonusSeconds += 30;

  if (segment.isIndoorAC) {
    amenityBonusSeconds += 50;
  }

  if (mode === 'coolest') {
    // Strongly penalize heat and reward shade/amenities
    // High heat on asphalt at 48°C gets an enormous penalty multiplier
    const heatMultiplier = 1 + Math.pow(excessHeat / 6, 1.8);
    const shadeDiscount = (segment.effectiveShadePct / 100) * 0.45;
    const adjustedCost = (baseTimeSeconds * heatMultiplier * (1 - shadeDiscount)) - amenityBonusSeconds;
    return Math.max(1, adjustedCost);
  }

  // mode === 'balanced'
  // Moderate heat penalty, ensuring detour is capped
  const heatMultiplier = 1 + (excessHeat / 10);
  const shadeDiscount = (segment.effectiveShadePct / 100) * 0.25;
  const adjustedCost = (baseTimeSeconds * heatMultiplier * (1 - shadeDiscount)) - (amenityBonusSeconds * 0.5);
  return Math.max(1, adjustedCost);
}

/**
 * Dijkstra shortest path algorithm
 */
function dijkstra(
  startNodeId: string,
  endNodeId: string,
  env: EnvironmentalContext,
  mode: 'fastest' | 'coolest' | 'balanced',
  walkSpeedMps: number
): { pathNodeIds: string[]; segments: SegmentCalculation[] } | null {
  const distances = new Map<string, number>();
  const previous = new Map<string, { nodeId: string; segment: SegmentCalculation }>();
  const unvisited = new Set<string>();

  for (const node of CAMPUS_NODES) {
    distances.set(node.id, Infinity);
    unvisited.add(node.id);
  }

  distances.set(startNodeId, 0);

  while (unvisited.size > 0) {
    // Find unvisited node with smallest distance
    let currentId: string | null = null;
    let minDistance = Infinity;

    for (const id of unvisited) {
      const dist = distances.get(id) ?? Infinity;
      if (dist < minDistance) {
        minDistance = dist;
        currentId = id;
      }
    }

    if (!currentId || minDistance === Infinity) {
      break;
    }

    if (currentId === endNodeId) {
      break; // Reached destination
    }

    unvisited.delete(currentId);

    const neighbors = adjacencyList.get(currentId) || [];
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.targetNodeId)) continue;

      const segmentCalc = calculateEdgeMicroclimate(neighbor.edge, env, walkSpeedMps);
      const targetNode = nodeMap.get(neighbor.targetNodeId);
      const edgeCost = computeEdgeRoutingCost(segmentCalc, targetNode, mode);

      const alt = minDistance + edgeCost;
      if (alt < (distances.get(neighbor.targetNodeId) ?? Infinity)) {
        distances.set(neighbor.targetNodeId, alt);
        
        // Ensure coordinates follow traversal direction
        const coords = neighbor.forward
          ? neighbor.edge.coordinates
          : [...neighbor.edge.coordinates].reverse();

        previous.set(neighbor.targetNodeId, {
          nodeId: currentId,
          segment: { ...segmentCalc, coordinates: coords }
        });
      }
    }
  }

  if (!previous.has(endNodeId) && startNodeId !== endNodeId) {
    return null; // No route found
  }

  // Reconstruct path
  const pathNodeIds: string[] = [endNodeId];
  const segments: SegmentCalculation[] = [];
  let curr = endNodeId;

  while (curr !== startNodeId) {
    const prev = previous.get(curr);
    if (!prev) break;
    segments.unshift(prev.segment);
    curr = prev.nodeId;
    pathNodeIds.unshift(curr);
  }

  return { pathNodeIds, segments };
}

/**
 * Builds a full RouteOption object with comprehensive metrics
 */
function buildRouteOption(
  id: 'fastest' | 'coolest' | 'balanced',
  title: string,
  subtitle: string,
  color: string,
  result: { pathNodeIds: string[]; segments: SegmentCalculation[] }
): RouteOption {
  let totalDistanceMeters = 0;
  let totalDurationSeconds = 0;
  let cumulativeHeatExposure = 0;
  let totalShadeSum = 0;
  let waterStationsPassed = 0;
  let restPointsPassed = 0;
  let indoorDistance = 0;
  let peakPerceivedTempC = 0;

  for (const seg of result.segments) {
    totalDistanceMeters += seg.lengthMeters;
    totalDurationSeconds += seg.durationSeconds;
    cumulativeHeatExposure += seg.heatExposureDose;
    totalShadeSum += seg.effectiveShadePct * seg.lengthMeters;
    if (seg.isIndoorAC) indoorDistance += seg.lengthMeters;
    if (seg.perceivedHeatIndexC > peakPerceivedTempC) {
      peakPerceivedTempC = seg.perceivedHeatIndexC;
    }
  }

  // Count amenities along visited nodes
  for (const nodeId of result.pathNodeIds) {
    const node = nodeMap.get(nodeId);
    if (node?.poiType === 'water_fountain' || node?.poiType === 'cooling_hub') {
      waterStationsPassed += 1;
    }
    if (node?.poiType === 'shaded_bench' || node?.poiType === 'misting_station') {
      restPointsPassed += 1;
    }
  }

  const averageShadePct = totalDistanceMeters > 0 ? Math.round(totalShadeSum / totalDistanceMeters) : 0;
  const indoorPortionPct = totalDistanceMeters > 0 ? Math.round((indoorDistance / totalDistanceMeters) * 100) : 0;
  const avgPerceivedTempC = totalDurationSeconds > 0 ? Math.round((cumulativeHeatExposure / totalDurationSeconds) * 10) / 10 : 0;

  return {
    id,
    title,
    subtitle,
    color,
    pathNodes: result.pathNodeIds,
    segments: result.segments,
    totalDistanceMeters,
    totalDurationSeconds,
    cumulativeHeatExposure,
    avgPerceivedTempC,
    peakPerceivedTempC,
    averageShadePct,
    waterStationsPassed,
    restPointsPassed,
    indoorPortionPct
  };
}

/**
 * Generates all 3 route candidates for a given origin, destination, and environmental context
 */
export function calculateAllRoutes(
  startNodeId: string,
  endNodeId: string,
  env: EnvironmentalContext,
  walkSpeedMps: number = 1.3
): {
  fastest: RouteOption;
  coolest: RouteOption;
  balanced: RouteOption;
} | null {
  const fastestResult = dijkstra(startNodeId, endNodeId, env, 'fastest', walkSpeedMps);
  const coolestResult = dijkstra(startNodeId, endNodeId, env, 'coolest', walkSpeedMps);
  const balancedResult = dijkstra(startNodeId, endNodeId, env, 'balanced', walkSpeedMps);

  if (!fastestResult || !coolestResult || !balancedResult) {
    return null;
  }

  return {
    fastest: buildRouteOption(
      'fastest',
      'Fastest Route',
      'Direct path (Exposed blacktop & sun)',
      '#ef4444', // Red
      fastestResult
    ),
    coolest: buildRouteOption(
      'coolest',
      'Cool Canopy Corridor',
      'Maximized shade, trees & indoor AC',
      '#10b981', // Emerald Green
      coolestResult
    ),
    balanced: buildRouteOption(
      'balanced',
      'Balanced Route',
      'Optimal shade with minimal detour',
      '#0ea5e9', // Sky Blue
      balancedResult
    )
  };
}
