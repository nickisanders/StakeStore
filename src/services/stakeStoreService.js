const { ethers } = require('ethers');
require('dotenv').config();
const { createMintTokensTransaction } = require('./pendleService');

// Environment variables
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const INFURA_URL = `https://base-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;

if (!INFURA_PROJECT_ID || !PRIVATE_KEY) {
    throw new Error('Environment variables INFURA_PROJECT_ID and PRIVATE_KEY must be set');
}

// Initialize ethers.js provider and signer
const provider = new ethers.JsonRpcProvider(INFURA_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// Hardcoded gas settings
const DEFAULT_GAS_LIMIT = '10000000'; // Example gas limit (as a string for compatibility)
const DEFAULT_GAS_PRICE = '1000000000'; // Example gas price (10 gwei)

/**
 * Approve a spender to spend a specified amount of an ERC-20 token.
 * @param {string} tokenAddress - The ERC-20 token contract address.
 * @param {string} spender - The address of the spender (e.g., Pendle contract).
 * @param {string} amount - The amount to approve (in wei).
 * @returns {Promise<string>} The transaction hash of the approval transaction.
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

        console.log(`Approving ${ethers.formatEther(amount)} WETH for spender: ${spender}`);

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
 * Send a transaction to mint PT/YT tokens using the data from createMintTokensTransaction.
 * @param {Object} mintData - The data required to mint PT/YT tokens.
 * mintData example:
 * {
 *   yt: '0x...',          // YT token address
 *   slippage: 0.01,       // Slippage tolerance
 *   enableAggregator: true,
 *   tokenIn: '0x...',     // Address of input token
 *   amountIn: '1000000',  // Amount of input token in WEI
 *   receiver: '0x...'     // Treasury or receiving wallet address
 * }
 * @returns {Object} Transaction receipt
 */
const sendMintTokensTransaction = async (mintData) => {
    try {
        // Generate transaction data from Pendle service
        const mintTxData = await createMintTokensTransaction(mintData);

        if (!mintTxData) {
            throw new Error('Invalid transaction data received from createMintTokensTransaction.');
        }

        const { to, data } = mintTxData.tx;

        // Log the mint transaction data for debugging
        console.log('Mint Transaction Data:', { to, data });

        // Build the transaction object
        const tx = {
            to,
            data,
            gasLimit: DEFAULT_GAS_LIMIT, // Use the hardcoded gas limit
            gasPrice: DEFAULT_GAS_PRICE, // Use the hardcoded gas price
        };

        // Send the transaction via ethers.js
        console.log('Sending transaction...');
        const txResponse = await signer.sendTransaction(tx);

        // Wait for the transaction to be mined and get the receipt
        console.log('Waiting for transaction confirmation...');
        const receipt = await txResponse.wait();

        console.log('Transaction confirmed:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('Error sending mint tokens transaction:', error.message);
        throw new Error(`Failed to send mint tokens transaction: ${error.message}`);
    }
};

module.exports = {
    approveToken,
    sendMintTokensTransaction,
};
