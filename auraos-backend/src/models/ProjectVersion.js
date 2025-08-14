
// auraos-backend/src/models/ProjectVersion.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const projectVersionSchema = new Schema({
    projectId: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: true,
        index: true,
    },
    versionNumber: {
        type: Number,
        required: true,
    },
    commitMessage: {
        type: String,
        required: [true, 'A commit message is required for each version.'],
        trim: true,
        default: 'Unnamed version',
    },
    type: {
        type: String,
        enum: ['manual', 'auto'],
        default: 'manual',
    },
    projectData: {
        type: Schema.Types.Mixed,
        required: true,
    },
    restoredFrom: { // Optional: To track if this version was a restore from a previous one
        type: Number,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

projectVersionSchema.virtual('id').get(function() {
  if (this._id) {
    return this._id.toHexString();
  }
});

// Add storyboard to projectData for versioning
projectVersionSchema.pre('save', function(next) {
    if (this.isNew && this.projectData && !this.projectData.storyboard) {
        // This is a simplified check. A more robust implementation
        // might involve deeper inspection of what's being saved.
        // For now, we ensure the key exists if other data does.
        this.projectData.storyboard = null;
    }
    if (this.isNew && this.projectData && !this.projectData.juggernautReport) {
        this.projectData.juggernautReport = null;
    }
    if (this.isNew && this.projectData && !this.projectData.cinematicTour) {
        this.projectData.cinematicTour = null;
    }
    next();
});

export default mongoose.model('ProjectVersion', projectVersionSchema);
