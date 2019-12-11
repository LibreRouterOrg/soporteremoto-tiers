require('dotenv').config()
const db = require('../src/db')
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

const key = process.argv[process.argv.length - 1];

db.get(key, (err) => {
    if(err) {
        console.error(logSymbols.error, 'Error key ' + key + ' not found')
        rl.close();
        return;
    }
    rl.question(`Are you sure you xwant to remove the key ${key}? [y/n]`, (answer) => {
        rl.close()

        if(answer.toLowerCase() !== 'y') {
            return
        }

        db.del(key, (err)=>{
            if(err) {
                console.error(logSymbols.error, 'Error deleting the key' + key)
                console.error(JSON.stringify(err))
                return;
            }
            console.log(logSymbols.success, `Key ${key} deleted `)
            console.log(key)
            return
        })     
    })
})