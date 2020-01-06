const level = require('level')

if(process.env.NODE_ENV === 'test') {
    process.env.DB = 'soporteremoto-tier-db-test'
}

const db = level(process.env.DB || 'soporteremoto-tier')

module.exports = db
