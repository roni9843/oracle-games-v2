const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const gameSchema = new mongoose.Schema({
    gameCode: { type: String, required: true, unique: true },
    gameName: { type: String, required: true },
    gameType: { type: String, required: true },
    providerCode: { type: String, required: true },
    image: { type: String, default: '' },
    // Only essential fields for now, as missing_games.json will have API structure
    // We should map API fields to Schema fields if they differ
});

const Game = mongoose.model('Game', gameSchema);

async function insertMissingGames() {
    try {
        const missingGamesPath = path.join(__dirname, 'missing_games.json');
        
        if (!fs.existsSync(missingGamesPath)) {
            console.error('missing_games.json not found! Run debug_games.js first.');
            return;
        }

        const missingGames = JSON.parse(fs.readFileSync(missingGamesPath, 'utf8'));
        console.log(`Read ${missingGames.length} missing games from file.`);

        if (missingGames.length === 0) {
            console.log('No games to insert.');
            return;
        }

        // Map API fields to Schema fields if necessary
        // API returns: gameCode, gameName, image, gameType, providerCode (we added it)
        // Schema expects: gameCode, gameName, gameType, providerCode, image
        // They match!
        
        // Filter out any duplicates within the missingGames list itself (just in case)
        const uniqueGames = [];
        const seenCodes = new Set();
        for (const g of missingGames) {
            if (!seenCodes.has(g.gameCode)) {
                seenCodes.add(g.gameCode);
                uniqueGames.push(g);
            }
        }
        
        console.log(`Inserting ${uniqueGames.length} unique games...`);

        // Check again against DB to be safe (race condition?)
        const existingInDb = await Game.find({ gameCode: { $in: Array.from(seenCodes) } }, { gameCode: 1 });
        const existingSet = new Set(existingInDb.map(g => g.gameCode));
        
        const finalToInsert = uniqueGames.filter(g => !existingSet.has(g.gameCode));
        console.log(`Final count to insert after re-check: ${finalToInsert.length}`);

        if (finalToInsert.length > 0) {
            const result = await Game.insertMany(finalToInsert, { ordered: false });
            console.log(`Successfully inserted ${result.length} games!`);
        } else {
            console.log('All games already exist in DB.');
        }

    } catch (error) {
        console.error('Error inserting games:', error);
    } finally {
        mongoose.connection.close();
    }
}

insertMissingGames();
