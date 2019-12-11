require('dotenv').config()
const db = require('../src/db')
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const readline = require('readline')

const handleDel = (key, cb) => (err)=>{
    if(err) {
        console.error(logSymbols.error, 'Error deleting the key' + key)
        console.error(JSON.stringify(err))
        return cb({error: 'cannot be deleted'});
    }
    console.log(logSymbols.success, `Key ${key} deleted `)
    return cb({success: true})
}

const handleGet = (key, cb, rl) => (err, value) => {
    if(err !== null || typeof value === 'undefined') {
        console.error(logSymbols.error, 'Error key ' + key + ' not found')
        rl.close();
        return cb({error: 'not found'});
    }
    rl.question(`Are you sure you want to remove the key ${key}? [y/n]`, (answer) => {
        rl.close()

        if(answer.toLowerCase() !== 'y') {
            return cb({cancel: true})
        }

        db.del(key, handleDel(key, cb))
    })
}

const deleteKey = (key, cb) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    db.get(key, handleGet(key, cb, rl))
}

if(process.env.NODE_ENV !== 'test') {
    const key = process.argv[process.argv.length - 1];
    deleteKey(key, ()=>{})
}

module.exports = {
    deleteKey,
    handleGet,
    handleDel
}