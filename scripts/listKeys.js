require('dotenv').config()
const db = require('../src/db')
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const Table = require('cli-table')

const listKeys = (cb) => {

    const table = new Table({
        head: ['Api key', 'Community', 'Device'],
        colWidths: [15, 40, 40]
    });
    
    db.createReadStream({ keys: true, values: true })
        .on('data', (data) => {
            const key = data.key
            data = JSON.parse(data.value) 
            table.push([key, data.communityName? data.communityName: '', data.device? data.device.name: ''])
        })
        .on('close', () => {
            console.log(table.toString())
        })
}

if(process.env.NODE_ENV !== 'test') {
    listKeys((result)=>{
        if (!result) return;
        if(result.error) {
            return log(logSymbols.error, result.error)
        }
        return log(logSymbols.success, result.successs)
    })
}

module.exports = {
    listKeys
}