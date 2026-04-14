const axios = require('axios');

async function check() {
    try {
        console.log('Fetching JILIS games from Oracle API...');
        const res = await axios.post('https://oracleapi.co.uk/getgamelist', {
            token: "4895677890656568745",
            providerCode: "JILIS" // Expected 199, DB has 80
        });
        
        if (res.data && res.data.data) {
            console.log(`API returned ${res.data.data.length} games for JILIS.`);
            if (res.data.data.length === 80) {
                 console.log('CONFIRMED: API now returns 80 games, matching DB.');
            } else {
                 console.log(`MISMATCH: API returns ${res.data.data.length}, DB has 80.`);
            }
        } else {
            console.log('API returned no data');
        }
    } catch (e) {
        console.error(e.message);
    }
}
check();
