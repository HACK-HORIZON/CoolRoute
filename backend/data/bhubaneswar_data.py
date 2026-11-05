from typing import List, Dict, Any

CANOPY_ZONES: List[Dict[str, Any]] = [
    {"name": "Ekamra Kanan Botanical Reserve", "center": [20.3015, 85.8115], "radiusMeters": 650, "density": 0.88},
    {"name": "Biju Patnaik Forest Park", "center": [20.2635, 85.8285], "radiusMeters": 480, "density": 0.85},
    {"name": "Sachivalaya Marg Tree Canopy Arbor", "center": [20.2820, 85.8340], "radiusMeters": 380, "density": 0.72},
    {"name": "Indira Gandhi Park Boulevard", "center": [20.2705, 85.8360], "radiusMeters": 320, "density": 0.75},
    {"name": "OUAT Agricultural Forestry & Orchards", "center": [20.2640, 85.8120], "radiusMeters": 550, "density": 0.80},
    {"name": "Regional Museum of Natural History Green Belt", "center": [20.2980, 85.8270], "radiusMeters": 350, "density": 0.70},
    {"name": "Kharavela Park & Khandagiri Hills Buffer", "center": [20.2610, 85.7870], "radiusMeters": 600, "density": 0.78},
    {"name": "Chandaka Forest Edge Buffer", "center": [20.3350, 85.7850], "radiusMeters": 900, "density": 0.92},
]

HEAT_ISLAND_ZONES: List[Dict[str, Any]] = [
    {"name": "Janpath Highway & Commercial Strip", "center": [20.2770, 85.8440], "radiusMeters": 500, "tempOffsetC": 7.5},
    {"name": "Satya Nagar Flyover Blacktop", "center": [20.2855, 85.8475], "radiusMeters": 350, "tempOffsetC": 8.0},
    {"name": "Vani Vihar Interchange & NH16 Overpass", "center": [20.3020, 85.8520], "radiusMeters": 450, "tempOffsetC": 8.5},
    {"name": "Rasulgarh Industrial & Freight Junction", "center": [20.2930, 85.8670], "radiusMeters": 550, "tempOffsetC": 9.0},
    {"name": "Baramunda Bus Terminal Concrete Pad", "center": [20.2780, 85.7950], "radiusMeters": 400, "tempOffsetC": 7.0},
    {"name": "Bhubaneswar Railway Station Approach & Blacktop", "center": [20.2660, 85.8430], "radiusMeters": 380, "tempOffsetC": 6.8},
]

BHUBANESWAR_POIS: List[Dict[str, Any]] = [
    {"name": "Master Canteen (Station Square)", "category": "hub", "lat": 20.2662, "lng": 85.8436, "address": "Master Canteen Square, Kharvela Nagar"},
    {"name": "Ram Mandir Square", "category": "hub", "lat": 20.2778, "lng": 85.8438, "address": "Janpath Road, Unit 3"},
    {"name": "Vani Vihar (Utkal University)", "category": "education", "lat": 20.3015, "lng": 85.8508, "address": "NH-16, Vani Vihar"},
    {"name": "Lok Seva Bhavan (State Secretariat)", "category": "admin", "lat": 20.2755, "lng": 85.8285, "address": "Sachivalaya Marg, Unit 2"},
    {"name": "Forest Park (Biju Patnaik Park)", "category": "park", "lat": 20.2635, "lng": 85.8285, "address": "Forest Park, Unit 1"},
    {"name": "Ekamra Kanan Botanical Gardens", "category": "park", "lat": 20.3015, "lng": 85.8115, "address": "Nayapalli, IRC Village"},
    {"name": "AIIMS Bhubaneswar", "category": "hospital", "lat": 20.2312, "lng": 85.7765, "address": "Sijua, Patrapada"},
    {"name": "KIMS Hospital & University", "category": "hospital", "lat": 20.3542, "lng": 85.8175, "address": "KIIT Road, Patia"},
    {"name": "Apollo Hospitals", "category": "hospital", "lat": 20.3055, "lng": 85.8290, "address": "Sainik School Road, Unit 15"},
    {"name": "SUM Hospital", "category": "hospital", "lat": 20.2795, "lng": 85.7685, "address": "Kalinga Nagar, Ghatikia"},
    {"name": "Esplanade One Mall", "category": "mall", "lat": 20.2910, "lng": 85.8655, "address": "Rasulgarh Square"},
    {"name": "DN Regalia Mall", "category": "mall", "lat": 20.2285, "lng": 85.7485, "address": "South City, Patrapada"},
    {"name": "Royal Lagoon Apartments", "category": "building", "lat": 20.3585, "lng": 85.8190, "address": "Patia, Infocity Road"},
    {"name": "Cosmopolis Society", "category": "building", "lat": 20.2845, "lng": 85.7690, "address": "Khandagiri - Chandaka Road"},
    {"name": "Z1 Apartments", "category": "building", "lat": 20.3470, "lng": 85.7995, "address": "Nandan Kanan Road, Raghunathpur"},
    {"name": "Kharavela Nagar", "category": "hub", "lat": 20.2710, "lng": 85.8450, "address": "Unit 3, Near Janpath"},
    {"name": "Saheed Nagar", "category": "hub", "lat": 20.2890, "lng": 85.8480, "address": "Commercial District, Janpath"},
    {"name": "Nayapalli (IRC Village)", "category": "hub", "lat": 20.2985, "lng": 85.8210, "address": "Near ISKCON Temple"},
    {"name": "Patia (Infocity Hub)", "category": "hub", "lat": 20.3550, "lng": 85.8180, "address": "IT & Education Corridor"},
    {"name": "Jayadev Vihar Square", "category": "hub", "lat": 20.2970, "lng": 85.8250, "address": "Intersection of Bidyut Marg & Nandankanan Rd"},
    {"name": "Acharya Vihar Square", "category": "hub", "lat": 20.2950, "lng": 85.8390, "address": "Near RRL & Science Park"},
    {"name": "Lingaraj Temple", "category": "heritage", "lat": 20.2382, "lng": 85.8338, "address": "Old Town Heritage Area"},
]

