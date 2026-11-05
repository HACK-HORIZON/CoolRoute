import { GraphNode, GraphEdge, PresetScenario } from '../types';

// Anchor Center: Bhubaneswar Smart City, Odisha, India
// Center approx: Lat 20.2760, Lng 85.8350

export const CAMPUS_NODES: GraphNode[] = [
  {
    id: 'bbsr_master_canteen',
    name: 'Master Canteen (Station Square)',
    lat: 20.2668,
    lng: 85.8398,
    poiType: 'cooling_hub',
    poiDescription: 'Major multimodal transit hub with AC waiting lounges & chilled BMC Water ATM'
  },
  {
    id: 'bbsr_sriya_sq',
    name: 'Sriya Square (Janpath)',
    lat: 20.2740,
    lng: 85.8415,
    poiType: 'water_fountain',
    poiDescription: 'Commercial retail junction on Janpath with public water kiosk'
  },
  {
    id: 'bbsr_ram_mandir',
    name: 'Ram Mandir Square (Janpath)',
    lat: 20.2825,
    lng: 85.8436,
    poiType: 'cooling_hub',
    poiDescription: 'Central landmark on Janpath, temple shaded arcade & AC shopping complexes'
  },
  {
    id: 'bbsr_satya_nagar',
    name: 'Satya Nagar Junction',
    lat: 20.2885,
    lng: 85.8455,
    poiDescription: 'Janpath flyover corridor with exposed asphalt and heavy vehicle traffic'
  },
  {
    id: 'bbsr_saheed_nagar',
    name: 'Saheed Nagar Market & Park',
    lat: 20.2894,
    lng: 85.8492,
    poiType: 'shaded_bench',
    poiDescription: 'Shaded municipal park with dense banyan trees and public AC library'
  },
  {
    id: 'bbsr_vani_vihar',
    name: 'Utkal University (Vani Vihar)',
    lat: 20.3015,
    lng: 85.8525,
    poiType: 'shaded_bench',
    poiDescription: 'Lush 400-acre botanical campus with dense century tree canopies & chilled fountains'
  },
  {
    id: 'bbsr_ag_square',
    name: 'AG Square & Rabindra Mandap',
    lat: 20.2685,
    lng: 85.8320,
    poiType: 'water_fountain',
    poiDescription: 'Civic plaza with water refill kiosks and shaded pedestrian walkways'
  },
  {
    id: 'bbsr_ig_park',
    name: 'Indira Gandhi Park (Sachivalaya Marg)',
    lat: 20.2735,
    lng: 85.8312,
    poiType: 'shaded_bench',
    poiDescription: 'Beautiful 10-acre landscaped park with covered gazebos and continuous tree shade'
  },
  {
    id: 'bbsr_lok_seva_bhavan',
    name: 'Lok Seva Bhavan (State Secretariat)',
    lat: 20.2760,
    lng: 85.8305,
    poiType: 'indoor_ac',
    poiDescription: 'Administrative hub with double-avenue shaded arbor trees & air-conditioned visitor hall'
  },
  {
    id: 'bbsr_patel_marg',
    name: 'Patel Marg (Shastri Nagar)',
    lat: 20.2850,
    lng: 85.8280,
    poiType: 'shaded_bench',
    poiDescription: 'Tree-lined avenue connecting Sachivalaya Marg to residential gardens'
  },
  {
    id: 'bbsr_jayadev_vihar',
    name: 'Jayadev Vihar Overbridge Square',
    lat: 20.3005,
    lng: 85.8236,
    poiDescription: 'Major elevated highway interchange, exposed asphalt junction'
  },
  {
    id: 'bbsr_ekamra_kanan',
    name: 'Ekamra Kanan Botanical Gardens',
    lat: 20.3090,
    lng: 85.8095,
    poiType: 'cooling_hub',
    poiDescription: '500-acre botanical reserve with serene lake, micro-climate misting & forest canopy'
  },
  {
    id: 'bbsr_forest_park',
    name: 'Forest Park (Biju Patnaik Energy Park)',
    lat: 20.2585,
    lng: 85.8290,
    poiType: 'misting_station',
    poiDescription: 'Dense urban forest canopy with shaded rubber jogging trails and ambient misting'
  },
  {
    id: 'bbsr_capital_hospital',
    name: 'Capital Hospital (Unit-6)',
    lat: 20.2625,
    lng: 85.8210,
    poiType: 'water_fountain',
    poiDescription: 'Medical complex with 24/7 chilled water dispensers and heatstroke emergency care'
  },
  {
    id: 'bbsr_lingaraj_temple',
    name: 'Lingaraj Temple (Ekamra Kshetra Old Town)',
    lat: 20.2385,
    lng: 85.8335,
    poiType: 'shaded_bench',
    poiDescription: 'Ancient sandstone covered colonnades, cool temple courtyards & heritage shade'
  }
];

export const CAMPUS_EDGES: GraphEdge[] = [
  // ==========================================
  // 1. JANPATH ARTERIAL CORRIDOR (Fastest, High Sun/Asphalt Exposure)
  // Strictly follows Janpath road curves, never cuts through buildings
  // ==========================================
  {
    id: 'e_mc_to_sriya_janpath',
    source: 'bbsr_master_canteen',
    target: 'bbsr_sriya_sq',
    name: 'Janpath Road (South Section)',
    lengthMeters: 820,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.10, // Dark asphalt, high absorption
    treeCanopyCoverPct: 0.08,
    buildingShadeFactor: 0.15,
    isIndoorAC: false,
    coordinates: [
      [20.2668, 85.8398],
      [20.2685, 85.8402],
      [20.2705, 85.8407],
      [20.2725, 85.8411],
      [20.2740, 85.8415]
    ]
  },
  {
    id: 'e_sriya_to_ram_mandir_janpath',
    source: 'bbsr_sriya_sq',
    target: 'bbsr_ram_mandir',
    name: 'Janpath Road (Central Section)',
    lengthMeters: 960,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.11,
    treeCanopyCoverPct: 0.05,
    buildingShadeFactor: 0.12,
    isIndoorAC: false,
    coordinates: [
      [20.2740, 85.8415],
      [20.2762, 85.8420],
      [20.2785, 85.8426],
      [20.2805, 85.8431],
      [20.2825, 85.8436]
    ]
  },
  {
    id: 'e_ram_mandir_to_satya_nagar',
    source: 'bbsr_ram_mandir',
    target: 'bbsr_satya_nagar',
    name: 'Janpath Road (Satya Nagar Flyover)',
    lengthMeters: 700,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.09, // Severe heat island
    treeCanopyCoverPct: 0.02,
    buildingShadeFactor: 0.05,
    isIndoorAC: false,
    coordinates: [
      [20.2825, 85.8436],
      [20.2845, 85.8442],
      [20.2865, 85.8448],
      [20.2885, 85.8455]
    ]
  },
  {
    id: 'e_satya_nagar_to_vani_vihar',
    source: 'bbsr_satya_nagar',
    target: 'bbsr_vani_vihar',
    name: 'Janpath Extension towards Vani Vihar',
    lengthMeters: 1480,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.12,
    treeCanopyCoverPct: 0.10,
    buildingShadeFactor: 0.08,
    isIndoorAC: false,
    coordinates: [
      [20.2885, 85.8455],
      [20.2915, 85.8468],
      [20.2945, 85.8485],
      [20.2975, 85.8505],
      [20.3015, 85.8525]
    ]
  },

  // ==========================================
  // 2. RAJPATH & SACHIVALAYA MARG (Green Arbor Corridor - High Shade)
  // Lined with massive heritage rain trees, neat pedestrian walkways
  // ==========================================
  {
    id: 'e_mc_to_ag_rajpath',
    source: 'bbsr_master_canteen',
    target: 'bbsr_ag_square',
    name: 'Rajpath Avenue (Assembly Walk)',
    lengthMeters: 850,
    surfaceType: 'concrete',
    surfaceAlbedo: 0.32,
    treeCanopyCoverPct: 0.55,
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2668, 85.8398],
      [20.2670, 85.8380],
      [20.2673, 85.8360],
      [20.2677, 85.8340],
      [20.2685, 85.8320]
    ]
  },
  {
    id: 'e_ag_to_ig_park_sachivalaya',
    source: 'bbsr_ag_square',
    target: 'bbsr_ig_park',
    name: 'Sachivalaya Marg (IG Park Shaded Arbor)',
    lengthMeters: 580,
    surfaceType: 'concrete',
    surfaceAlbedo: 0.35,
    treeCanopyCoverPct: 0.78, // High canopy cover
    buildingShadeFactor: 0.40,
    isIndoorAC: false,
    coordinates: [
      [20.2685, 85.8320],
      [20.2700, 85.8318],
      [20.2718, 85.8315],
      [20.2735, 85.8312]
    ]
  },
  {
    id: 'e_ig_park_to_lok_seva',
    source: 'bbsr_ig_park',
    target: 'bbsr_lok_seva_bhavan',
    name: 'Sachivalaya Marg (Secretariat Promenade)',
    lengthMeters: 300,
    surfaceType: 'brick',
    surfaceAlbedo: 0.38,
    treeCanopyCoverPct: 0.85, // Very high tree canopy
    buildingShadeFactor: 0.45,
    isIndoorAC: false,
    coordinates: [
      [20.2735, 85.8312],
      [20.2748, 85.8308],
      [20.2760, 85.8305]
    ]
  },
  {
    id: 'e_lok_seva_to_patel_marg',
    source: 'bbsr_lok_seva_bhavan',
    target: 'bbsr_patel_marg',
    name: 'Sachivalaya Marg (North Shaded Avenue)',
    lengthMeters: 1040,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.22,
    treeCanopyCoverPct: 0.72,
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2760, 85.8305],
      [20.2785, 85.8298],
      [20.2815, 85.8290],
      [20.2850, 85.8280]
    ]
  },
  {
    id: 'e_patel_marg_to_jayadev',
    source: 'bbsr_patel_marg',
    target: 'bbsr_jayadev_vihar',
    name: 'Sachivalaya Marg to Jayadev Vihar',
    lengthMeters: 1750,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.18,
    treeCanopyCoverPct: 0.45,
    buildingShadeFactor: 0.20,
    isIndoorAC: false,
    coordinates: [
      [20.2850, 85.8280],
      [20.2885, 85.8270],
      [20.2925, 85.8258],
      [20.2965, 85.8246],
      [20.3005, 85.8236]
    ]
  },

  // ==========================================
  // 3. CROSS CONNECTORS (Following municipal roads between avenues)
  // ==========================================
  {
    id: 'e_ig_to_sriya_st_joseph',
    source: 'bbsr_ig_park',
    target: 'bbsr_sriya_sq',
    name: 'Vivekananda Marg (St. Joseph Shaded Way)',
    lengthMeters: 1080,
    surfaceType: 'brick',
    surfaceAlbedo: 0.30,
    treeCanopyCoverPct: 0.65,
    buildingShadeFactor: 0.35,
    isIndoorAC: false,
    coordinates: [
      [20.2735, 85.8312],
      [20.2737, 85.8340],
      [20.2738, 85.8375],
      [20.2739, 85.8400],
      [20.2740, 85.8415]
    ]
  },
  {
    id: 'e_lok_seva_to_ram_mandir',
    source: 'bbsr_lok_seva_bhavan',
    target: 'bbsr_ram_mandir',
    name: 'Unit-4 Shaded Market Road',
    lengthMeters: 1520,
    surfaceType: 'concrete',
    surfaceAlbedo: 0.32,
    treeCanopyCoverPct: 0.70,
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2760, 85.8305],
      [20.2768, 85.8340],
      [20.2780, 85.8380],
      [20.2800, 85.8410],
      [20.2825, 85.8436]
    ]
  },
  {
    id: 'e_patel_to_satya_nagar',
    source: 'bbsr_patel_marg',
    target: 'bbsr_satya_nagar',
    name: 'Bayababa Math Shaded Bypass',
    lengthMeters: 1860,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.20,
    treeCanopyCoverPct: 0.60,
    buildingShadeFactor: 0.25,
    isIndoorAC: false,
    coordinates: [
      [20.2850, 85.8280],
      [20.2858, 85.8325],
      [20.2868, 85.8375],
      [20.2878, 85.8420],
      [20.2885, 85.8455]
    ]
  },

  // ==========================================
  // 4. SAHEED NAGAR & UTKAL UNIVERSITY CAMPUS
  // ==========================================
  {
    id: 'e_ram_mandir_to_saheed_nagar',
    source: 'bbsr_ram_mandir',
    target: 'bbsr_saheed_nagar',
    name: 'Saheed Nagar Commercial Street',
    lengthMeters: 980,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.16,
    treeCanopyCoverPct: 0.40,
    buildingShadeFactor: 0.35,
    isIndoorAC: false,
    coordinates: [
      [20.2825, 85.8436],
      [20.2840, 85.8455],
      [20.2865, 85.8475],
      [20.2894, 85.8492]
    ]
  },
  {
    id: 'e_satya_nagar_to_saheed_nagar',
    source: 'bbsr_satya_nagar',
    target: 'bbsr_saheed_nagar',
    name: 'Saheed Nagar Cross Road',
    lengthMeters: 420,
    surfaceType: 'brick',
    surfaceAlbedo: 0.32,
    treeCanopyCoverPct: 0.50,
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2885, 85.8455],
      [20.2890, 85.8472],
      [20.2894, 85.8492]
    ]
  },
  {
    id: 'e_saheed_nagar_to_vani_vihar',
    source: 'bbsr_saheed_nagar',
    target: 'bbsr_vani_vihar',
    name: 'Vani Vihar Botanical Avenue',
    lengthMeters: 1420,
    surfaceType: 'brick',
    surfaceAlbedo: 0.35,
    treeCanopyCoverPct: 0.90, // Heavy century tree canopy
    buildingShadeFactor: 0.20,
    isIndoorAC: false,
    coordinates: [
      [20.2894, 85.8492],
      [20.2930, 85.8505],
      [20.2970, 85.8515],
      [20.3015, 85.8525]
    ]
  },

  // ==========================================
  // 5. JAYADEV VIHAR & EKAMRA KANAN
  // ==========================================
  {
    id: 'e_jayadev_to_ekamra_kanan',
    source: 'bbsr_jayadev_vihar',
    target: 'bbsr_ekamra_kanan',
    name: 'IRC Village Road to Ekamra Kanan',
    lengthMeters: 1780,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.24,
    treeCanopyCoverPct: 0.75, // Botanical greenery
    buildingShadeFactor: 0.25,
    isIndoorAC: false,
    coordinates: [
      [20.3005, 85.8236],
      [20.3025, 85.8200],
      [20.3050, 85.8160],
      [20.3072, 85.8125],
      [20.3090, 85.8095]
    ]
  },
  {
    id: 'e_jayadev_to_vani_vihar',
    source: 'bbsr_jayadev_vihar',
    target: 'bbsr_vani_vihar',
    name: 'Bidyut Marg / Acharya Vihar Corridor',
    lengthMeters: 3100,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.15,
    treeCanopyCoverPct: 0.35,
    buildingShadeFactor: 0.15,
    isIndoorAC: false,
    coordinates: [
      [20.3005, 85.8236],
      [20.2990, 85.8285],
      [20.2975, 85.8340],
      [20.2980, 85.8410],
      [20.2995, 85.8470],
      [20.3015, 85.8525]
    ]
  },

  // ==========================================
  // 6. FOREST PARK, CAPITAL HOSPITAL & OLD TOWN
  // ==========================================
  {
    id: 'e_mc_to_forest_park',
    source: 'bbsr_master_canteen',
    target: 'bbsr_forest_park',
    name: 'Bapuji Nagar to Forest Park Road',
    lengthMeters: 1450,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.20,
    treeCanopyCoverPct: 0.45,
    buildingShadeFactor: 0.35,
    isIndoorAC: false,
    coordinates: [
      [20.2668, 85.8398],
      [20.2645, 85.8375],
      [20.2625, 85.8345],
      [20.2605, 85.8320],
      [20.2585, 85.8290]
    ]
  },
  {
    id: 'e_ag_to_forest_park',
    source: 'bbsr_ag_square',
    target: 'bbsr_forest_park',
    name: 'Udyan Marg (Forest Park North Shaded Trail)',
    lengthMeters: 1200,
    surfaceType: 'brick',
    surfaceAlbedo: 0.36,
    treeCanopyCoverPct: 0.88, // Lush continuous tree canopy
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2685, 85.8320],
      [20.2660, 85.8315],
      [20.2635, 85.8310],
      [20.2610, 85.8302],
      [20.2585, 85.8290]
    ]
  },
  {
    id: 'e_forest_park_to_hospital',
    source: 'bbsr_forest_park',
    target: 'bbsr_capital_hospital',
    name: 'Hospital Road (Unit-6 Shaded Link)',
    lengthMeters: 920,
    surfaceType: 'concrete',
    surfaceAlbedo: 0.34,
    treeCanopyCoverPct: 0.70,
    buildingShadeFactor: 0.30,
    isIndoorAC: false,
    coordinates: [
      [20.2585, 85.8290],
      [20.2595, 85.8260],
      [20.2610, 85.8235],
      [20.2625, 85.8210]
    ]
  },
  {
    id: 'e_hospital_to_ag',
    source: 'bbsr_capital_hospital',
    target: 'bbsr_ag_square',
    name: 'Unit-6 to AG Square Avenue',
    lengthMeters: 1320,
    surfaceType: 'asphalt',
    surfaceAlbedo: 0.22,
    treeCanopyCoverPct: 0.50,
    buildingShadeFactor: 0.25,
    isIndoorAC: false,
    coordinates: [
      [20.2625, 85.8210],
      [20.2645, 85.8245],
      [20.2665, 85.8280],
      [20.2685, 85.8320]
    ]
  },
  {
    id: 'e_forest_park_to_lingaraj',
    source: 'bbsr_forest_park',
    target: 'bbsr_lingaraj_temple',
    name: 'Old Town Heritage Way (Lewis Road & Bindu Sagar)',
    lengthMeters: 2350,
    surfaceType: 'brick',
    surfaceAlbedo: 0.32,
    treeCanopyCoverPct: 0.65,
    buildingShadeFactor: 0.45,
    isIndoorAC: false,
    coordinates: [
      [20.2585, 85.8290],
      [20.2530, 85.8315],
      [20.2475, 85.8335],
      [20.2425, 85.8340],
      [20.2385, 85.8335]
    ]
  }
];

// Presets tailored to Bhubaneswar urban commute scenarios
export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'sc_janpath_commute',
    title: 'Janpath Heat Corridor vs. Sachivalaya Arbor',
    description: 'Master Canteen to Ram Mandir: Exposed blacktop vs. Shaded Government Arbor & AC Mall atriums',
    originNodeId: 'bbsr_master_canteen',
    destinationNodeId: 'bbsr_ram_mandir',
    recommendedTime: 810 // 1:30 PM (Peak Solar Scorch)
  },
  {
    id: 'sc_green_sanctuary',
    title: 'Urban Forest Walk: Forest Park to Secretariat',
    description: 'Biju Patnaik Park through Udyan Marg shaded tree trails to Lok Seva Bhavan',
    originNodeId: 'bbsr_forest_park',
    destinationNodeId: 'bbsr_lok_seva_bhavan',
    recommendedTime: 720 // 12:00 PM
  },
  {
    id: 'sc_university_trail',
    title: 'Campus Stroll: Ram Mandir to Utkal University',
    description: 'Janpath asphalt highway vs. Saheed Nagar tree canopy & botanical gardens',
    originNodeId: 'bbsr_ram_mandir',
    destinationNodeId: 'bbsr_vani_vihar',
    recommendedTime: 870 // 2:30 PM
  }
];

// Visual canopy circles for Bhubaneswar green zones
export const CANOPY_ZONES = [
  {
    name: 'Ekamra Kanan Botanical Sanctuary',
    center: [20.3090, 85.8095] as [number, number],
    radiusMeters: 550,
    density: 0.95
  },
  {
    name: 'Forest Park (Biju Patnaik Energy Park)',
    center: [20.2585, 85.8290] as [number, number],
    radiusMeters: 450,
    density: 0.92
  },
  {
    name: 'Indira Gandhi Park & Secretariat Arbor',
    center: [20.2735, 85.8312] as [number, number],
    radiusMeters: 380,
    density: 0.85
  },
  {
    name: 'Utkal University Century Groves',
    center: [20.3015, 85.8525] as [number, number],
    radiusMeters: 500,
    density: 0.88
  },
  {
    name: 'Saheed Nagar Shaded Municipal Park',
    center: [20.2894, 85.8492] as [number, number],
    radiusMeters: 280,
    density: 0.78
  }
];

// High radiant heat islands in Bhubaneswar
export const HEAT_ISLAND_ZONES = [
  {
    name: 'Satya Nagar Janpath Flyover Blacktop',
    center: [20.2885, 85.8455] as [number, number],
    radiusMeters: 260,
    surfaceType: 'Direct Exposed Asphalt'
  },
  {
    name: 'Jayadev Vihar Concrete Highway Interchange',
    center: [20.3005, 85.8236] as [number, number],
    radiusMeters: 320,
    surfaceType: 'Unshaded Elevated Concrete & Asphalt'
  },
  {
    name: 'Master Canteen Bus Stand & Parking Lot',
    center: [20.2668, 85.8398] as [number, number],
    radiusMeters: 220,
    surfaceType: 'Dense Vehicular Bitumen Asphalt'
  }
];
