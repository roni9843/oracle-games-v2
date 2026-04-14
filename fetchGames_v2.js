/**
 * fetchGames_v2.js
 * ─────────────────────────────────────────────────────────────
 * Fetches ALL games from the external API for every provider.
 * Uses (gameCode + providerCode) as the unique pair — so the
 * same gameCode from two different providers is treated as a
 * DIFFERENT game and will be inserted separately.
 *
 * Run: node fetchGames_v2.js
 */

require('dotenv').config();
const axios    = require('axios');
const mongoose = require('mongoose');

// ── DB connect ────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });

// ── Models (inline, no import path issues) ───────────────────
const providerSchema = new mongoose.Schema({ providerCode: String, providerName: String, gameType: String });
const gameSchema = new mongoose.Schema({
    gameCode:      { type: String, required: true, trim: true },
    gameName:      { type: String, required: true, trim: true },
    jackpot:       { type: String, default: 'FALSE' },
    image:         { type: String, default: null },
    gameType:      { type: String, default: null },
    eventGameType: { type: String, default: null },
    freeTry:       { type: String, default: 'FALSE' },
    seq:           { type: Number, default: 0 },
    rtp:           { type: Number, default: 0 },
    balance:       { type: Number, default: null },
    providerCode:  { type: String, required: true, trim: true },
}, { timestamps: true });

const Provider = mongoose.models.Provider || mongoose.model('Provider', providerSchema);
const Game     = mongoose.models.Game     || mongoose.model('Game',     gameSchema);

// ── Helpers ───────────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const fetchGamesFromAPI = async (providerCode) => {
    try {
        const res = await axios.post(process.env.GAME_API_URL, {
            token: process.env.GAME_API_TOKEN,
            providerCode,
        }, { timeout: 30000, headers: { 'Content-Type': 'application/json' } });

        if (res.data && res.data.success && Array.isArray(res.data.data)) {
            return res.data.data;
        }
        return [];
    } catch (err) {
        console.log(`  ⚠️  API error for ${providerCode}: ${err.message}`);
        return [];
    }
};

// ── Main ──────────────────────────────────────────────────────
const run = async () => {
    await new Promise(r => mongoose.connection.once('connected', r));

    const providers = await Provider.find({}).lean();
    console.log(`\n🎮 Found ${providers.length} providers in DB\n${'='.repeat(60)}`);

    let totalInserted  = 0;
    let totalSkipped   = 0;
    let failedProviders = [];

    for (let i = 0; i < providers.length; i++) {
        const provider  = providers[i];
        const pCode     = provider.providerCode;
        const progress  = `[${i + 1}/${providers.length}]`;

        console.log(`\n${progress} 🔄 Fetching: ${pCode} (${provider.providerName || ''})...`);

        const games = await fetchGamesFromAPI(pCode);

        if (games.length === 0) {
            console.log(`${progress} ⏭️  No games returned for ${pCode}`);
            failedProviders.push(pCode);
            await delay(500);
            continue;
        }

        console.log(`  📦 API returned ${games.length} games`);

        // Build set of already-inserted (gameCode, providerCode) pairs for this provider
        const existingInDB = await Game.find({ providerCode: pCode }, { gameCode: 1 }).lean();
        const existingSet  = new Set(existingInDB.map(g => g.gameCode));

        const toInsert = games
            .filter(g => g.gameCode && !existingSet.has(g.gameCode))
            .map(g => ({
                gameCode:      g.gameCode,
                gameName:      g.gameName || 'Unknown',
                jackpot:       g.jackpot  || 'FALSE',
                image:         g.image    || null,
                gameType:      g.gameType || null,
                eventGameType: g.eventGameType || null,
                freeTry:       g.freeTry  || 'FALSE',
                seq:           g.seq      || 0,
                rtp:           g.rtp      || 0,
                balance:       g.balance  || null,
                providerCode:  pCode,
            }));

        const skipped = games.length - toInsert.length;
        totalSkipped += skipped;

        if (toInsert.length === 0) {
            console.log(`${progress} ✅ ${pCode}: all ${games.length} already in DB`);
            await delay(500);
            continue;
        }

        try {
            const result = await Game.insertMany(toInsert, { ordered: false });
            totalInserted += result.length;
            console.log(`${progress} ✅ ${pCode}: inserted ${result.length}, skipped ${skipped}`);
        } catch (err) {
            // ordered:false — partial insert possible
            const inserted = err.result?.nInserted || 0;
            totalInserted += inserted;
            console.log(`${progress} ⚠️  ${pCode}: inserted ${inserted}, errors ${err.writeErrors?.length || 0}, skipped ${skipped}`);
        }

        await delay(800);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Done!`);
    console.log(`   ✅ Total newly inserted : ${totalInserted}`);
    console.log(`   ⏭️  Total already existed: ${totalSkipped}`);
    console.log(`   ❌ Providers with no data: ${failedProviders.length}`);
    if (failedProviders.length > 0) {
        console.log(`   📋 ${failedProviders.join(', ')}`);
    }

    mongoose.connection.close();
    process.exit(0);
};

run().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
