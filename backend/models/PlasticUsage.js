// backend/models/PlasticUsage.js
import mongoose from 'mongoose';

const plasticUsageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Assuming you have a User model
    date: { type: Date, default: Date.now },
    bottles: { type: Number, required: true },
    bags: { type: Number, required: true },
    straws: { type: Number, required: true },
    containers: { type: Number, required: true },
    wrappers: { type: Number, required: true },
    carbonFootprint: { type: Number, required: true },
    points: { type: Number, required: true },
});

const PlasticUsage = mongoose.model('PlasticUsage', plasticUsageSchema);

export default PlasticUsage;