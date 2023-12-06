require('dotenv').config();

var service = require("./service")

if (process.argv && process.argv.length > 2) {
    let count = 1;
    let amount = 0.01;
    if (process.argv.length > 3) {
        amount = process.argv[3]
    }
    if (process.argv.length > 4) {
        count = process.argv[4]
    }
    switch (process.argv[2]) {
        case "holder":
            service.startBot(process.argv && process.argv[2])
            break;
        case "buy":
            console.log("buy")
            for (let i = 0; i < count; i++) {
                service.swapEthForToken(amount);
            }
            break;
        case "sell":
            console.log("sell")
            for (let i = 0; i < count; i++) {
                service.swapTokenForEth(amount);
            }
            break;
        default:
            break;
    }
}


