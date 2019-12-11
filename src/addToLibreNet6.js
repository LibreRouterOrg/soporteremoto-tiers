const fetch = require('node-fetch')

module.exports = (config) => 
        fetch(process.env.LNET6_BOT_URL, {
            method: 'POST',
            body: JSON.stringify({
                communityName: config.communityName,
                deviceName: config.device.name,
                pubKey: config.device.pubKey
            }),
            headers: { 'Content-Type': 'application/json' }
        })
        .then( res => res.json())
