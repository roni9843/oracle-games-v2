/**
 * Fetch Games Script
 * External API থেকে প্রতিটি provider এর games fetch করে MongoDB তে save করে
 * Run: npm run fetch-games
 */

require('dotenv').config();
const axios = require('axios');
const connectDB = require('../config/db');
const Provider = require('../models/Provider');
const Game = require('../models/Game');

// Delay helper to avoid rate-limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchGamesForProvider = async (providerCode) => {
  try {
    const response = await axios.post(process.env.GAME_API_URL, {
      token: process.env.GAME_API_TOKEN,
      providerCode: providerCode
    }, {
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data && response.data.success && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  } catch (error) {
    console.log(`  ⚠️  Error fetching ${providerCode}: ${error.message}`);
    return [];
  }
};

const fetchAllGames = async () => {
  try {
    await connectDB();

    // Get all providers from DB
    const providers = await Provider.find({}).lean();
    console.log(`\n🎮 Found ${providers.length} providers in DB\n`);
    console.log('='.repeat(60));

    let totalGames = 0;
    let totalProvidersFetched = 0;
    let failedProviders = [];

    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      const progress = `[${i + 1}/${providers.length}]`;

      console.log(`\n${progress} 🔄 Fetching: ${provider.providerCode} (${provider.providerName})...`);

      const games = await fetchGamesForProvider(provider.providerCode);

      if (games.length === 0) {
        console.log(`${progress} ⏭️  No games found for ${provider.providerCode}`);
        failedProviders.push(provider.providerCode);
        await delay(500);
        continue;
      }

      let savedCount = 0;
      let skippedCount = 0;

      for (const game of games) {
        try {
          await Game.findOneAndUpdate(
            { gameCode: game.gameCode },
            {
              gameCode: game.gameCode,
              gameName: game.gameName || 'Unknown',
              jackpot: game.jackpot || 'FALSE',
              image: game.image || null,
              gameType: game.gameType || null,
              eventGameType: game.eventGameType || null,
              freeTry: game.freeTry || 'FALSE',
              seq: game.seq || 0,
              rtp: game.rtp || 0,
              balance: game.balance || null,
              providerCode: provider.providerCode
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          savedCount++;
        } catch (err) {
          skippedCount++;
        }
      }

      totalGames += savedCount;
      totalProvidersFetched++;

      console.log(`${progress} ✅ ${provider.providerCode}: ${savedCount} games saved, ${skippedCount} skipped`);

      // Delay between providers to avoid rate-limiting
      await delay(1000);
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n🎉 Fetch Complete!`);
    console.log(`   📊 Total games saved: ${totalGames}`);
    console.log(`   ✅ Providers with games: ${totalProvidersFetched}`);
    console.log(`   ⏭️  Providers with no games: ${failedProviders.length}`);

    if (failedProviders.length > 0) {
      console.log(`   📋 No games: ${failedProviders.join(', ')}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Fetch Error:', error.message);
    process.exit(1);
  }
};

fetchAllGames();
