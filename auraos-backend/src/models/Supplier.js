
// auraos-backend/src/models/Supplier.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

// GeoJSON for location
const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
    }
});

const supplierSchema = new Schema({
    name: { type: String, required: true, trim: true },
    materialCategory: { type: String, required: true, index: true }, // e.g., 'Structural Steel', 'Concrete', 'Finishes'
    location: {
        type: pointSchema,
        index: '2dsphere' // For geospatial queries
    },
    locationName: { type: String }, // e.g., "Mumbai, India"
    rating: { type: Number, min: 1, max: 5, default: 3 },
    contactEmail: { type: String },
}, { timestamps: true });

export default mongoose.model('Supplier', supplierSchema);
