var RIPEMD160 = require('ripemd160')
require('dotenv').config();
const { ethers } = require("ethers");

var service = require("./service")

// service.startBot(5)

if(process.argv.length > 2) {
    console.log(`Source: ${process.argv[2]}`)
    console.log(`Result Hash: ${new RIPEMD160().update(process.argv[2]).digest('hex')}`)
}