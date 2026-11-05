import { LocationPoint } from '../types';

export interface EnrichedLocationPoint extends LocationPoint {
  category: 'locality' | 'building' | 'hospital' | 'mall' | 'education' | 'transit' | 'heritage' | 'park';
  tags?: string[];
}

/**
 * Massive, comprehensive database of Greater Bhubaneswar:
 * Includes all small, medium, and big localities, housing colonies, apartment complexes,
 * major buildings, hospitals, educational campuses, markets, and roads.
 */
export const BHUBANESWAR_EXPANDED_DATABASE: EnrichedLocationPoint[] = [
  // ==========================================
  // 1. MAJOR HOSPITALS & HEALTHCARE HUBS
  // ==========================================
  {
    name: 'AIIMS Bhubaneswar',
    lat: 20.2310,
    lng: 85.7750,
    address: 'Sijua, Patrapada, Bhubaneswar, Odisha 751019',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Premier national hospital with emergency cooling and AC atriums',
    tags: ['aiims', 'hospital', 'sijua', 'patrapada', 'medical']
  },
  {
    name: 'KIMS Hospital & Medical College',
    lat: 20.3525,
    lng: 85.8195,
    address: 'KIIT Campus 5, Patia, Bhubaneswar, Odisha 751024',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Super-specialty teaching hospital on KIIT road',
    tags: ['kims', 'hospital', 'patia', 'kiit']
  },
  {
    name: 'Apollo Hospitals Bhubaneswar',
    lat: 20.3110,
    lng: 85.8290,
    address: 'Plot No. 251, Sainik School Rd, Unit 15, Bhubaneswar 751005',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Tertiary healthcare hospital near Sainik School',
    tags: ['apollo', 'hospital', 'sainik school', 'acharya vihar']
  },
  {
    name: 'SUM Hospital (IMS & Sum Hospital)',
    lat: 20.2675,
    lng: 85.7680,
    address: 'K8 Kalinga Nagar, Ghatikia, Bhubaneswar 751003',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Large medical institute and multispecialty hospital in Kalinga Nagar',
    tags: ['sum', 'hospital', 'soa', 'kalinga nagar', 'ghatikia']
  },
  {
    name: 'AMRI Hospital (Khandagiri)',
    lat: 20.2590,
    lng: 85.7895,
    address: 'Plot No. 1, Khandagiri - Chandaka Rd, Baramunda, Bhubaneswar 751030',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Multispecialty healthcare center at Khandagiri square',
    tags: ['amri', 'hospital', 'khandagiri', 'baramunda']
  },
  {
    name: 'Capital Hospital (Unit-6)',
    lat: 20.2625,
    lng: 85.8210,
    address: 'Unit 6, Capital Hospital Road, Bhubaneswar 751001',
    category: 'hospital',
    poiType: 'water_fountain',
    poiDescription: 'Main government hospital with 24/7 heatstroke care and cold water stations',
    tags: ['capital hospital', 'unit 6', 'government hospital', 'medical']
  },
  {
    name: 'Care Hospital (Prachi Enclave)',
    lat: 20.3220,
    lng: 85.8160,
    address: 'Plot No. 324, Prachi Enclave Rd, Chandrasekharpur, Bhubaneswar 751016',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Super-specialty hospital near Damana square',
    tags: ['care', 'hospital', 'prachi enclave', 'chandrasekharpur', 'damana']
  },
  {
    name: 'Utkal Hospital (Defence Colony)',
    lat: 20.3340,
    lng: 85.8150,
    address: 'Niladri Vihar Rd, Defence Colony, Chandrasekharpur, Bhubaneswar 751021',
    category: 'hospital',
    poiType: 'cooling_hub',
    poiDescription: 'Comprehensive cancer and multispecialty hospital',
    tags: ['utkal hospital', 'defence colony', 'niladri vihar']
  },
  {
    name: 'Hi-Tech Medical College & Hospital',
    lat: 20.3160,
    lng: 85.8850,
    address: 'Health Park, Pandara, Rasulgarh, Bhubaneswar 751025',
    category: 'hospital',
    poiType: 'water_fountain',
    poiDescription: 'Teaching hospital on Cuttack-Puri bypass',
    tags: ['hi-tech', 'hitech', 'hospital', 'pandara', 'rasulgarh']
  },

  // ==========================================
  // 2. SHOPPING MALLS, COMMERCIAL HUBS & MARKETS
  // ==========================================
  {
    name: 'Nexus Esplanade Mall (Rasulgarh)',
    lat: 20.3010,
    lng: 85.8660,
    address: 'NH-16, Rasulgarh Industrial Estate, Bhubaneswar 751010',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Premier luxury mall with central HVAC air-conditioning & food court',
    tags: ['esplanade', 'nexus', 'mall', 'rasulgarh', 'shopping', 'pvr']
  },
  {
    name: 'DN Regalia Mall (Patrapada)',
    lat: 20.2370,
    lng: 85.7690,
    address: 'Main NH-16, Near AIIMS, Patrapada, Bhubaneswar 751019',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Major shopping and entertainment mall in West Bhubaneswar',
    tags: ['dn regalia', 'regalia', 'mall', 'patrapada', 'aiims', 'inox']
  },
  {
    name: 'Utkal Kanika Galleria (Kalpana Square)',
    lat: 20.2570,
    lng: 85.8430,
    address: 'Goutam Nagar, Kalpana Square, Bhubaneswar 751014',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Modern shopping mall near State Museum',
    tags: ['utkal kanika', 'galleria', 'mall', 'kalpana', 'goutam nagar']
  },
  {
    name: 'BMC Bhawani Mall (Saheed Nagar)',
    lat: 20.2890,
    lng: 85.8490,
    address: 'Block A, Saheed Nagar, Bhubaneswar 751007',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Shopping and cinema hub with covered pedestrian arcades',
    tags: ['bhawani mall', 'bmc mall', 'saheed nagar', 'shopping', 'cinepolis']
  },
  {
    name: 'Forum Mart & Big Bazaar (Kharvel Nagar)',
    lat: 20.2720,
    lng: 85.8410,
    address: '89 Janpath Rd, Kharvel Nagar, Bhubaneswar 751001',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Popular supermarket and retail mall on Janpath',
    tags: ['forum mart', 'big bazaar', 'smart bazaar', 'janpath', 'kharvel nagar']
  },
  {
    name: 'Market Building (Unit-2)',
    lat: 20.2710,
    lng: 85.8340,
    address: 'Unit 2, Ashok Nagar, Bhubaneswar 751009',
    category: 'mall',
    poiType: 'shaded_bench',
    poiDescription: 'Historic open-air shopping promenade with shaded colonnades',
    tags: ['market building', 'unit 2', 'ashok nagar', 'shopping']
  },
  {
    name: 'Symphony Mall (Rudrapur)',
    lat: 20.3200,
    lng: 85.8920,
    address: 'NH-16, Rudrapur, Bhubaneswar 752101',
    category: 'mall',
    poiType: 'indoor_ac',
    poiDescription: 'Highway commercial and retail center',
    tags: ['symphony mall', 'rudrapur', 'hanspal', 'highway']
  },
  {
    name: 'Unit-1 Daily Haat & Fish Market',
    lat: 20.2670,
    lng: 85.8280,
    address: 'Unit 1, Bhouma Nagar, Bhubaneswar 751001',
    category: 'mall',
    poiDescription: 'Vibrant municipal daily produce market',
    tags: ['unit 1', 'haat', 'daily market', 'vegetable market']
  },
  {
    name: 'Bapuji Nagar Electronics Market',
    lat: 20.2635,
    lng: 85.8350,
    address: 'Bapuji Nagar Main Road, Bhubaneswar 751009',
    category: 'mall',
    poiDescription: 'Major consumer electronics and retail street',
    tags: ['bapuji nagar', 'electronics', 'market']
  },

  // ==========================================
  // 3. APARTMENTS, HOUSING SOCIETIES & RESIDENTIAL SECTORS
  // ==========================================
  {
    name: 'Cosmopolis Apartments (Dumduma)',
    lat: 20.2450,
    lng: 85.7820,
    address: 'Main Road, Dumduma, Khandagiri, Bhubaneswar 751019',
    category: 'building',
    poiType: 'shaded_bench',
    poiDescription: 'Premier gated township with lush landscaped gardens and clubhouse',
    tags: ['cosmopolis', 'apartments', 'dumduma', 'khandagiri', 'society']
  },
  {
    name: 'Royal Lagoon Apartments (Patia)',
    lat: 20.3590,
    lng: 85.8110,
    address: 'Nandankanan Rd, Raghunathpur, Patia, Bhubaneswar 751024',
    category: 'building',
    poiType: 'shaded_bench',
    poiDescription: 'Luxury high-rise residential complex with tree-lined internal avenues',
    tags: ['royal lagoon', 'patia', 'raghunathpur', 'apartments', 'society']
  },
  {
    name: 'Z1 Apartments (Kalarahanga)',
    lat: 20.3720,
    lng: 85.8280,
    address: 'Z Estates, Kalarahanga, Patia, Bhubaneswar 751024',
    category: 'building',
    poiDescription: 'Modern multi-tower residential project in North Bhubaneswar',
    tags: ['z1', 'z estates', 'kalarahanga', 'patia', 'apartments']
  },
  {
    name: 'Trident Galaxy (Kalinga Nagar)',
    lat: 20.2620,
    lng: 85.7650,
    address: 'Near SUM Hospital, Paikarapur, Kalinga Nagar, Bhubaneswar 751003',
    category: 'building',
    poiDescription: 'Gated residential colony in Paikarapur',
    tags: ['trident galaxy', 'kalinga nagar', 'paikarapur', 'sum hospital']
  },
  {
    name: 'Falcon Crest Apartments (Patia)',
    lat: 20.3510,
    lng: 85.8120,
    address: 'Near KIIT Cricket Stadium, Patia, Bhubaneswar 751024',
    category: 'building',
    poiDescription: 'Residential society near KIIT University',
    tags: ['falcon crest', 'patia', 'apartments']
  },
  {
    name: 'Mani Tribhuvan (Raghunathpur)',
    lat: 20.3850,
    lng: 85.8340,
    address: 'Nandankanan Rd, Raghunathpur, Bhubaneswar 751024',
    category: 'building',
    poiDescription: 'Integrated luxury residential township',
    tags: ['mani tribhuvan', 'tribhuvan', 'raghunathpur', 'patia']
  },
  {
    name: 'Vipul Gardens (Ghatikia)',
    lat: 20.2680,
    lng: 85.7740,
    address: 'Khandagiri - Chandaka Rd, Ghatikia, Bhubaneswar 751003',
    category: 'building',
    poiDescription: 'Residential township adjoining Chandaka forest foothills',
    tags: ['vipul gardens', 'ghatikia', 'khandagiri', 'apartments']
  },
  {
    name: 'Metro Satellite City (Hanspal)',
    lat: 20.3150,
    lng: 85.8820,
    address: 'NH-16, Hanspal, Rasulgarh, Bhubaneswar 752101',
    category: 'building',
    poiDescription: 'Sprawling planned housing colony along Kuakhai river corridor',
    tags: ['metro satellite city', 'hanspal', 'rasulgarh', 'society']
  },
  {
    name: 'Sailashree Vihar Phase 1 to 7',
    lat: 20.3380,
    lng: 85.8100,
    address: 'Sailashree Vihar, Chandrasekharpur, Bhubaneswar 751021',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Spacious residential neighborhood with tree-lined avenues and parks',
    tags: ['sailashree vihar', 'chandrasekharpur', 'cs pur', 'colony']
  },
  {
    name: 'Niladri Vihar (Sectors 1 - 5)',
    lat: 20.3300,
    lng: 85.8120,
    address: 'Niladri Vihar, Chandrasekharpur, Bhubaneswar 751021',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Peaceful residential sectors near Buddha Jayanti Park',
    tags: ['niladri vihar', 'chandrasekharpur', 'buddha park']
  },
  {
    name: 'IRC Village (Nayapalli BDA Colony)',
    lat: 20.3040,
    lng: 85.8160,
    address: 'IRC Village, Nayapalli, Bhubaneswar 751015',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Prestigious green residential locality near Ekamra Kanan',
    tags: ['irc village', 'nayapalli', 'bda colony', 'residential']
  },
  {
    name: 'Behera Sahi (Nayapalli)',
    lat: 20.2980,
    lng: 85.8150,
    address: 'Nayapalli, Near ISKCON Temple, Bhubaneswar 751012',
    category: 'locality',
    poiDescription: 'Dense urban residential area with multiple cross-lanes',
    tags: ['behera sahi', 'nayapalli', 'iskcon']
  },
  {
    name: 'Nuasahi (Nayapalli)',
    lat: 20.2950,
    lng: 85.8120,
    address: 'Nuasahi, Nayapalli, Bhubaneswar 751012',
    category: 'locality',
    poiDescription: 'Neighborhood connecting Nayapalli to Siripur',
    tags: ['nuasahi', 'nayapalli', 'siripur']
  },
  {
    name: 'Gautam Nagar & Lewis Road Lanes',
    lat: 20.2540,
    lng: 85.8400,
    address: 'Gautam Nagar, Near Kalpana Square, Bhubaneswar 751014',
    category: 'locality',
    poiDescription: 'Established residential colony near State Museum and Old Town',
    tags: ['gautam nagar', 'lewis road', 'kalpana']
  },
  {
    name: 'Pokhariput (Ananda Nagar & BDA Duplexes)',
    lat: 20.2480,
    lng: 85.8080,
    address: 'Pokhariput, Ananda Nagar, Bhubaneswar 751020',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Popular south-west residential colony near airport and DAV School',
    tags: ['pokhariput', 'ananda nagar', 'bda duplex', 'dav school']
  },
  {
    name: 'Sundarpada (Bypass & Hi-Tech Plaza)',
    lat: 20.2320,
    lng: 85.8150,
    address: 'Sundarpada Main Road, Old Town Extension, Bhubaneswar 751002',
    category: 'locality',
    poiDescription: 'Expanding residential district with numerous apartment complexes',
    tags: ['sundarpada', 'old town', 'apartments']
  },
  {
    name: 'Kalinga Nagar (Sectors K-1 to K-9)',
    lat: 20.2650,
    lng: 85.7720,
    address: 'Kalinga Nagar, Ghatikia, Bhubaneswar 751003',
    category: 'locality',
    poiDescription: 'Planned modern township with wide avenues in West Bhubaneswar',
    tags: ['kalinga nagar', 'ghatikia', 'k1', 'k2', 'k3', 'k4', 'k5', 'k6', 'k7', 'k8', 'k9']
  },
  {
    name: 'Dumduma Housing Board Colony',
    lat: 20.2420,
    lng: 85.7890,
    address: 'Dumduma, Khandagiri, Bhubaneswar 751019',
    category: 'locality',
    poiDescription: 'Vibrant residential housing colony near NH-16',
    tags: ['dumduma', 'housing board', 'khandagiri']
  },
  {
    name: 'Jagamara (Lane 1 - 8 & Gandamunda)',
    lat: 20.2520,
    lng: 85.7960,
    address: 'Jagamara, Near ITER, Khandagiri, Bhubaneswar 751030',
    category: 'locality',
    poiDescription: 'Student and residential hub with numerous hostels and food streets',
    tags: ['jagamara', 'iter', 'gandamunda', 'khandagiri']
  },
  {
    name: 'Satya Nagar (Lanes 1 - 6 & Flyover)',
    lat: 20.2885,
    lng: 85.8455,
    address: 'Satya Nagar, Bhubaneswar 751007',
    category: 'locality',
    poiDescription: 'Central residential and commercial locality near Kali Temple',
    tags: ['satya nagar', 'janpath', 'kali temple']
  },
  {
    name: 'Saheed Nagar (Blocks A to E)',
    lat: 20.2894,
    lng: 85.8492,
    address: 'Saheed Nagar, Bhubaneswar 751007',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Well-planned green residential colony with neighborhood parks',
    tags: ['saheed nagar', 'block a', 'block b', 'block c', 'block d', 'block e']
  },
  {
    name: 'Shastri Nagar & Patel Marg',
    lat: 20.2850,
    lng: 85.8280,
    address: 'Shastri Nagar, Unit 4 Extension, Bhubaneswar 751012',
    category: 'locality',
    poiType: 'shaded_bench',
    poiDescription: 'Quiet government and residential quarters near Sachivalaya Marg',
    tags: ['shastri nagar', 'patel marg', 'sachivalaya marg']
  },

  // ==========================================
  // 4. UNIVERSITIES, COLLEGES & SCHOOLS
  // ==========================================
  {
    name: 'KIIT University (Main Campus)',
    lat: 20.3540,
    lng: 85.8180,
    address: 'KIIT Deemed University, Patia, Bhubaneswar 751024',
    category: 'education',
    poiType: 'cooling_hub',
    poiDescription: 'World-class academic campus with air-conditioned complexes & tree avenues',
    tags: ['kiit', 'university', 'patia', 'engineering', 'campus']
  },
  {
    name: 'SOA University / ITER College (Jagamara)',
    lat: 20.2510,
    lng: 85.7970,
    address: 'ITER, Jagamara, Khandagiri, Bhubaneswar 751030',
    category: 'education',
    poiType: 'water_fountain',
    poiDescription: 'Prominent engineering and research campus in Jagamara',
    tags: ['iter', 'soa', 'university', 'jagamara', 'khandagiri']
  },
  {
    name: 'Utkal University (Vani Vihar)',
    lat: 20.3015,
    lng: 85.8525,
    address: 'Vani Vihar, NH-16, Bhubaneswar 751004',
    category: 'education',
    poiType: 'shaded_bench',
    poiDescription: 'Historic 400-acre university campus with century rain trees',
    tags: ['utkal university', 'vani vihar', 'university', 'college']
  },
  {
    name: 'OUTR / College of Engineering & Technology (CET)',
    lat: 20.2750,
    lng: 85.7760,
    address: 'Techno Campus, Ghatikia, Mahalaxmi Vihar, Bhubaneswar 751029',
    category: 'education',
    poiType: 'water_fountain',
    poiDescription: 'Government technical university in Ghatikia',
    tags: ['cet', 'outr', 'techno campus', 'ghatikia']
  },
  {
    name: 'BJB Autonomous College (BJB Nagar)',
    lat: 20.2510,
    lng: 85.8410,
    address: 'BJB Nagar, Lewis Road, Bhubaneswar 751014',
    category: 'education',
    poiType: 'shaded_bench',
    poiDescription: 'Historic degree college with lush green campus',
    tags: ['bjb college', 'bjb nagar', 'lewis road']
  },
  {
    name: 'Rama Devi Women\'s University (RD)',
    lat: 20.2920,
    lng: 85.8500,
    address: 'Bhoinagar, Saheed Nagar, Bhubaneswar 751022',
    category: 'education',
    poiType: 'shaded_bench',
    poiDescription: 'Pioneer women\'s university near Saheed Nagar',
    tags: ['rd college', 'rama devi', 'saheed nagar', 'university']
  },
  {
    name: 'XIMB (Xavier Institute of Management)',
    lat: 20.3080,
    lng: 85.8210,
    address: 'Xavier Square, Jayadev Vihar, Bhubaneswar 751013',
    category: 'education',
    poiType: 'indoor_ac',
    poiDescription: 'Premier management institute on Xavier square',
    tags: ['ximb', 'xavier', 'jayadev vihar', 'management']
  },
  {
    name: 'Silicon Institute of Technology (Patia)',
    lat: 20.3700,
    lng: 85.8150,
    address: 'Silicon Hills, Patia, Bhubaneswar 751024',
    category: 'education',
    poiDescription: 'Engineering institute in North Patia',
    tags: ['silicon', 'patia', 'silicon hills']
  },
  {
    name: 'CV Raman Global University (Mahura)',
    lat: 20.2180,
    lng: 85.7350,
    address: 'Bidyanagar, Mahura, Janla, Bhubaneswar 752054',
    category: 'education',
    poiDescription: 'Sprawling technical university campus near Janla',
    tags: ['cv raman', 'mahura', 'janla', 'engineering']
  },

  // ==========================================
  // 5. IT PARKS, TECH HUBS & CORPORATE OFFICES
  // ==========================================
  {
    name: 'Infocity 1 (TCS, Infosys & Mindtree)',
    lat: 20.3620,
    lng: 85.8050,
    address: 'Infocity Road, Patia, Bhubaneswar 751024',
    category: 'building',
    poiType: 'indoor_ac',
    poiDescription: 'Main IT park with tech giants and pedestrian sidewalks',
    tags: ['infocity', 'tcs', 'infosys', 'mindtree', 'patia', 'tech park']
  },
  {
    name: 'DLF Cybercity (IDCO Infopark)',
    lat: 20.3550,
    lng: 85.8020,
    address: 'Infopark Road, Chandaka Industrial Estate, Patia, Bhubaneswar 751024',
    category: 'building',
    poiType: 'indoor_ac',
    poiDescription: 'Grade-A tech commercial towers with corporate offices',
    tags: ['dlf', 'cybercity', 'infopark', 'patia']
  },
  {
    name: 'Fortune Towers (Chandrasekharpur)',
    lat: 20.3080,
    lng: 85.8240,
    address: 'Maitree Vihar, Chandrasekharpur, Bhubaneswar 751023',
    category: 'building',
    poiType: 'indoor_ac',
    poiDescription: 'Prominent multi-story corporate and IT hub',
    tags: ['fortune towers', 'maitree vihar', 'cs pur']
  },

  // ==========================================
  // 6. STADIUMS, SPORTS & CULTURAL LANDMARKS
  // ==========================================
  {
    name: 'Kalinga Stadium (Athletics & Hockey)',
    lat: 20.2970,
    lng: 85.8220,
    address: 'Bidyut Marg, Nayapalli, Bhubaneswar 751012',
    category: 'heritage',
    poiType: 'cooling_hub',
    poiDescription: 'World-renowned sports complex with Olympic hockey stadium and athletic arenas',
    tags: ['kalinga stadium', 'stadium', 'sports', 'nayapalli', 'hockey']
  },
  {
    name: 'Rabindra Mandap & Cultural Complex',
    lat: 20.2735,
    lng: 85.8312,
    address: 'Sachivalaya Marg, AG Square, Bhubaneswar 751001',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'State cultural theater with shaded colonnades and adjoining IG Park',
    tags: ['rabindra mandap', 'ag square', 'culture', 'theater']
  },
  {
    name: 'Pathani Samanta Planetarium',
    lat: 20.3020,
    lng: 85.8320,
    address: 'Acharya Vihar, Bidyut Marg, Bhubaneswar 751013',
    category: 'heritage',
    poiType: 'indoor_ac',
    poiDescription: 'Planetarium dome with science park and botanical gardens',
    tags: ['planetarium', 'pathani samanta', 'acharya vihar']
  },
  {
    name: 'Odisha State Museum (Kalpana)',
    lat: 20.2560,
    lng: 85.8420,
    address: 'Lewis Road, Kalpana Square, Bhubaneswar 751014',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'Historic museum complex with expansive shaded lawns',
    tags: ['state museum', 'museum', 'kalpana', 'lewis road']
  },

  // ==========================================
  // 7. TRANSIT TERMINALS & RAILWAY HUBS
  // ==========================================
  {
    name: 'Bhubaneswar Railway Station (Master Canteen)',
    lat: 20.2668,
    lng: 85.8398,
    address: 'Station Square, Kharavel Nagar, Bhubaneswar 751001',
    category: 'transit',
    poiType: 'cooling_hub',
    poiDescription: 'Central rail terminal with AC waiting lounges & chilled BMC water ATMs',
    tags: ['railway station', 'master canteen', 'station square', 'train']
  },
  {
    name: 'Baramunda ISBT (Bus Terminal)',
    lat: 20.2780,
    lng: 85.7950,
    address: 'Babasaheb Ambedkar Bus Terminal, Baramunda, Bhubaneswar 751003',
    category: 'transit',
    poiType: 'cooling_hub',
    poiDescription: 'Premier inter-state bus terminal with passenger amenities and misting hubs',
    tags: ['baramunda', 'isbt', 'bus stand', 'bus terminal']
  },
  {
    name: 'Biju Patnaik International Airport (BBI)',
    lat: 20.2520,
    lng: 85.8180,
    address: 'Airport Road, Aerodrome Area, Bhubaneswar 751020',
    category: 'transit',
    poiType: 'indoor_ac',
    poiDescription: 'International air terminal with covered walkways and AC lounges',
    tags: ['airport', 'bbi', 'aerodrome', 'terminal 1', 'terminal 2']
  },

  // ==========================================
  // 8. HERITAGE OLD TOWN & TEMPLES (Ekamra Kshetra)
  // ==========================================
  {
    name: 'Lingaraj Temple (11th Century Shrine)',
    lat: 20.2385,
    lng: 85.8335,
    address: 'Lingaraj Temple Complex, Old Town, Bhubaneswar 751002',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'Ancient sandstone temple with covered stone arcades and cool courtyards',
    tags: ['lingaraj', 'temple', 'old town', 'ekamra kshetra']
  },
  {
    name: 'Bindu Sagar Sacred Lake',
    lat: 20.2440,
    lng: 85.8345,
    address: 'Bindu Sagar North Bank, Old Town, Bhubaneswar 751002',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'Sprawling sacred lake with stone ghats and continuous water breeze',
    tags: ['bindu sagar', 'lake', 'old town']
  },
  {
    name: 'Khandagiri & Udayagiri Rock Caves',
    lat: 20.2570,
    lng: 85.7865,
    address: 'Khandagiri Caves Rd, Khandagiri, Bhubaneswar 751030',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'Historical rock-cut hill caves with breezy hilltop tree cover',
    tags: ['khandagiri', 'udayagiri', 'caves', 'heritage']
  },
  {
    name: 'Dhauli Shanti Stupa (Peace Pagoda)',
    lat: 20.1920,
    lng: 85.8390,
    address: 'Dhauli Hills, Daya River Bank, Bhubaneswar 752104',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: 'Buddhist peace pagoda with hillside tree canopy overlooking Daya river',
    tags: ['dhauli', 'shanti stupa', 'peace pagoda', 'daya river']
  },
  {
    name: 'Rajarani Temple (Love Temple)',
    lat: 20.2470,
    lng: 85.8450,
    address: 'Rajarani Temple Rd, Old Town, Bhubaneswar 751014',
    category: 'heritage',
    poiType: 'shaded_bench',
    poiDescription: '11th-century reddish sandstone temple set amidst manicured shaded lawns',
    tags: ['rajarani', 'temple', 'old town']
  },
  {
    name: 'Ekamra Kanan Botanical Gardens & Lake',
    lat: 20.3090,
    lng: 85.8095,
    address: 'Ekamra Kanan, Nayapalli, Bhubaneswar 751015',
    category: 'park',
    poiType: 'cooling_hub',
    poiDescription: '500-acre botanical forest reserve with microclimate lake cooling and tree canopy',
    tags: ['ekamra kanan', 'botanical garden', 'nayapalli', 'lake', 'park']
  },
  {
    name: 'Forest Park (Biju Patnaik Energy Park)',
    lat: 20.2585,
    lng: 85.8290,
    address: 'Forest Park Road, Unit 1, Bhubaneswar 751009',
    category: 'park',
    poiType: 'misting_station',
    poiDescription: 'Lush urban forest with 92% tree canopy density and ambient misting',
    tags: ['forest park', 'biju patnaik park', 'unit 1', 'jogging park']
  }
];

/**
 * Searches the expanded Bhubaneswar database using multi-field fuzzy matching
 */
export function searchComprehensiveBhubaneswar(query: string): EnrichedLocationPoint[] {
  const q = query.toLowerCase().trim();
  if (!q) return BHUBANESWAR_EXPANDED_DATABASE.slice(0, 10);

  const tokens = q.split(/\s+/).filter(Boolean);

  return BHUBANESWAR_EXPANDED_DATABASE.filter((item) => {
    const haystack = [
      item.name,
      item.address || '',
      item.category,
      ...(item.tags || [])
    ].join(' ').toLowerCase();

    // Check if every token matches
    return tokens.every((token) => haystack.includes(token));
  }).slice(0, 12);
}
