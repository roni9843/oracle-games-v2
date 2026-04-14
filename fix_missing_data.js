const fs = require('fs');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

const providerSchema = new mongoose.Schema({
    providerCode: { type: String, unique: true },
    providerName: String,
    gameType: String
});
const Provider = mongoose.model('Provider', providerSchema);

const gameSchema = new mongoose.Schema({
    gameCode: { type: String, required: true, unique: true },
    gameName: { type: String, required: true },
    gameType: { type: String, required: true },
    providerCode: { type: String, required: true },
    image: { type: String, default: '' },
    jackpot: String,
    eventGameType: String,
    freeTry: String,
    seq: Number,
    rtp: Number,
    balance: Number
});
const Game = mongoose.model('Game', gameSchema);

async function fixData() {
    try {
        const token = "4895677890656568745";
        let totalGamesInserted = 0;
        let totalProvidersInserted = 0;

        // 1. Insert Missing Providers
        const missingProvidersPath = path.join(__dirname, 'missing_providers.json');
        if (fs.existsSync(missingProvidersPath)) {
            const missingProviders = JSON.parse(fs.readFileSync(missingProvidersPath, 'utf8'));
            console.log(`Found ${missingProviders.length} missing providers to insert.`);
            
            for (const p of missingProviders) {
                try {
                    await Provider.updateOne(
                        { providerCode: p.providerCode },
                        { $set: p },
                        { upsert: true }
                    );
                    totalProvidersInserted++;
                } catch (e) {
                    console.error(`Error inserting provider ${p.providerCode}:`, e.message);
                }
            }
            console.log(`Inserted/Updated ${totalProvidersInserted} providers.`);

            // 2. Fetch Games for these NEW providers
            console.log('Fetching games for valid new providers...');
            const providersToFetch = missingProviders; 

            for (const p of providersToFetch) {
                console.log(`Fetching games for ${p.providerCode}...`);
                try {
                    const res = await axios.post('https://oracleapi.co.uk/getgamelist', {
                        token,
                        providerCode: p.providerCode
                    });
                    
                    if(res.data && res.data.success && Array.isArray(res.data.data)) {
                        const games = res.data.data.map(g => ({
                            ...g,
                            providerCode: p.providerCode
                        }));
                        
                        if (games.length > 0) {
                            try {
                                // ordered: false to continue if some duplicates fail
                                const result = await Game.insertMany(games, { ordered: false });
                                console.log(`  > Inserted ${result.length} games for ${p.providerCode}`);
                                totalGamesInserted += result.length;
                            } catch (insertError) {
                                // insertMany throws if any error, but ordered:false allows partial success
                                // The error object contains info about successful docs? 
                                // Actually with mongoose insertMany, it throws.
                                // We can count successful inserts by checking result.insertedCount if available or by handling error
                                if (insertError.insertedDocs) {
                                     console.log(`  > Inserted ${insertError.insertedDocs.length} games (some duplicates skipped)`);
                                     totalGamesInserted += insertError.insertedDocs.length;
                                } else {
                                     console.log(`  > Partial insert error:`, insertError.message);
                                }
                            }
                        } else {
                            console.log(`  > No games returned for ${p.providerCode}`);
                        }
                    } else {
                        console.log(`  > API returned error/no data for ${p.providerCode}`);
                    }
                } catch (e) {
                    console.error(`  > Error fetching games for ${p.providerCode}:`, e.message);
                }
            }
        }

        // 3. Insert specific missing games from debug_games.js
        const missingGamesPath = path.join(__dirname, 'missing_games.json');
        if (fs.existsSync(missingGamesPath)) {
            const explicitMissing = JSON.parse(fs.readFileSync(missingGamesPath, 'utf8'));
            if (explicitMissing.length > 0) {
                console.log(`Inserting ${explicitMissing.length} specific missing games...`);
                try {
                    const result = await Game.insertMany(explicitMissing, { ordered: false });
                    console.log(`  > Inserted ${result.length} specific games.`);
                    totalGamesInserted += result.length;
                } catch (e) {
                    if (e.insertedDocs) {
                        console.log(`  > Inserted ${e.insertedDocs.length} specific games.`);
                        totalGamesInserted += e.insertedDocs.length;
                    }
                }
            }
        }

        console.log('------------------------------------------------');
        console.log(`FINAL REPORT:`);
        console.log(`Providers Added: ${totalProvidersInserted}`);
        console.log(`Games Added: ${totalGamesInserted}`);
        
    } catch (e) {
        console.error('Fatal Error:', e);
    } finally {
        mongoose.connection.close();
    }
}

fixData();
