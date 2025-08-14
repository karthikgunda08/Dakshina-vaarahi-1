
// auraos-backend/src/models/Transaction.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['credit_purchase', 'ai_tool_usage', 'marketplace_sale', 'marketplace_purchase', 'payout', 'adjustment'],
        required: true,
    },
    amount: {
        type: Number,
        required: true, // Positive for credits, negative for debits
    },
    description: {
        type: String,
        required: true,
    },
    relatedId: { // e.g., projectId for tool usage, or paymentId for purchase
        type: String,
    },
}, {
    timestamps: true,
});

export default mongoose.model('Transaction', transactionSchema);
