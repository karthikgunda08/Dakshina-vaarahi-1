// auraos-backend/src/models/Submission.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const submissionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    proposal: { 
        type: String, 
        required: [true, 'A written proposal is required for submission.'],
        trim: true,
        maxLength: 10000,
    },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'adjudicated', 'finalist', 'winner', 'rejected'],
        default: 'submitted',
        index: true,
    },
    adjudicationReport: { type: Schema.Types.Mixed }
}, {
    timestamps: true
});

export default mongoose.model('Submission', submissionSchema);