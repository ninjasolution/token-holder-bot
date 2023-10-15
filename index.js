require('dotenv').config();

var service = require("./service")

if(process.argv.length > 2) {
    service.startBot(Number.parseInt(process.argv[2]))
}

