require('dotenv').config()
const express = require('express')
const Server = express()
const log = require('fancy-log')
const logSymbols = require('log-symbols')
const app = require('./src/app')

const port = process.env.PORT || 3000

Server.use(app)

Server.listen(port,() => {
    log.info(`${logSymbols.info} Server starterd at port ${port}`)
})