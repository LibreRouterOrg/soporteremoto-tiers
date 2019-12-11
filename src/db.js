const level = require('level')

const db = level(process.env.DB || 'soporteremoto-tier')

module.exports = db
