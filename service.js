const { ethers } = require("ethers");
const ERC20 = require("./src/abis/ERC20.json")
const ROUTER = require("./src/abis/Router.json")
const csv = require("csv-parser");
const fs = require("fs");

class Service {

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.RPC)
        this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
        this.tokenAddr = process.env.TOKEN_ADDR
        this.routerAddr = process.env.ROUTER_ADDR
        this.weth9Addr = process.env.WETH_ADDR
        this.tokenContract = new ethers.Contract(this.tokenAddr, ERC20.abi, this.wallet)
        this.routerContract = new ethers.Contract(this.routerAddr, ROUTER, this.wallet)
    }

    createAccount() {
        return ethers.Wallet.createRandom()
    }

    async startBot(count) {
        let rows = [];
        fs.createReadStream('./list.csv')
            .pipe(csv())
            .on('data', async (row) => {
                rows.push(row)
            })
            .on('end', async () => {
                for(let i=0 ; i<rows.length ; i++) {
                    if(!count || i < count) {
                        await this.tokenTransfer(rows[i].address, ethers.parseEther(rows[i].amount))
                        console.log(i + 1, rows[i].address, rows[i].amount)
                    }
                }
                console.log('CSV file successfully processed');
            });
        
    }

    async tokenTransfer(to, amount) {
        try {
            let tx = await this.tokenContract.transfer(to, amount);
            // console.log(tx.hash)
        } catch (err) {
            console.log(err)
        }
    }

    async swapTokenForEth(amount) {
        try {
            await this.tokenContract.approve(this.routerAddr, ethers.parseEther(amount));
            let tx = await this.routerContract.swapExactTokensForETHSupportingFeeOnTransferTokens(
                ethers.parseEther(amount),
                1,
                [this.tokenAddr, this.weth9Addr],
                this.wallet.address,
                ethers.MaxUint256);
            console.log(tx.hash)
        } catch (err) {
            console.log(err)
        }
    }

    async swapEthForToken(amount) {
        try {
            let tx = await this.routerContract.swapETHForExactTokens(ethers.parseEther(amount),
            [this.weth9Addr, this.tokenAddr],
            this.wallet.address,
            ethers.MaxUint256,
            { value: ethers.parseEther(amount) });
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