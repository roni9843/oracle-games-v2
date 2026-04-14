const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const gameSchema = new mongoose.Schema({
    gameCode: String,
    providerCode: String
});
const Game = mongoose.model('Game', gameSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        
        console.log('Fetching JILIS games from API...');
        const res = await axios.post('https://oracleapi.co.uk/getgamelist', {
            token: "4895677890656568745",
            providerCode: "JILIS" 
        });
        
        const apiGames = res.data.data || [];
        console.log(`API returned ${apiGames.length} games.`);

        const dbGames = await Game.find({ gameCode: { $in: apiGames.map(g => g.gameCode) } });
        const dbGameMap = new Map();
        dbGames.forEach(g => dbGameMap.set(g.gameCode, g.providerCode));

        const distribution = {};

        apiGames.forEach(g => {
            const currentProvider = dbGameMap.get(g.gameCode);
            if (currentProvider) {
                distribution[currentProvider] = (distribution[currentProvider] || 0) + 1;
            } else {
                distribution['MISSING'] = (distribution['MISSING'] || 0) + 1;
            }
        });

        const fs = require('fs');
        fs.writeFileSync('jilis_location.json', JSON.stringify(distribution, null, 2));
        console.log('Distribution saved to jilis_location.json');

    } catch(e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
check();
