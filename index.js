require('dotenv').config();

var service = require("./service")

service.startBot(process.argv && process.argv[2])

