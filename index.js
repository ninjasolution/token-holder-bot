require('dotenv').config();
const { ethers } = require("ethers");
const accounts = require("./accounts.json")

var service = require("./service")

if (process.argv && process.argv.length > 2) {
    let count = 1;
    let amount = "0.01";
    

    let argments = process.argv.slice(2, process.argv.length);
    let commants = [];
    for(let i=0 ; i<argments.length ; i+=3) {
        commants.push([argments[i], argments[i+1], argments[i+2]])
    }

    console.log(commants)

    commants.forEach(commant => {

        let wallet = service.getWallet(commant[1] || "0")

        switch (commant[0]) {
            case "holder":
                service.startBot(commant[1])
                break;
            case "buy":
                console.log("buy")
                for (let i = 0; i < count; i++) {
                    service.swapEthForToken(commant[2] || amount, wallet);
                }
                break;
            case "sell":
                console.log("sell")
                for (let i = 0; i < count; i++) {
                    service.swapTokenForEth(commant[2] || amount, wallet);
                }
                break;
            default:
                break;
        }
    })
}


//npm run start buy 1 2