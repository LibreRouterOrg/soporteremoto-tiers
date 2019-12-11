require('dotenv').config()
const db = require('../src/db')
const logSymbols = require('log-symbols')
const generatePassword = require("password-generator")

const handlePut = (key, cb) => (err)=> {
    if(err) {
        console.error(logSymbols.error, 'Error when generating the identifier')
        console.error(JSON.stringify(err))
        cb(err);
        return
    }
    console.log(logSymbols.success, 'Key generated')
    console.log(key)
    cb(key);
}

const generateRandomKey = (cb=()=>{}) => {
    const key = generatePassword(12,false)
    db.put(key, '{}', handlePut(key, cb))
}

if (process.env.NODE_ENV !== 'test') {
    generateRandomKey()
}

module.exports = {
    generateRandomKey,
    handlePut
}
