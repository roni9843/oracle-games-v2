const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error(err));

const providerSchema = new mongoose.Schema({
    providerCode: String,
    providerName: String,
    gameType: String
});
const Provider = mongoose.model('Provider', providerSchema);

async function check() {
    try {
        const dbProviders = await Provider.find({});
        const dbCodes = new Set(dbProviders.map(p => p.providerCode));
        console.log(`DB has ${dbCodes.size} providers.`);

        const docs2Path = path.join(__dirname, 'docs_2.txt');
        const fileContent = fs.readFileSync(docs2Path, 'utf8');
        const lines = fileContent.split('\n');
        const fileProviders = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if(!line) continue;
            // Split by tab or multiple spaces
            const parts = line.split(/\t+/); // Try tab first as per copy-paste likely
            // If tab split fails (length 1), try space
            const cols = parts.length > 1 ? parts : line.split(/\s{2,}/); 
            
            if(cols.length >= 2) {
                fileProviders.push({
                    providerCode: cols[0].trim(),
                    providerName: cols[1].trim(),
                    gameType: cols[2] ? cols[2].trim() : 'SLOT' // Default to SLOT if missing
                });
            }
        }
        console.log(`File has ${fileProviders.length} providers parsed.`);

        const missingInDb = fileProviders.filter(p => !dbCodes.has(p.providerCode));
        console.log('Providers in File but NOT in DB:', missingInDb.map(p => p.providerCode));
        
        fs.writeFileSync('missing_providers.json', JSON.stringify(missingInDb, null, 2));
        console.log('Saved missing providers to missing_providers.json');

        const missingInFile = [...dbCodes].filter(code => !fileCodes.has(code));
        console.log('Providers in DB but NOT in File:', missingInFile);

    } catch (e) {
        console.error(e);
    } finally {
        mongoose.connection.close();
    }
}
check();
