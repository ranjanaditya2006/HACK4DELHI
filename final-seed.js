const mongoose = require('mongoose');
const Seat = require('./models/Seat');

// --- CONNECT TO DB ---
mongoose.connect("mongodb://localhost:27017/nirvachanDB")
    .then(() => console.log("🔌 Connected to DB..."))
    .catch(err => console.log(err));

// --- HELPER: Random Generator ---
// Generates a random number between min and max with optional decimal places
function random(min, max, decimals = 0) {
    const num = Math.random() * (max - min) + min;
    return Number(num.toFixed(decimals));
}

// --- HELPER: Unique Seat Generator ---
// Creates a unique seat object by varying metrics slightly based on a "Base Profile"
function createSeat(name, level, type, baseCost, baseTurnout, baseMCC) {
    // Add randomness so even two "Urban" seats look different
    const uniqueCost = random(baseCost - 3, baseCost + 5, 2); // e.g., 15.42 Lakhs
    const uniqueTurnout = random(baseTurnout - 4, baseTurnout + 4, 1); // e.g., 58.7%
    const uniqueMCC = Math.floor(random(baseMCC - 20, baseMCC + 20)); // e.g., 592 Days
    const uniqueDeployments = Math.floor(random(8, 12)); 

    return {
        name: name,
        level: level,
        type: type,
        baseline: {
            mcc_days: uniqueMCC,
            cost_lakhs: uniqueCost,
            staff_deployments: uniqueDeployments,
            voter_turnout: uniqueTurnout
        }
    };
}

// --- 1. LOK SABHA (7 Seats) ---
// Explicitly defined because there are only 7
const ls_data = [
    createSeat("Chandni Chowk", "ls", "Commercial-Historic", 95, 58.5, 1300),
    createSeat("North East Delhi", "ls", "High-Density", 98, 62.1, 1310),
    createSeat("East Delhi", "ls", "Urban-Mixed", 92, 60.4, 1290),
    createSeat("New Delhi", "ls", "VVIP-Admin", 110, 55.2, 1300),
    createSeat("North West Delhi", "ls", "Rural-Industrial", 85, 59.8, 1400),
    createSeat("West Delhi", "ls", "Residential", 94, 61.5, 1280),
    createSeat("South Delhi", "ls", "Posh-Urban", 105, 57.3, 1320)
];

// --- 2. VIDHAN SABHA (70 Seats) ---
// We map real names to specific "Types" to give them unique realistic data
const vs_names_raw = [
    "Narela:Rural", "Burari:Mixed", "Timarpur:Urban", "Adarsh Nagar:Urban", "Badli:Industrial", "Rithala:Residential", "Bawana:Rural", "Mundka:Rural", "Kirari:Unplanned", "Sultanpur Majra:Mixed",
    "Nangloi Jat:Mixed", "Mangolpuri:High-Density", "Rohini:Planned", "Shalimar Bagh:Posh", "Shakur Basti:Urban", "Tri Nagar:Congested", "Wazirpur:Industrial", "Model Town:Posh", "Sadar Bazar:Commercial", "Chandni Chowk:Commercial",
    "Matia Mahal:High-Density", "Ballimaran:Commercial", "Karol Bagh:Commercial", "Patel Nagar:Urban", "Moti Nagar:Industrial", "Madipur:Residential", "Rajouri Garden:Posh", "Hari Nagar:Residential", "Tilak Nagar:Urban", "Janakpuri:Planned",
    "Vikaspuri:Residential", "Uttam Nagar:High-Density", "Dwarka:Planned", "Matiala:Rural-Urban", "Najafgarh:Rural", "Bijwasan:Rural-Mix", "Palam:Urban", "Delhi Cantt:Restricted", "Rajinder Nagar:Urban", "New Delhi:VVIP",
    "Jangpura:Urban", "Kasturba Nagar:Mixed", "Malviya Nagar:Posh", "RK Puram:Govt-Colony", "Mehrauli:Historic", "Chhatarpur:Farmhouses", "Deoli:Unplanned", "Ambedkar Nagar:High-Density", "Sangam Vihar:Unplanned", "Greater Kailash:Posh",
    "Kalkaji:Urban", "Tughlakabad:Historic", "Badarpur:Border", "Okhla:Industrial", "Trilokpuri:Resettlement", "Kondli:Mixed", "Patparganj:Urban", "Laxmi Nagar:Commercial", "Vishwas Nagar:Mixed", "Krishna Nagar:Congested",
    "Gandhi Nagar:Commercial", "Shahdara:Historic", "Seemapuri:Border", "Rohtas Nagar:Urban", "Seelampur:High-Density", "Ghonda:Mixed", "Babarpur:Congested", "Gokalpur:Rural-Mix", "Mustafabad:High-Density", "Karawal Nagar:Unplanned"
];

const vs_data = vs_names_raw.map(entry => {
    const [name, type] = entry.split(":");
    // Base stats based on Type
    let cost = 40, turnout = 60, mcc = 900;
    
    if(type.includes("Rural")) { cost = 35; turnout = 66; mcc = 950; }
    if(type.includes("Posh") || type.includes("VVIP")) { cost = 55; turnout = 52; mcc = 880; }
    if(type.includes("Commercial")) { cost = 50; turnout = 58; mcc = 900; }
    if(type.includes("High-Density") || type.includes("Congested")) { cost = 42; turnout = 64; mcc = 920; }
    if(type.includes("Planned")) { cost = 45; turnout = 59; mcc = 900; }

    return createSeat(name, "vs", type, cost, turnout, mcc);
});

// --- 3. MCD WARDS (250 Seats) ---
// Generated with explicit Zone-based logic to ensure 250 unique entries
const zones = [
    { name: "Narela", start: 1, end: 16, type: "Rural" },
    { name: "Civil Lines", start: 17, end: 31, type: "Urban-Old" },
    { name: "Rohini", start: 32, end: 54, type: "Planned" },
    { name: "Keshav Puram", start: 55, end: 69, type: "Industrial" },
    { name: "City-SP", start: 70, end: 82, type: "Commercial" },
    { name: "Karol Bagh", start: 83, end: 95, type: "Mixed" },
    { name: "West", start: 96, end: 120, type: "Residential" },
    { name: "Najafgarh", start: 121, end: 150, type: "Rural-Urban" },
    { name: "South", start: 151, end: 175, type: "Posh" },
    { name: "Central", start: 176, end: 200, type: "Govt" },
    { name: "Shahdara South", start: 201, end: 225, type: "Congested" },
    { name: "Shahdara North", start: 226, end: 250, type: "High-Density" }
];

let mcd_data = [];

zones.forEach(zone => {
    for (let i = zone.start; i <= zone.end; i++) {
        // Base stats based on Zone Type
        let cost = 15, turnout = 58, mcc = 600;

        if(zone.type === "Rural") { cost = 12; turnout = 68; mcc = 650; }
        if(zone.type === "Posh") { cost = 22; turnout = 48; mcc = 580; }
        if(zone.type === "Commercial") { cost = 20; turnout = 55; mcc = 600; }
        if(zone.type === "Congested") { cost = 16; turnout = 62; mcc = 610; }
        if(zone.type === "Planned") { cost = 18; turnout = 56; mcc = 600; }

        mcd_data.push(createSeat(
            `Ward ${i} (${zone.name})`, // e.g. "Ward 1 (Narela)"
            "mcd", 
            zone.type, 
            cost, 
            turnout, 
            mcc
        ));
    }
});

// --- EXECUTE SEED ---
const run = async () => {
    try {
        await Seat.deleteMany({});
        console.log("🗑️  Old Data Cleared");

        // Bulk Insert
        await Seat.insertMany(ls_data);
        console.log("✅ Inserted 7 Unique Lok Sabha Seats");

        await Seat.insertMany(vs_data);
        console.log("✅ Inserted 70 Unique Vidhan Sabha Seats");

        await Seat.insertMany(mcd_data);
        console.log("✅ Inserted 250 Unique MCD Wards");

        console.log(`🎉 DATABASE READY: 327 Total Unique Seats!`);
        mongoose.connection.close();
    } catch(e) {
        console.log(e);
    }
};

run();
