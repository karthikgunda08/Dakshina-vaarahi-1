// auraos-backend/src/models/Feedback.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const feedbackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: {
        type: String,
        enum: ['bug_report', 'feature_request', 'general_feedback'],
        required: true,
        index: true,
    },
    message: {
        type: String,
        required: [true, 'Feedback message cannot be empty.'],
        trim: true,
        maxLength: 5000,
    },
    status: {
        type: String,
        enum: ['new', 'in_progress', 'resolved', 'wont_fix'],
        default: 'new',
    },
    appVersion: String, // Optional: To track which version the feedback is for
}, {
    timestamps: true,
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true } 
});

feedbackSchema.virtual('id').get(function() {
  if (this._id) {
    return this._id.toHexString();
  }
});

export default mongoose.model('Feedback', feedbackSchema);