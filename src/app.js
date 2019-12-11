const express = require('express')
const app = express()
const logSymbols = require('log-symbols')
const log = require('fancy-log')
const db = require('./db')
const addToLibreNet6 = require('./addToLibreNet6')

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
        db.put(req.body.apiKey, JSON.stringify(req.body.config), (err)=> {
            if (err) {
                log.warn(logSymbols.warning, 'Error saving data to '+ req.body.apiKey)
                res.json({ error: 'The configuration could not be saved' })
                return
            }
            log.info(logSymbols.success, 'New config saved: '+ req.body.apiKey)
            addToLibreNet6(req.body.config)
                .then((res)=>{
                    res.json({ status: 200, librenet6: res})
                })
                .catch(err => res.json({ status: 200, librenet6: err}))

        })
    })
})

module.exports = app