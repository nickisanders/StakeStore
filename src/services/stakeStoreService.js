const { ethers } = require('ethers');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { createMintTokensTransaction } = require('./pendleService');

// Environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY) {
    throw new Error('Environment variables RPC_URL and PRIVATE_KEY must be set');
}

// Initialize ethers.js provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI to interact with ERC-20 PT tokens (only `balanceOf` is needed)
const ERC20_ABI = [
    "function balanceOf(address owner) external view returns (uint256)"
];

// ABI of the StakeStore smart contract
const STAKESTORE_ABI = [
    "function stakeTokens(address token, uint256 amount, address pool) public",
    "function stakeTokens(address token, uint256 amount, address pool) external",
];

// Create an instance of the StakeStore contract
const stakeStoreContract = new ethers.Contract(CONTRACT_ADDRESS, STAKESTORE_ABI, signer);

// Hardcoded gas settings
const DEFAULT_GAS_LIMIT = '10000000'; // Example gas limit
const DEFAULT_GAS_PRICE = '1000000000'; // Example gas price (10 gwei)

// Load active markets JSON file
const activeMarketsPath = path.resolve(__dirname, '../../active_markets.json');
const activeMarkets = JSON.parse(fs.readFileSync(activeMarketsPath, 'utf8')).markets;

/**
 * Approve a spender to spend a specified amount of an ERC-20 token.
 */
const approveToken = async (tokenAddress, spender, amount) => {
    try {
        const tokenContract = new ethers.Contract(
            tokenAddress,
            [
                'function approve(address spender, uint256 amount) public returns (bool)',
                'function allowance(address owner, address spender) public view returns (uint256)',
            ],
            signer
        );

        console.log(`Approving ${ethers.formatEther(amount)} tokens for spender: ${spender}`);

        const tx = await tokenContract.approve(spender, amount);
        await tx.wait();

        console.log(`Approval transaction hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error('Error during token approval:', error.message);
        throw new Error('Failed to approve token.');
    }
};

/**
 * Prepare inital staking transaction data for frontend
 */
const getStakeTransactionData = async (req, res) => {
    try {
        const { userAddress, token, amount, pool } = req.body;

        if (!userAddress || !token || !amount || !pool) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        console.log(`Preparing transaction for ${userAddress}...`);

        // Construct raw transaction data
        const txData = await stakeStoreContract.populateTransaction.stakeTokens(token, amount, pool);

        res.json({
            to: CONTRACT_ADDRESS,
            data: txData.data,
            value: "0",
        });

    } catch (error) {
        console.error("Error constructing stake transaction:", error.message);
        res.status(500).json({ error: "Failed to generate transaction data" });
    }
};

/**
 * Send a transaction to mint PT/YT tokens using the data from createMintTokensTransaction.
 */
const stakeOnPendle = async (user, token, amount, pool) => {
    try {
        console.log(`Minting PT/YT for ${user} using token ${token} at pool ${pool}`);

        const mintData = {
            yt: pool,
            slippage: 0.01,
            enableAggregator: true,
            tokenIn: token,
            amountIn: amount,
        };
        const mintTxData = await createMintTokensTransaction(mintData);

        if (!mintTxData) {
            throw new Error('Invalid transaction data received from createMintTokensTransaction.');
        }

        const { to, data } = mintTxData.tx;

        console.log('Mint Transaction Data:', { to, data });

        const tx = {
            to,
            data,
            gasLimit: DEFAULT_GAS_LIMIT,
            gasPrice: DEFAULT_GAS_PRICE,
        };

        console.log('Sending transaction...');
        const txResponse = await signer.sendTransaction(tx);

        console.log('Waiting for transaction confirmation...');
        const receipt = await txResponse.wait();

        console.log('Transaction confirmed:', receipt.transactionHash);

        //TODO: Send minted PT tokens back, calculate and store points, sell YT tokens, send USDC to Coinbase account

    } catch (error) {
        console.error('Error sending mint tokens transaction:', error.message);
        throw new Error(`Failed to send mint tokens transaction: ${error.message}`);
    }
};

/**
 * Get all PT tokens the user holds in their connected wallet, including the pool's expiration date.
 * @param {string} userAddress - The wallet address of the user.
 * @returns {Promise<Object[]>} - A list of PT tokens with balances and expiration dates.
 */
const getCurrentHoldings = async (userAddress) => {
    if (!userAddress) throw new Error("User address is required");

    const holdings = [];

    for (const market of activeMarkets) {
        const ptTokenAddress = market.pt.split("-")[1]; // Extract PT token contract address
        const ptContract = new ethers.Contract(ptTokenAddress, ERC20_ABI, provider);

        try {
            const balance = await ptContract.balanceOf(userAddress);
            if (balance > 0) {
                holdings.push({
                    name: market.name,
                    address: ptTokenAddress,
                    balance: ethers.formatUnits(balance, 18), // Convert balance from Wei
                    expiry: market.expiry // Include pool expiration date
                });
            }
        } catch (error) {
            console.error(`Error fetching balance for PT token ${market.name}:`, error.message);
        }
    }

    return holdings;
};

// TODO: Once the expiration date is reached, the user can redeem their tokens
const redeem = () => {

}

/**
 * @desc Fetches the list of active markets from active_markets.json
 */
const getActiveMarkets = (req, res) => {
    fs.readFile(activeMarketsPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading active_markets.json:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
            const markets = JSON.parse(data);
            res.json(markets);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Invalid JSON format' });
        }
    });
};

module.exports = {
    approveToken,
    getStakeTransactionData,
    stakeOnPendle,
    getCurrentHoldings,
    redeem,
    getActiveMarkets,
};
