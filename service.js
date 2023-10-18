const { ethers } = require("ethers");
const ERC20 = require("./src/abis/ERC20.json")
const csv = require("csv-parser");
const fs = require("fs");

class Service {

    constructor() {
        this.provider = new ethers.JsonRpcProvider("https://goerli.infura.io/v3/35bdaa33a8834ed4adbcb0cf06f15f26")
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
        this.tokenContract = new ethers.Contract(process.env.TOKEN_ADDR, ERC20.abi, this.wallet)
    }

    createAccount() {
        return ethers.Wallet.createRandom()
    }

    async startBot(count) {

        fs.createReadStream('./list.csv')
            .pipe(csv())
            .on('data', async (row) => {
                this.tokenTransfer(row.address, row.amount)
            })
            .on('end', () => {
                console.log('CSV file successfully processed');
            });
        
    }

    async tokenTransfer(to, amount) {
        try {
            let tx = await this.tokenContract.transfer(to, amount);
            console.log(tx.hash)
        } catch (err) {
            console.log(err)
        }
    }

    async tokenTransferFrom(from, to, amount) {
        await this.tokenContract.transferFrom(from, to, amount);
    }
}

module.exports = new Service();