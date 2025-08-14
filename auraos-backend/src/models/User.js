// auraos-backend/src/models/User.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// NEW: Sub-schemas for Workspaces
const panelStateSchema = new Schema({
    id: String,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    zIndex: Number,
    isVisible: Boolean
}, { _id: false });

const workspaceSchema = new Schema({
    name: { type: String, required: true },
    layout: {
        type: Map,
        of: panelStateSchema
    }
});

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, 'Please use a valid email address.'],
    index: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required.']
  },
  credits: {
    type: Number,
    default: 100 // New users start with 100 credits
  },
  role: {
    type: String,
    enum: ['user', 'owner'],
    default: 'user'
  },
  name: String, 
  profession: String,
  skills: [String],
  bio: String,
  
  // Fields for user engagement analytics
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginStreak: {
    type: Number,
    default: 1,
  },
  phoneNumber: { // NEW: For user contact and WhatsApp integration
      type: String,
      trim: true
  },
  whatsappOptIn: { // NEW: For AI agent greetings and suggestions
      type: Boolean,
      default: false
  },

  // Fields for password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // NEW: Fields for public profile/showcase
  isProfilePublic: {
      type: Boolean,
      default: false
  },
  portfolioUrl: String,
  linkedInUrl: String,
  profileImageUrl: String,

  // NEW: Workspace Management
  workspaces: [workspaceSchema],

  // NEW: Marketplace Earnings
  marketplaceEarnings: {
    type: Number,
    default: 0
  },
  
  // NEW: Guild Membership
  guildId: {
      type: String,
      default: null,
  },

  // NEW: Onboarding
  onboardingRewardClaimed: {
    type: Boolean,
    default: false,
  },
  hasCompletedFirstMission: {
    type: Boolean,
    default: false,
  },

  // NEW: Developer Hub
  apiKey: {
    type: String,
  },

}, { 
  timestamps: true,
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
});

userSchema.virtual('id').get(function() {
  if (this._id) {
    return this._id.toHexString();
  }
});

userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
}); 

userSchema.set('toObject', {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret.__v;
    }
});

export default mongoose.model('User', userSchema);
