
// auraos-backend/src/models/Payment.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const paymentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true }, // Amount in the smallest currency unit (e.g., paise)
    currency: { type: String, required: true },
    creditPackId: { type: String, required: true },
    status: { type: String, required: true, default: 'captured' },
}, {
    timestamps: true,
});

export default mongoose.model('Payment', paymentSchema);
