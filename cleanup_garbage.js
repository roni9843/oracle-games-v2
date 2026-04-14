const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        const result = await mongoose.connection.collection('providers').deleteMany({ 
            providerCode: { $in: ['Provider Code', '1.'] } 
        });
        console.log(`Deleted ${result.deletedCount} garbage providers.`);
        
        // Also check if any games linked to these?
        const gamesResult = await mongoose.connection.collection('games').deleteMany({
             providerCode: { $in: ['Provider Code', '1.'] }
        });
        console.log(`Deleted ${gamesResult.deletedCount} garbage games.`);
        
        mongoose.connection.close();
    })
    .catch(err => console.error(err));
