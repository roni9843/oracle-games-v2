/**
 * Seed Providers Script
 * docs_2.txt থেকে সব provider data MongoDB তে save করে
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Provider = require('../models/Provider');

// All providers from docs_2.txt
const providers = [
  { providerCode: 'DGDS', providerName: 'DREAM GAMING SEAMLESS', gameType: 'CASINO' },
  { providerCode: 'KING855S', providerName: 'KING855 SEAMLESS', gameType: 'CASINO' },
  { providerCode: 'WMCDS', providerName: 'WM CASINO SEAMLESS', gameType: 'CASINO' },
  { providerCode: 'TBC', providerName: '2BC', gameType: 'SPORTS' },
  { providerCode: 'EDP', providerName: 'Endorphina Slots', gameType: 'SLOT' },
  { providerCode: 'FC', providerName: 'FaChai', gameType: 'SLOT' },
  { providerCode: 'DS88', providerName: 'DS88', gameType: 'COCKFIGHT' },
  { providerCode: 'JILIS', providerName: 'JILI GAMING SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'PS', providerName: 'PlayStar', gameType: 'SLOT' },
  { providerCode: 'SPRIBE', providerName: 'SPRIBE', gameType: 'SLOT' },
  { providerCode: 'AVIATRIX', providerName: 'Aviatrix', gameType: 'SLOT' },
  { providerCode: 'LMONACO_UNI', providerName: 'Lucky Monaco', gameType: 'SLOT' },
  { providerCode: 'KINGH5', providerName: '888King H5', gameType: 'SLOT' },
  { providerCode: 'LUDOBET', providerName: 'Ludo Bet', gameType: 'SLOT' },
  { providerCode: 'ACEWINS', providerName: 'AceWin Seamless', gameType: 'SLOT' },
  { providerCode: 'KAGAMING', providerName: 'KA Gaming Seamless', gameType: 'SLOT' },
  { providerCode: 'SABA', providerName: 'SABA Sports', gameType: 'SPORTS' },
  { providerCode: 'EVODO', providerName: 'EVOLUTION SEAMLESS (NEW)', gameType: 'CASINO' },
  { providerCode: 'OBET', providerName: 'OBET Sports', gameType: 'SPORTS' },
  { providerCode: 'SPS', providerName: 'SIMPLE PLAY', gameType: 'SLOT' },
  { providerCode: 'BPOT_UNI', providerName: 'Bigpot Gaming', gameType: 'SLOT' },
  { providerCode: 'PPLCO', providerName: 'PRAGMATIC LIVE (NEW)', gameType: 'CASINO' },
  { providerCode: 'VGS', providerName: 'VIVO GAMING', gameType: 'CASINO' },
  { providerCode: 'PPDSO', providerName: 'PRAGMATIC PLAY (NEW)', gameType: 'SLOT' },
  { providerCode: 'MASCOT', providerName: 'MASCOT GAMING', gameType: 'SLOT' },
  { providerCode: 'NES', providerName: 'NET ENT SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'RTS', providerName: 'RED TIGER SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'BTGS', providerName: 'BIG TIME GAMING SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'NLCS', providerName: 'NO LIMIT CITY SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'LUCKYSPORTS', providerName: 'LUCKY SPORTS', gameType: 'SPORTS' },
  { providerCode: 'PGSS', providerName: 'PGSOFT SEAMLESS', gameType: 'SLOT' },
  { providerCode: 'NEXTSPIN', providerName: 'NEXTSPIN', gameType: 'SLOT' },
  { providerCode: 'HACKSAW', providerName: 'HACKSAW SLOTS', gameType: 'SLOT' },
  { providerCode: 'SMARTS', providerName: 'SMARTSOFT', gameType: 'SLOT' },
  { providerCode: 'GENESIS', providerName: 'GENESIS', gameType: 'SLOT' },
  { providerCode: 'FASTSPIN', providerName: 'FASTSPIN', gameType: 'SLOT' },
  { providerCode: 'SADSO', providerName: 'SA GAMING', gameType: 'CASINO' },
  { providerCode: 'BOGSO', providerName: 'BNG', gameType: 'SLOT' },
  { providerCode: 'ADVANT_UNI', providerName: 'ADVANTPLAY', gameType: 'SLOT' },
  { providerCode: 'WEGAMING', providerName: 'WE GAMING', gameType: 'SLOT' },
  { providerCode: 'PTS', providerName: 'PLAYTECH SEAMLESS', gameType: 'CASINO' },
  { providerCode: 'ASPECTS', providerName: 'ASPECT GAMING SEAMLESS', gameType: 'HORSEBOOK' },
  { providerCode: 'ASTAR', providerName: 'ASTAR', gameType: 'CASINO' },
  { providerCode: 'EZUGIS', providerName: 'EZUGI', gameType: 'CASINO' },
  { providerCode: 'DSTPLAY', providerName: 'DSTPLAY', gameType: 'SLOT' },
  { providerCode: 'GAMEBEAT_UNI', providerName: 'GAMEBEAT', gameType: 'SLOT' },
  { providerCode: 'IBEX_UNI', providerName: 'IBEX', gameType: 'SLOT' },
  { providerCode: 'IDG_UNI', providerName: 'IDG', gameType: 'SLOT' },
  { providerCode: 'ABSO', providerName: 'ALLBETS SEAMLESS', gameType: 'CASINO' },
  { providerCode: 'AMIGO', providerName: 'AMIGO GAMING', gameType: 'CASINO' },
  { providerCode: 'BG_UNI', providerName: 'BGAMING', gameType: 'SLOT' },
  { providerCode: 'JDBS', providerName: 'JDB', gameType: 'SLOT' },
  { providerCode: 'KMSO', providerName: 'KINGMAKER', gameType: 'SLOT' },
  { providerCode: 'MARIOSO', providerName: 'MARIO CLUB', gameType: 'SLOT' },
  { providerCode: 'TVBET', providerName: 'TVBET', gameType: 'LOTTERY' },
  { providerCode: 'JKSO', providerName: 'JOKER', gameType: 'SLOT' },
  { providerCode: 'BGSO', providerName: 'BIG GAMES', gameType: 'CASINO,SLOT,FISHING' },
  { providerCode: 'WEBET', providerName: 'WBET SPORTS', gameType: 'SPORTS' },
  { providerCode: 'WMGSO', providerName: 'World Match', gameType: 'SLOT' },
  { providerCode: 'HBRDS', providerName: 'HABANERO', gameType: 'SLOT' },
  { providerCode: 'WS', providerName: 'WS SPORTS', gameType: 'SPORTS' },
  { providerCode: 'PITTAPLUS_UNI', providerName: 'PITTA PLUS', gameType: 'SLOT' },
  { providerCode: 'PNGS', providerName: 'PLAY N GO', gameType: 'SLOT' },
  { providerCode: 'AWCSO', providerName: 'SEXY BACCARAT', gameType: 'CASINO' },
  { providerCode: 'NETG_UNI', providerName: 'NET GAMING', gameType: 'SLOT' },
  { providerCode: 'PIXMOVE', providerName: 'PIXMOVE', gameType: 'SLOT' },
  { providerCode: 'IMOON', providerName: 'IMOON', gameType: 'SLOT' },
  { providerCode: 'AGDSO', providerName: 'ASIA GAMINGS', gameType: 'CASINO' },
  { providerCode: 'SBOS', providerName: 'SBOBET', gameType: 'SPORTS' },
  { providerCode: 'WIN568S', providerName: '568WIN SPORTS (PHP ONLY)', gameType: 'SPORTS' },
  { providerCode: 'DSO', providerName: 'DRAGOON SOFT', gameType: 'SLOT' },
  { providerCode: 'YBS', providerName: 'YEEBET', gameType: 'CASINO' },
  { providerCode: 'BARBARA_UNI', providerName: 'BARBARA BANG', gameType: 'SLOT' },
  { providerCode: 'PHOENIX7_UNI', providerName: 'PHOENIX7', gameType: 'SLOT' },
  { providerCode: 'VA_UNI', providerName: 'VA GAMING', gameType: 'SLOT' },
  { providerCode: 'INOUT', providerName: 'INOUT', gameType: 'SLOT' }
];

const seedProviders = async () => {
  try {
    await connectDB();

    console.log('🔄 Seeding providers...\n');

    let created = 0;
    let updated = 0;

    for (const provider of providers) {
      const result = await Provider.findOneAndUpdate(
        { providerCode: provider.providerCode },
        provider,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
        console.log(`  ✅ Created: ${provider.providerCode} — ${provider.providerName}`);
      } else {
        updated++;
        console.log(`  🔄 Updated: ${provider.providerCode} — ${provider.providerName}`);
      }
    }

    console.log(`\n✅ Seed complete! Created: ${created}, Updated: ${updated}, Total: ${providers.length}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error.message);
    process.exit(1);
  }
};

seedProviders();
