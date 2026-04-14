const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const gameSchema = new mongoose.Schema({
    gameCode: String,
    providerCode: String,
    gameName: String
});
const Game = mongoose.model('Game', gameSchema);

async function generateList() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        // Read the discrepancy report
        const reportPath = 'missing_report.json';
        if (!fs.existsSync(reportPath)) {
            console.log('missing_report.json not found.');
            return;
        }
        const discrepancies = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        // Filter for negative differences (missing games)
        const missingProviders = discrepancies.filter(d => d.diff < 0);
        
        const detailedMissingList = [];
        const token = "4895677890656568745";

        console.log(`Analyzing ${missingProviders.length} providers with discrepancies...`);

        for (const p of missingProviders) {
            console.log(`Fetching API games for ${p.provider}...`);
            try {
                const res = await axios.post('https://oracleapi.co.uk/getgamelist', {
                    token: token,
                    providerCode: p.provider
                });

                if (res.data && res.data.data) {
                    const apiGames = res.data.data;
                    
                    // Get all these gameCodes from DB to see where they actually are
                    const codes = apiGames.map(g => g.gameCode);
                    const dbGames = await Game.find({ gameCode: { $in: codes } });
                    
                    const dbGameMap = new Map();
                    dbGames.forEach(g => dbGameMap.set(g.gameCode, g.providerCode));

                    // Check each API game
                    for (const game of apiGames) {
                        const actualProvider = dbGameMap.get(game.gameCode);
                        
                        // If actual provider is different from expected (p.provider), it's part of the "missing" count for this provider
                        if (actualProvider && actualProvider !== p.provider) {
                            detailedMissingList.push({
                                gameCode: game.gameCode,
                                gameName: game.gameName,
                                expectedProvider: p.provider,
                                actualProviderInDB: actualProvider,
                                status: 'MOVED'
                            });
                        } else if (!actualProvider) {
                            detailedMissingList.push({
                                gameCode: game.gameCode,
                                gameName: game.gameName,
                                expectedProvider: p.provider,
                                actualProviderInDB: null,
                                status: 'TRULY_MISSING'
                            });
                        }
                    }
                }
            } catch (e) {
                console.error(`Error processing ${p.provider}:`, e.message);
            }
        }

        fs.writeFileSync('missing_games_detail.json', JSON.stringify(detailedMissingList, null, 2));
        console.log(`\nGenerated detailed list with ${detailedMissingList.length} games.`);
        console.log('Saved to missing_games_detail.json');
        
        // Quick summary
        const trulyMissing = detailedMissingList.filter(g => g.status === 'TRULY_MISSING');
        console.log(`Truly Missing: ${trulyMissing.length}`);
        console.log(`Moved (Aliased): ${detailedMissingList.length - trulyMissing.length}`);

    } catch(e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}

generateList();
