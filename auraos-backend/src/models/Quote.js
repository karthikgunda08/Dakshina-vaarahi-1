// auraos-backend/src/models/Quote.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const quoteSchema = new Schema({
    projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true, index: true },
    materialName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true }, // Price for the total quantity
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
    validUntil: { type: Date },
}, { timestamps: true });

export default mongoose.model('Quote', quoteSchema);