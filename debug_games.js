const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
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
    // Add other fields as necessary from the API response to match schema
    // based on previous knowledge or just store what's needed for identification
});

const Game = mongoose.model('Game', gameSchema);

async function debugGames() {
    try {
        // 1. Get all existing game codes from DB
        console.log('Fetching existing games from DB...');
        const existingGames = await Game.find({}, { gameCode: 1, _id: 0 });
        const existingGameCodes = new Set(existingGames.map(g => g.gameCode));
        console.log(`Found ${existingGameCodes.size} games in DB.`);

        // 2. Read Providers from docs_2.txt
        const docs2Path = path.join(__dirname, 'docs_2.txt');
        const fileContent = fs.readFileSync(docs2Path, 'utf8');
        const lines = fileContent.split('\n');
        
        // Skip header lines if any (looks like line 1 is header)
        const providers = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            // Assuming tab or space separated, first column is code
            const parts = line.split(/\s+/);
            if (parts.length > 0) {
                providers.push(parts[0]);
            }
        }
        console.log(`Found ${providers.length} providers in docs_2.txt.`);

        const missingGames = [];
        const token = "4895677890656568745"; // From docs.txt

        // 3. Fetch games for each provider
        for (const provider of providers) {
            console.log(`Fetching games for provider: ${provider}...`);
            try {
                const response = await axios.post('https://oracleapi.co.uk/getgamelist', {
                    token: token,
                    providerCode: provider
                });

                if (response.data && response.data.success && Array.isArray(response.data.data)) {
                    const apiGames = response.data.data;
                    console.log(`  > API returned ${apiGames.length} games.`);
                    
                    for (const game of apiGames) {
                        if (!existingGameCodes.has(game.gameCode)) {
                            missingGames.push({
                                ...game,
                                providerCode: provider // Ensure provider is set
                            });
                        }
                    }
                } else {
                    console.log(`  > No games found or error for ${provider}:`, response.data.message || 'Unknown error');
                }
            } catch (error) {
                console.error(`  > Error fetching ${provider}:`, error.message);
            }
        }

        console.log('------------------------------------------------');
        console.log(`Total Missing Games Found: ${missingGames.length}`);
        
        if (missingGames.length > 0) {
            console.log('Sample missing games:', missingGames.slice(0, 3).map(g => g.gameCode));
            
            // Write missing games to a file for inspection
            fs.writeFileSync('missing_games.json', JSON.stringify(missingGames, null, 2));
            console.log('Missing games saved to missing_games.json');

            // Optional: Insert them? 
            // For now, just report.
        } else {
             console.log('No missing games found! DB implies sync is complete?');
        }

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        mongoose.connection.close();
    }
}

debugGames();
