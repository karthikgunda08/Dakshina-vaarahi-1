// src/lib/constants.ts
import type { CreditPack, MaterialDefinition, Predefined3DModel } from '../types/index';

// --- Sketcher ---
export const SNAP_THRESHOLD = 15;
export const GRID_SIZE = 20;
export const ANGLE_SNAP_THRESHOLD = 5; // degrees

// Attempt to access import.meta.env safely
const env = typeof import.meta !== 'undefined' && (import.meta as any).env ? (import.meta as any).env : undefined;

export const APP_TITLE = "AuraOS";

export const BACKEND_API_BASE_URL = env?.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

// NEW: Approximate value of one credit in INR, based on bulk pack pricing.
export const APPROX_INR_PER_CREDIT = 8.5;

export const DEFAULT_WALL_MATERIAL_KEY = 'paint_warm_white'; 
export const DEFAULT_FLOOR_MATERIAL_KEY = 'concrete_smooth';
export const DEFAULT_TEXTURE_SCALE_FACTOR = 100;
export const DRACO_DECODER_PATH = 'https://www.gstatic.com/draco/versioned/decoders/1.5.7/';

// Razorpay Constants
export const RAZORPAY_KEY_ID = env?.VITE_RAZORPAY_KEY_ID || "REPLACE_WITH_YOUR_RAZORPAY_KEY_ID";
export const CURRENCY = "INR";

export const CREDIT_PACKS: CreditPack[] = [
    { 
        id: 'pack_explorer', 
        name: 'Explorer', 
        credits: 100, 
        price: 990, // in INR
        description: 'For students and enthusiasts to explore core AI features.',
        tier: 'explorer'
    },
    { 
        id: 'pack_architect', 
        name: 'Architect', 
        credits: 500,
        price: 4490,
        description: 'The best value for individual professionals managing multiple projects.',
        tier: 'architect'
    },
    { 
        id: 'pack_studio', 
        name: 'Studio', 
        credits: 1200,
        price: 9990,
        description: 'For small studios with high-volume analysis and generation needs.',
        tier: 'firm'
    },
    {
        id: 'pack_enterprise',
        name: 'Enterprise',
        credits: 3000,
        price: 24990,
        description: 'Unleash maximum potential for large firms and enterprise-level work.',
        tier: 'firm'
    }
];

export const PREDEFINED_MATERIALS: MaterialDefinition[] = [
  // Paints
  { key: "paint_warm_white", name: "Warm White", type: "color", value: "#F5F5F5", category: "Paint", finish: "matte", appliesTo: "wall" },
  { key: "paint_glossy_white", name: "Glossy White", type: "color", value: "#FFFFFF", category: "Paint", finish: "glossy", appliesTo: "wall" },
  { key: "paint_light_beige", name: "Light Beige", type: "color", value: "#F5EFE6", category: "Paint", finish: "matte", appliesTo: "wall" },
  { key: "paint_cool_gray", name: "Cool Gray", type: "color", value: "#D1D5DB", category: "Paint", finish: "satin", appliesTo: "wall" },
  { key: "paint_charcoal", name: "Charcoal", type: "color", value: "#36454F", category: "Paint", finish: "matte", appliesTo: "wall" },
  { key: "paint_navy_blue", name: "Navy Blue", type: "color", value: "#000080", category: "Paint", finish: "satin", appliesTo: "wall" },

  // Plaster
  { key: "plaster_stucco", name: "Stucco Plaster", type: "color", value: "#EAEAEA", category: "Plaster", finish: "matte", appliesTo: "wall" },

  // Wood
  { key: "wood_oak_light", name: "Light Oak Wood", type: "color", value: "#D2B48C", category: "Wood", finish: "satin", appliesTo: "any" },
  { key: "wood_walnut_dark", name: "Dark Walnut Wood", type: "color", value: "#654321", category: "Wood", finish: "satin", appliesTo: "any" },
  { key: "wood_panel_walnut", name: "Walnut Wall Panel", type: "color", value: "#5C4033", category: "Wood", finish: "satin", appliesTo: "wall" },
  
  // Stone
  { key: "stone_tile_marble_white", name: "White Marble Tile", type: "color", value: "#F8F8F8", category: "Stone", finish: "glossy", roughness: 0.2, appliesTo: "floor" },
  { key: "stone_travertine_light", name: "Light Travertine", type: "color", value: "#E6D8B8", category: "Stone", finish: "matte", appliesTo: "any" },
  
  // Concrete
  { key: "concrete_smooth", name: "Smooth Concrete", type: "color", value: "#BDBDBD", category: "Concrete", finish: "matte", appliesTo: "any" },
  
  // Masonry
  { key: "masonry_brick_red", name: "Red Brick Wall", type: "color", value: "#AA4A44", category: "Masonry", finish: "matte", appliesTo: "wall" },
  
  // Tiles
  { key: "tile_ceramic_glossy_white", name: "Glossy White Ceramic Tile", type: "color", value: "#FFFFFF", category: "Tile", finish: "glossy", appliesTo: "any" },
  { key: "tile_terracotta_matte", name: "Matte Terracotta Tile", type: "color", value: "#E2725B", category: "Tile", finish: "matte", appliesTo: "floor"},
  { key: "tile_pattern_moroccan_blue", name: "Moroccan Blue Tile", type: "color", value: "#36669D", category: "Tile", finish: "satin", appliesTo: "any" },

  // Metal
  { key: "metal_steel_polished", name: "Polished Steel", type: "color", value: "#D8D8D8", category: "Metal", finish: "glossy", metalness: 0.9, roughness: 0.1, appliesTo: "model" },
  { key: "metal_black_matte", name: "Matte Black Metal", type: "color", value: "#333333", category: "Metal", finish: "matte", metalness: 0.4, roughness: 0.8, appliesTo: "model" },
];

export const PREDEFINED_3D_MODELS: Predefined3DModel[] = [
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
