require('dotenv').config()
const db = require('../db')
const logSymbols = require('log-symbols')
const generatePassword = require("password-generator")

const key = generatePassword(12,false)

db.put(key, "{}", (err)=>{
    if(err) {
        console.error(logSymbols.error, 'Error when generating the identifier')
        console.error(JSON.stringify(err))
        return;
    }
    console.log(logSymbols.success, 'Key generated')
    console.log(key)
})
