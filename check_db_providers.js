const mongoose = require('mongoose');
require('dotenv').config();

const gameSchema = new mongoose.Schema({
    gameCode: String,
    providerCode: String
});
const Game = mongoose.model('Game', gameSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const results = await Game.aggregate([
            { $group: { _id: "$providerCode", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        console.log('Provider | Count');
        console.log('---------|------');
        results.forEach(r => {
            console.log(`${r._id.padEnd(9)} | ${r.count}`);
        });

    } catch(e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
check();
