// auraos-backend/src/models/Project.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// NEW: Collaborator Sub-schema
const collaboratorSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
}, { _id: false });

// NEW: Asset & Chat Schemas for Project Hub
const generatedDocumentSchema = new Schema({
    name: { type: String, required: true },
    type: { type: String, required: true }, // e.g., 'BoQ', 'Structural Report'
    url: { type: String, required: true }, // Could be a data URL or a link to stored file
    createdAt: { type: Date, default: Date.now }
});

const generatedRenderSchema = new Schema({
    prompt: { type: String },
    url: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const chatMessageSchema = new Schema({
    userId: { type: String }, // Can be user ID or 'Aura AI'
    userName: { type: String, required: true },
    text: { type: String, required: true },
    isAI: { type: Boolean, default: false },
    timestamp: { type: String, default: () => new Date().toISOString() }
}, { _id: false });

const aiCreditUsageSchema = new Schema({
    tool: { type: String, required: true },
    cost: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
}, { _id: false });


// Layer Schema
const layerSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
    isLocked: { type: Boolean, default: false },
}, { _id: false });

// Sub-schemas for nested data
const wallSchema = new Schema({
  id: { type: String, required: true },
  x1: { type: Number, required: true },
  y1: { type: Number, required: true },
  x2: { type: Number, required: true },
  y2: { type: Number, required: true },
  thickness: { type: Number, required: true },
  height: { type: Number, required: true },
  material: String,
  layerId: { type: String, required: true }, 
}, { _id: false });

const roomSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: String,
  type: { type: String, required: true }, 
  wallIds: [String],
  calculatedArea: Number,
  orientation: String, 
  floorMaterial: String,
  wallMaterialOverride: String,
  layerId: { type: String, required: true }, 
}, { _id: false });

const placementSchema = new Schema({
  id: { type: String, required: true },
  wallId: { type: String, required: true },
  type: { type: String, enum: ['door', 'window'], required: true },
  positionRatio: { type: Number, required: true }, 
  width: { type: Number, required: true },  
  height: { type: Number, required: true },
  layerId: { type: String, required: true }, 
}, { _id: false });

const suggestedFurnitureItemSchema = new Schema({
  id: { type: String, required: true }, 
  roomId: { type: String, required: true }, 
  itemType: { type: String, required: true }, 
  x: { type: Number, required: true }, 
  y: { type: Number, required: true }, 
  width: { type: Number, required: true }, 
  depth: { type: Number, required: true }, 
  height3d: { type: Number, required: true }, 
  orientation2d: { type: Number, required: true }, 
  vastuRemark: String,
  layerId: { type: String, required: true }, 
}, { _id: false });

const placedModelSchema = new Schema({
  id: { type: String, required: true },
  modelKey: { type: String, required: true },
  name: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  depth: { type: Number, required: true },
  height3d: { type: Number, required: true },
  rotation: { type: Number, required: true },
  layerId: { type: String, required: true },
  brand: String,
  style: String,
}, { _id: false });

const dimensionLineSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['manual', 'auto'], required: true },
  p1: { x: Number, y: Number },
  p2: { x: Number, y: Number },
  textPosition: { x: Number, y: Number },
  offsetDistance: { type: Number, required: true },
  isTemporary: Boolean,
  layerId: { type: String, required: true },
}, { _id: false });

const replySchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: String, required: true },
}, { _id: false });

const appCommentSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  text: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  resolved: { type: Boolean, default: false },
  replies: [replySchema],
  createdAt: { type: String, required: true },
  updatedAt: { type: String, required: true },
  layerId: { type: String, required: true },
}, { _id: false });

// Civil
const footingSchema = new Schema({
  id: String,
  x: Number,
  y: Number,
  size: String,
  depth: String,
  reinforcement: String,
}, { _id: false });

// MEP
const plumbingLineSchema = new Schema({
  id: String,
  type: String,
  path: [{ x: Number, y: Number }],
  layerId: String,
}, { _id: false });

const circuitSchema = new Schema({
  id: String,
  name: String,
  breakerRating: Number,
  description: String,
}, { _id: false });

const wiringPathSchema = new Schema({
  id: String,
  circuitId: String,
  path: [{ x: Number, y: Number }],
}, { _id: false });

const electricalLayoutSchema = new Schema({
  breakerPanel: {
    x: Number,
    y: Number,
    circuits: [circuitSchema],
  },
  wiringPaths: [wiringPathSchema],
  layerId: String,
}, { _id: false });

const ductSchema = new Schema({
  id: String,
  type: String,
  path: [{ x: Number, y: Number }],
  width: Number,
}, { _id: false });

const ventSchema = new Schema({
  id: String,
  type: String,
  x: Number,
  y: Number,
  width: Number,
  length: Number,
  angle: Number,
}, { _id: false });

const hvacLayoutSchema = new Schema({
  ducts: [ductSchema],
  vents: [ventSchema],
  ahuLocation: { x: Number, y: Number },
  condenserLocation: { x: Number, y: Number },
  layerId: String,
}, { _id: false });

// GFC
const generalNotesSchema = new Schema({
  civil: [String],
  structural: [String],
  mep: [String],
  safety: [String],
}, { _id: false });

const materialLegendItemSchema = new Schema({
  tag: String,
  description: String,
  details: String,
}, { _id: false });

const mepLayerSchema = new Schema({
  lines: [{ id: String, path: [{ x: Number, y: Number }] }],
  symbols: [{ id: String, x: Number, y: Number }],
}, { _id: false });

const scheduleItemSchema = new Schema({
  id: String,
  type: String,
  size: String,
  material: String,
  remarks: String,
}, { _id: false });

const gfcDrawingSetSchema = new Schema({
  generalNotes: generalNotesSchema,
  materialLegend: [materialLegendItemSchema],
  mepLayers: {
    plumbing: mepLayerSchema,
    electrical: mepLayerSchema,
    fire: mepLayerSchema,
  },
  schedules: {
    doorSchedule: [scheduleItemSchema],
    windowSchedule: [scheduleItemSchema],
  },
}, { _id: false });

const zoneSchema = new Schema({
  id: String,
  name: String,
  type: String,
  path: [{ x: Number, y: Number }],
  layerId: String,
}, { _id: false });

const infrastructureLineSchema = new Schema({
  id: String,
  type: String,
  path: [{ x: Number, y: Number }],
  width: Number,
  layerId: String,
}, { _id: false });


const levelSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  elevation: { type: Number, required: true },
  walls: [wallSchema],
  rooms: [roomSchema],
  placements: [placementSchema],
  placedModels: [placedModelSchema],
  dimensionLines: [dimensionLineSchema],
  comments: [appCommentSchema],
  suggestedFurniture: [suggestedFurnitureItemSchema],
  plumbingLayout: [plumbingLineSchema],
  electricalLayout: electricalLayoutSchema,
  hvacLayout: hvacLayoutSchema,
  drawingSet: gfcDrawingSetSchema,
  layers: [layerSchema],
  activeLayerId: { type: String, required: true },
  foundationPlan: [footingSchema],
  // Master Plan data is now nested in levels
  zones: [zoneSchema],
  infrastructure: [infrastructureLineSchema],
}, { _id: false });

const propertyLineSchema = new Schema({
  id: String,
  points: [{ x: Number, y: Number }],
}, { _id: false });

const terrainMeshSchema = new Schema({
  vertices: [Number],
  indices: [Number],
}, { _id: false });

const stagingSettingsSchema = new Schema({
  timeOfDay: String,
  enableBloom: Boolean,
}, { _id: false });

const cameraViewSchema = new Schema({
  id: String,
  name: String,
  position: { x: Number, y: Number, z: Number },
  target: { x: Number, y: Number, z: Number },
}, { _id: false });

const projectTaskSchema = new Schema({
  id: String,
  text: String,
  isCompleted: Boolean,
}, { _id: false });

const budgetCategorySchema = new Schema({
  id: String,
  name: String,
  planned: Number,
  actual: Number,
}, { _id: false });

const clientAccessSchema = new Schema({
  isEnabled: Boolean,
  shareableLink: String,
}, { _id: false });

const architectsFolioSchema = new Schema({
  title: String,
  narrative: String,
  shareableLink: String,
  isEnabled: Boolean,
}, { _id: false });

const holocronHotspotSchema = new Schema({
  id: String,
  title: String,
  type: String,
  content: String,
  position: { x: Number, y: Number, z: Number },
}, { _id: false });

const holocronSchema = new Schema({
  isEnabled: Boolean,
  shareableLink: String,
  hotspots: [holocronHotspotSchema],
}, { _id: false });

const cinematicShotSchema = new Schema({
    shotType: String, summary: String,
    cameraStart: { x: Number, y: Number, z: Number },
    cameraEnd: { x: Number, y: Number, z: Number },
    targetStart: { x: Number, y: Number, z: Number },
    targetEnd: { x: Number, y: Number, z: Number },
    duration: Number, script: String,
}, { _id: false });

const cinematicTourSchema = new Schema({
  title: String,
  shots: [cinematicShotSchema],
}, { _id: false });

const sceneSchema = new Schema({
    id: String,
    title: String,
    narrative: String,
    cameraViewId: String,
    duration: Number,
}, { _id: false });

const storyboardSchema = new Schema({
    id: String,
    title: String,
    scenes: [sceneSchema],
}, { _id: false });


const phoenixEyeReportSchema = new Schema({
    // Store as Mixed for simplicity on backend
    overallAssessment: String,
    progressPercentage: Number,
    scheduleAdherence: String,
    discrepancies: Schema.Types.Mixed,
}, { _id: false });

const constructionPhaseSchema = new Schema({
    week: Number,
    description: String,
    tasks: [String],
    estimatedMaterials: [{ item: String, quantity: Number, unit: String }],
    constructionNotes: [String],
    elementIds: { walls: [String], placements: [String], models: [String] },
}, { _id: false });

const marketplaceInfoSchema = new Schema({
    price: { type: Number, required: true },
    description: String,
    tags: [String],
    numPurchases: { type: Number, default: 0 }
}, { _id: false });

const tokenizationDetailsSchema = new Schema({
    isTokenized: { type: Boolean, default: false, index: true },
    totalTokens: Number,
    pricePerToken: Number,
    offeringDescription: String,
}, { _id: false });


const projectSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  location: String,
  projectType: { type: String, enum: ['building', 'masterPlan'], required: true, default: 'building' },
  isPublic: { type: Boolean, default: false, index: true },
  isForSale: { type: Boolean, default: false, index: true }, // for marketplace
  marketplace: marketplaceInfoSchema,
  tokenization: tokenizationDetailsSchema,
  levels: [levelSchema],
  planNorthDirection: { type: String, default: 'N' },
  propertyLines: [propertyLineSchema],
  terrainMesh: terrainMeshSchema,
  previewImageUrl: String,
  stagingSettings: stagingSettingsSchema,
  savedCameraViews: [cameraViewSchema],
  status: { type: String, default: 'design' },
  budget: [budgetCategorySchema],
  tasks: [projectTaskSchema],
  clientAccess: clientAccessSchema,
  folio: architectsFolioSchema,
  holocron: holocronSchema,
  cinematicTour: cinematicTourSchema,
  storyboard: storyboardSchema,
  phoenixEyeReports: [phoenixEyeReportSchema],
  version: { type: Number, default: 1 },
  collaborators: [collaboratorSchema],
  generatedDocuments: [generatedDocumentSchema],
  generatedRenders: [generatedRenderSchema],
  chatHistory: [chatMessageSchema],
  clientProfile: String,
  siteContext: String,
  specificRequirements: String,
  billOfQuantities: Schema.Types.Mixed,
  sustainabilityReport: Schema.Types.Mixed,
  aiCreditUsage: [aiCreditUsageSchema],
  constructionSequence: [constructionPhaseSchema],
  juggernautReport: Schema.Types.Mixed,
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

projectSchema.virtual('id').get(function() {
  if (this._id) {
    return this._id.toHexString();
  }
});

projectSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 

projectSchema.set('toObject', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.__v;
    }
});

export default mongoose.model('Project', projectSchema);