const express = require('express')
const app = express()
const logSymbols = require('log-symbols')
let log = require('fancy-log')
const db = require('./db')
const addToLibreNet6 = require('./addToLibreNet6')
const generateRSAKeypair = require('generate-rsa-keypair')
const forge = require('node-forge')

if(process.env.NODE_ENV === 'test') {
    log = console
}

const handlePut = (req, res) => (err)=> {
    if (err) {
        log.warn(logSymbols.warning, 'Error saving data to '+ req.body.apiKey)
        res.json({ error: 'The configuration could not be saved' })
        return
    }
    log.info(logSymbols.success, 'New config saved: '+ req.body.apiKey)
    addToLibreNet6(req.body.config)
        .then((ln6)=>{
            res.json({ status: 200, librenet6: ln6})
        })
        .catch(err => res.json({ status: 200, librenet6: { error: err }}))
}

app.use(express.json())

app.post('/submit', (req, res)=> {
    if (!req.body.apiKey) { 
        res.json({ error: 'missing api key' })
        return
    };
    //todo checkConfig(req.body) => bolean
    
    db.get(req.body.apiKey, (err, value) => {
        if(err) {
            //wait 2 seconds if the api key is invalid
            setTimeout(()=> res.json({ error: 'wrong api key' }), 2000)
            log.error(logSymbols.error, 'Wrong api key used: '+ req.body.apiKey)
            return
        }
        try {
            value = JSON.parse(value)
        } catch(e) { 
            log.warn(logSymbols.warning, 'Error getting the information from '+ req.body.apiKey)
            res.json({ error: 'The configuration could not be saved' })
            return;
        }

        if (value.id) {
            log.warn(logSymbols.warning, 'Api key '+ req.body.apiKey + ' is already used')
            res.json({ error: 'Api key is already used', id: value.id })
            return
        }

        db.put(req.body.apiKey, JSON.stringify(req.body.config), handlePut(req,res))
    })
})

app.post('/support-request', async (req, res) => {
    if (!req.body.apiKey) { 
        res.json({ error: 'missing api key' })
        return
    };

    db.get(req.body.apiKey, (err, value) => {
        if(err) {
            //wait 2 seconds if the api key is invalid
            setTimeout(()=> res.json({ error: 'wrong api key' }), 2000)
            log.error(logSymbols.error, 'Wrong api key used: '+ req.body.apiKey)
            return
        }
        try {
            value = JSON.parse(value)
        } catch(e) { 
            log.warn(logSymbols.warning, 'Error getting the information from '+ req.body.apiKey)
            res.json({ error: 'The configuration could not be saved' })
            return;
        }

        if (value.network) {
            try {
                //Generate ssh key pair
                const keys = generateRSAKeypair()
                let toSend = forge.pki.publicKeyFromPem(keys.public)
                toSend = forge.ssh.publicKeyToOpenSSH(toSend).split(' ')[1]

                //Attach to previous keys
                value.keys = value.keys? [...value.keys, { keys }]: [{ keys }]
                value.requests = value.requests? [...value.requests, req.body.request] : [ req.body.request]

                //Save and send response
                db.put(req.body.apiKey, JSON.stringify(value), (err) => {
                    if (err) { return res.json({ error: 'The configuration could not be saved' }) }
                    return res.json({ sshKey: toSend, name: 'remote-support' })
                })
            } catch (e) {
                console.log('Error on support request', e)
                return res.json({e})
            }
        } else {
            return res.json({ error: 'The configuration could not be saved' })
        }

    })
})
module.exports = {
    app,
    handlePut
}