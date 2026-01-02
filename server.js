require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Seat = require('./models/Seat');

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIGURATION ---
const PORT = 5000;
const MONGO_URI = "mongodb://localhost:27017/nirvachanDB"; // Ensure MongoDB is running
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- CONNECT DB ---
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ DB Error:", err));

// --- ROUTES ---

// 1. Get All Seats (Hierarchical Data for Sidebar)
app.get('/api/seats/:level', async (req, res) => {
    try {
        const seats = await Seat.find({ level: req.params.level });
        res.json(seats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. RUN SIMULATION (The Math Engine)
app.post('/api/simulate', async (req, res) => {
    const { seatId } = req.body;
    
    try {
        // Fetch Real Baseline Data from DB
        const seat = await Seat.findById(seatId);
        if (!seat) return res.status(404).json({ msg: "Seat not found" });

        // --- SIMULATION ALGORITHMS ---
        // These formulas represent the "ONOE Impact" logic
        
        // Governance: MCC Days cut by ~50%
        const gov_mcc_curr = seat.baseline.mcc_days;
        const gov_mcc_onoe = Math.round(gov_mcc_curr * 0.5); 

        // Financial: Cost reduced by ~35% due to shared logistics
        const fin_cost_curr = seat.baseline.cost_lakhs;
        const fin_cost_onoe = Number((fin_cost_curr * 0.65).toFixed(1));

        // Admin: Fatigue (Deployments) reduced drastically
        const admin_dep_curr = seat.baseline.staff_deployments;
        const admin_dep_onoe = 5; // Fixed cycle for ONOE

        // Constitutional: Stability Score (Calculated)
        const const_stability_curr = seat.level === 'ls' ? 60 : 45; 
        const const_stability_onoe = 90; // Higher stability

        res.json({
            seat_info: seat,
            metrics: {
                gov: { mcc: { curr: gov_mcc_curr, onoe: gov_mcc_onoe } },
                fin: { cost: { curr: fin_cost_curr, onoe: fin_cost_onoe } },
                admin: { deployments: { curr: admin_dep_curr, onoe: admin_dep_onoe } },
                const: { stability: { curr: const_stability_curr, onoe: const_stability_onoe } }
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. AI INSIGHTS (Google Gemini Integration)
app.post('/api/ai-analyze', async (req, res) => {
    const { seatName, seatType, metrics } = req.body;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
            Act as a political data analyst. Analyze the impact of 'One Nation One Election' on the constituency "${seatName}" which is a "${seatType}" area.
            Data:
            - MCC Days reduced from ${metrics.gov.mcc.curr} to ${metrics.gov.mcc.onoe}.
            - Election Cost reduced from ₹${metrics.fin.cost.curr} Lakhs to ₹${metrics.fin.cost.onoe} Lakhs.
            - Administrative Deployments reduced from ${metrics.admin.deployments.curr} to ${metrics.admin.deployments.onoe}.
            
            Write a concise, professional 2-sentence insight explaining how this specific reduction benefits this specific type of area. Do not use asterisks.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ analysis: text });
    } catch (err) {
        console.error("AI Error:", err);
        res.json({ analysis: "AI analysis currently unavailable due to high traffic." });
    }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
