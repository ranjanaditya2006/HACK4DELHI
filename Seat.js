const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g., "Chandni Chowk"
    level: { type: String, required: true }, // "ls", "vs", "mcd"
    type: { type: String, required: true }, // "Commercial", "Rural", etc.
    // Real Baseline Data (Snapshot from 2019/2024 elections)
    baseline: {
        mcc_days: Number,     // e.g., 1300
        cost_lakhs: Number,   // e.g., 95
        staff_deployments: Number, // e.g., 18
        voter_turnout: Number // e.g., 58
    }
});

module.exports = mongoose.model('Seat', SeatSchema);
