require('dotenv').config()
const db = require('../src/db')
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const readline = require('readline')
const addToLibreNet6 = require('../src/addToLibreNet6')

const handleGet = (key, cb, rl) => (err, value) => {
    if(err !== null || typeof value === 'undefined') {
        console.error(logSymbols.error, 'Error key ' + key + ' not found')
        rl.close();
        return cb({error: 'not found'});
    }
    rl.question(`Are you sure you want to resent the key ${key}? [y/n]`, async (answer) => {
        rl.close()

        if(answer.toLowerCase() !== 'y') {
            return cb()
        }

        if (!process.env.LNET6_BOT_URL) return cb({error: 'Missing bot url'})

        try {
            const data = JSON.parse(value);
            const response = await addToLibreNet6(data)
            if (response.error) return cb({error: 'Bot error - '+ response.error})
            console.log(key+' configuration successfully resent')
            return cb({success: key+' configuration successfully resent'})
        }
        catch (e) {
            console.log(e)
            cb({error: 'Bot error'})
        }
    })
}

const resendKey = (key, cb) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    db.get(key, handleGet(key, cb, rl))
}

if(process.env.NODE_ENV !== 'test') {
    const key = process.argv[process.argv.length - 1];
    resendKey(key, (result)=>{
        if (!result) return;
        if(result.error) {
            return log(logSymbols.error, result.error)
        }
        return log(logSymbols.success, result.success)
    })
}

module.exports = {
    resendKey,
    handleGet
}