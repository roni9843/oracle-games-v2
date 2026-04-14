const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// User provided counts from the log
const expectedCounts = {
    "EDP": 163, "FC": 69, "JILIS": 199, "SPRIBE": 9, "LMONACO_UNI": 43,
    "ACEWINS": 48, "EVODO": 203, "SPS": 64, "PPLCO": 135, "PPDSO": 604,
    "MASCOT": 90, "NES": 213, "RTS": 300, "BTGS": 39, "NLCS": 80,
    "HACKSAW": 164, "SMARTS": 34, "GENESIS": 99, "PTS": 492, "ASPECTS": 144,
    "DSTPLAY": 35, "GAMEBEAT_UNI": 6, "IDG_UNI": 92, "AMIGO": 119, "BG_UNI": 174,
    "JKSO": 311, "WMGSO": 145, "PITTAPLUS_UNI": 29, "PNGS": 337, "NETG_UNI": 98,
    "PIXMOVE": 34, "IMOON": 25, "BARBARA_UNI": 84, "PHOENIX7_UNI": 28,
    "VA_UNI": 43, "INOUT": 40
};

const gameSchema = new mongoose.Schema({
    gameCode: String,
    providerCode: String
});
const Game = mongoose.model('Game', gameSchema);

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        const results = await Game.aggregate([
            { $group: { _id: "$providerCode", count: { $sum: 1 } } }
        ]);

        const dbCounts = {};
        let dbTotal = 0;
        results.forEach(r => {
            dbCounts[r._id] = r.count;
            dbTotal += r.count;
        });

        console.log('\n--- Discrepancy Report ---');
        console.log('Provider | Expected | Actual | Diff');
        console.log('---------|----------|--------|-----');

        let totalExpected = 0;
        let missingTotal = 0;

        const discrepancies = [];
        for (const [code, count] of Object.entries(expectedCounts)) {
            totalExpected += count;
            const actual = dbCounts[code] || 0;
            const diff = actual - count;
            
            if (diff !== 0) {
                discrepancies.push({ provider: code, expected: count, actual: actual, diff: diff });
            }
        }
        
        fs.writeFileSync('missing_report.json', JSON.stringify(discrepancies, null, 2));
        console.log(`Report saved to missing_report.json with ${discrepancies.length} entries.`);

        console.log('----------------------------');
        console.log(`Expected Total: ${totalExpected}`);
        console.log(`Actual DB Total: ${dbTotal}`);
        console.log(`Difference: ${dbTotal - totalExpected}`);

    } catch(e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

verify();
