const { ethers } = require("ethers");
const ERC20 = require("./src/abis/ERC20.json")
const ROUTER = require("./src/abis/Router.json")
const csv = require("csv-parser");
const fs = require("fs");
const accounts = require("./accounts.json")

class Service {

    constructor() {
        this.provider = new ethers.JsonRpcProvider(process.env.RPC)
        this.wallet = new ethers.Wallet(accounts["0"], this.provider)
        this.tokenAddr = process.env.TOKEN_ADDR
        this.routerAddr = process.env.ROUTER_ADDR
        this.weth9Addr = process.env.WETH_ADDR
        this.tokenContract = new ethers.Contract(this.tokenAddr, ERC20.abi, this.wallet)
        this.routerContract = new ethers.Contract(this.routerAddr, ROUTER, this.wallet)

        this.getAmountsOut("1000")
    }

    getWallet(index) {
        new ethers.Wallet(accounts[index], this.provider)
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
                for (let i = 0; i < rows.length; i++) {
                    if (!count || i < count) {
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


    async startTrade(amount) {

    }

    async getAmountsOut(amount) {

        // Define the path with input and output tokens
        const path = [this.tokenAddr, this.weth9Addr];

        // Specify the input amount (e.g., 1 ETH in wei)
        const amountIn = ethers.parseEther(amount);

        const amountsOut = await this.routerContract.getAmountsOut(amountIn, path);
        const amountOut = amountsOut[amountsOut.length - 1];

        return amountOut;
    }

    calculateAmountOutMin(amountOut, slippage) {
        return (amountOut.toString() * (1 - slippage)).toString();
    }

    async swapTokenForEth(amount, account = this.wallet) {
        try {
            await this.tokenContract.connect(account).approve(this.routerAddr, ethers.parseEther(amount));
            let tx = await this.routerContract.connect(account).swapExactTokensForETHSupportingFeeOnTransferTokens(
                ethers.parseEther(amount),
                1,
                [this.tokenAddr, this.weth9Addr],
                this.wallet.address,
                ethers.MaxUint256,
                {  });
            console.log("Sell " + tx.hash)
        } catch (err) {
            console.log("Sell " + err)
        }
    }

    async swapEthForToken(amount, account = this.wallet) {
        try {

            let balance = await this.provider.getBalance(account.address);
            const slippage = 0.01; // 1%
            const amountOutMin = this.calculateAmountOutMin(amount, slippage);
            let gasPrice = (await this.provider.getFeeData()).gasPrice.toString() * 1.5;
            gasPrice = gasPrice.toString();
            console.log(gasPrice)
            let tx = await this.routerContract.connect(account).swapETHForExactTokens(ethers.parseEther(amountOutMin),
                [this.weth9Addr, this.tokenAddr],
                this.wallet.address,
                ethers.MaxUint256,
                { value: (balance.toString() * 0.9).toString(), gasPrice: gasPrice });
            console.log("Buy " + tx.hash)
        } catch (err) {
            console.log("Buy " + err)
        }
    }

    async tokenTransferFrom(from, to, amount) {
        await this.tokenContract.transferFrom(from, to, amount);
    }
}

module.exports = new Service();