// auraos-backend/src/lib/constants.js

export const PREDEFINED_3D_MODELS = [
  // --- Seating ---
  { key: "sofa_01", name: "Modern Sofa", category: "Seating", defaultWidth: 200, defaultDepth: 90, defaultHeight3d: 80, modelUrl: '/models/sofa_01.glb' },
  { key: "sofa_l_shape", name: "L-Shape Sectional", category: "Seating", defaultWidth: 280, defaultDepth: 160, defaultHeight3d: 80 },
  { key: "armchair_01", name: "Leather Armchair", category: "Seating", defaultWidth: 80, defaultDepth: 80, defaultHeight3d: 90, modelUrl: '/models/armchair_01.glb' },
  { key: "dining_chair_01", name: "Dining Chair", category: "Seating", defaultWidth: 45, defaultDepth: 50, defaultHeight3d: 85, modelUrl: '/models/dining_chair_01.glb' },
  { key: "lounge_chair", name: "Lounge Chair", category: "Seating", defaultWidth: 70, defaultDepth: 160, defaultHeight3d: 75 },
  { key: "office_chair", name: "Office Chair", category: "Seating", defaultWidth: 60, defaultDepth: 60, defaultHeight3d: 110 },
  { key: "stool_bar", name: "Bar Stool", category: "Seating", defaultWidth: 40, defaultDepth: 40, defaultHeight3d: 100 },
  { key: "bench_indoor", name: "Indoor Bench", category: "Seating", defaultWidth: 150, defaultDepth: 40, defaultHeight3d: 45 },

  // --- Tables ---
  { key: "table_coffee_01", name: "Coffee Table", category: "Tables", defaultWidth: 120, defaultDepth: 60, defaultHeight3d: 40, modelUrl: '/models/table_coffee_01.glb' },
  { key: "table_dining_01", name: "Dining Table (6-Seater)", category: "Tables", defaultWidth: 180, defaultDepth: 90, defaultHeight3d: 75, modelUrl: '/models/table_dining_01.glb' },
  { key: "table_dining_round", name: "Dining Table (Round)", category: "Tables", defaultWidth: 120, defaultDepth: 120, defaultHeight3d: 75 },
  { key: "side_table_01", name: "Side Table", category: "Tables", defaultWidth: 40, defaultDepth: 40, defaultHeight3d: 50 },
  { key: "console_table", name: "Console Table", category: "Tables", defaultWidth: 120, defaultDepth: 35, defaultHeight3d: 80 },
  { key: "office_desk", name: "Office Desk", category: "Tables", defaultWidth: 150, defaultDepth: 70, defaultHeight3d: 75 },

  // --- Beds ---
  { key: "bed_king", name: "King Size Bed", category: "Beds", defaultWidth: 200, defaultDepth: 210, defaultHeight3d: 100, modelUrl: '/models/bed_king.glb' },
  { key: "bed_queen", name: "Queen Size Bed", category: "Beds", defaultWidth: 160, defaultDepth: 210, defaultHeight3d: 100 },
  { key: "bed_single", name: "Single Bed", category: "Beds", defaultWidth: 100, defaultDepth: 200, defaultHeight3d: 90 },
  { key: "bed_bunk", name: "Bunk Bed", category: "Beds", defaultWidth: 100, defaultDepth: 200, defaultHeight3d: 180 },

  // --- Storage ---
  { key: "storage_wardrobe", name: "Wardrobe", category: "Storage", defaultWidth: 180, defaultDepth: 60, defaultHeight3d: 220 },
  { key: "storage_bookshelf", name: "Bookshelf", category: "Storage", defaultWidth: 100, defaultDepth: 30, defaultHeight3d: 200 },
  { key: "storage_tv_unit", name: "TV Unit", category: "Storage", defaultWidth: 180, defaultDepth: 40, defaultHeight3d: 50 },
  { key: "storage_dresser", name: "Dresser", category: "Storage", defaultWidth: 120, defaultDepth: 50, defaultHeight3d: 80 },
  { key: "storage_nightstand", name: "Nightstand", category: "Storage", defaultWidth: 50, defaultDepth: 40, defaultHeight3d: 60, modelUrl: '/models/storage_nightstand.glb' },
  { key: "storage_filing_cabinet", name: "Filing Cabinet", category: "Storage", defaultWidth: 50, defaultDepth: 60, defaultHeight3d: 130 },
  { key: "storage_shoe_rack", name: "Shoe Rack", category: "Storage", defaultWidth: 80, defaultDepth: 35, defaultHeight3d: 120 },

  // --- Kitchen Appliances & Fixtures ---
  { key: "kitchen_fridge", name: "Refrigerator", category: "Kitchen", defaultWidth: 80, defaultDepth: 75, defaultHeight3d: 180 },
  { key: "kitchen_oven_stack", name: "Oven Stack", category: "Kitchen", defaultWidth: 60, defaultDepth: 60, defaultHeight3d: 150 },
  { key: "kitchen_cooktop", name: "Cooktop", category: "Kitchen", defaultWidth: 75, defaultDepth: 50, defaultHeight3d: 5 },
  { key: "kitchen_sink", name: "Kitchen Sink", category: "Kitchen", defaultWidth: 90, defaultDepth: 55, defaultHeight3d: 20 },
  { key: "kitchen_island", name: "Kitchen Island", category: "Kitchen", defaultWidth: 180, defaultDepth: 90, defaultHeight3d: 90 },

  // --- Bathroom Fixtures ---
  { key: "bathroom_wc", name: "Toilet (WC)", category: "Bathroom", defaultWidth: 40, defaultDepth: 70, defaultHeight3d: 80 },
  { key: "bathroom_vanity", name: "Vanity Sink", category: "Bathroom", defaultWidth: 90, defaultDepth: 50, defaultHeight3d: 85 },
  { key: "bathroom_bathtub", name: "Bathtub", category: "Bathroom", defaultWidth: 170, defaultDepth: 80, defaultHeight3d: 60 },
  { key: "bathroom_shower", name: "Shower Area", category: "Bathroom", defaultWidth: 100, defaultDepth: 100, defaultHeight3d: 220 },

  // --- Lighting ---
  { key: "pendant_light_industrial_01", name: "Industrial Pendant", category: "Lighting", defaultWidth: 40, defaultDepth: 40, defaultHeight3d: 30 },
  { key: "floor_lamp_01", name: "Modern Floor Lamp", category: "Lighting", defaultWidth: 30, defaultDepth: 30, defaultHeight3d: 160 },
  { key: "table_lamp", name: "Table Lamp", category: "Lighting", defaultWidth: 25, defaultDepth: 25, defaultHeight3d: 50 },

  // --- Decor ---
  { key: "decor_plant_01", name: "Potted Plant", category: "Decor", defaultWidth: 50, defaultDepth: 50, defaultHeight3d: 120, modelUrl: '/models/potted_plant_01.glb' },
  { key: "mirror_wall_round_01", name: "Round Wall Mirror", category: "Decor", defaultWidth: 80, defaultDepth: 5, defaultHeight3d: 80 },
  { key: "wall_art_abstract_01", name: "Abstract Wall Art", category: "Decor", defaultWidth: 100, defaultDepth: 4, defaultHeight3d: 150 },
  { key: "decor_vase", name: "Vase", category: "Decor", defaultWidth: 20, defaultDepth: 20, defaultHeight3d: 40 },

  // --- Textiles ---
  { key: "rug_modern_01", name: "Modern Rug", category: "Textiles", defaultWidth: 200, defaultDepth: 300, defaultHeight3d: 2 },
  { key: "curtain_linen_01", name: "Linen Curtain", category: "Textiles", defaultWidth: 150, defaultDepth: 2, defaultHeight3d: 240 },
  
  // --- Electronics ---
  { key: "electronics_tv", name: "Television", category: "Electronics", defaultWidth: 145, defaultDepth: 8, defaultHeight3d: 85 },
  { key: "electronics_desktop", name: "Desktop Computer", category: "Electronics", defaultWidth: 60, defaultDepth: 50, defaultHeight3d: 50 },

  // --- Utility ---
  { key: "utility_washing_machine", name: "Washing Machine", category: "Utility", defaultWidth: 60, defaultDepth: 60, defaultHeight3d: 85 },
  { key: "utility_hvac_outdoor", name: "HVAC Outdoor Unit", category: "Utility", defaultWidth: 90, defaultDepth: 35, defaultHeight3d: 70 },
  
  // --- Architectural ---
  { key: "railing_steel_01", name: "Steel Railing", category: "Architectural", defaultWidth: 100, defaultDepth: 5, defaultHeight3d: 90 },
  { key: "architectural_column", name: "Structural Column", category: "Architectural", defaultWidth: 40, defaultDepth: 40, defaultHeight3d: 240 },
  
  // --- Landscaping ---
  { key: "tree_01", name: "Generic Tree", category: "Landscaping", defaultWidth: 300, defaultDepth: 300, defaultHeight3d: 800 },
  { key: "landscaping_bush", name: "Garden Bush", category: "Landscaping", defaultWidth: 80, defaultDepth: 80, defaultHeight3d: 60 },
];
