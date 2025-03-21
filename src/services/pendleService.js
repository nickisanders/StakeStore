const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Base URL for the Pendle hosted API
const PENDLE_API_BASE_URL = process.env.PENDLE_API_BASE_URL || 'https://api-v2.pendle.finance/core';
const CHAIN_ID = process.env.PENDLE_CHAIN_ID || 8453; // Use BASE chain by default

/**
 * Fetch available staking pools (active markets) from Pendle.
 * @param {number} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} List of available staking pools.
 */
const getActiveMarkets = async () => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/markets/active`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active markets:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch active markets.');
    }
};

/**
 * Read active markets from the file.
 * @returns {Promise<Object>} The active markets data.
 */
const readActiveMarketsFromFile = () => {
    try {
        // Read the file content
        const data = fs.readFileSync('active_markets.json', 'utf-8');
        // Parse the JSON string into a JavaScript object
        const activeMarkets = JSON.parse(data);
        return activeMarkets;
    } catch (error) {
        console.error('Error reading active markets from file:', error.message);
        throw new Error('Failed to read active markets from file.');
    }
};

/**
 * Fetch active markets from Pendle and write the results to a file.
 * @returns {Promise<void>}
 */
const fetchActiveMarketsAndWriteToFile = async () => {
    try {
        // Fetch active markets from the Pendle API
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/markets/active`);
        const activeMarkets = response.data;

        // Convert the result to a JSON string
        const dataToWrite = JSON.stringify(activeMarkets, null, 2);

        // Write the result to a file
        fs.writeFileSync('active_markets.json', dataToWrite, 'utf-8');
        console.log('Active markets data has been written to active_markets.json');
    } catch (error) {
        console.error('Error fetching active markets:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch active markets.');
    }
};

/**
 * Fetch market data from Pendle.
 * @param {number} chainId - The chain ID.
 * @param {string} address - The market address.
 * @returns {Promise<Object>} The market data.
 */
const getMarketData = async (address) => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v2/${CHAIN_ID}/markets/${address}/data`);
        return response.data;
    } catch (error) {
        console.error('Error fetching market data:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch market data.');
    }
};

/**
 * Create mint PT/YT tokens transaction.
 * @param {Object} mintData - The data required to mint PT/YT tokens.
 * mintData = {
 *      yt,
        slippage,
        tokenIn,
        amountIn
    }
 * @returns {Promise<Object>} The minting transaction to be submitted onchain.
 */
const createMintTokensTransaction = async (mintData) => {
    try {
        // Use the receiver address from the environment variable
        const receiver = process.env.TREASURY_ADDRESS;
        if (!receiver) {
            throw new Error('Receiver address is not set in the environment variables.');
        }

        // Add the receiver address to the mintData
        const mintDataWithReceiver = { ...mintData, receiver };

        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/sdk/${CHAIN_ID}/mint`, {
            params: mintDataWithReceiver,
            headers: { 'Content-Type': 'application/json' },
        });

        return response.data;
    } catch (error) {
        console.error('Error minting PT/YT tokens:', error.response ? error.response.data : error.message);
        throw new Error('Failed to mint PT/YT tokens.');
    }
};

/**
 * Perform a token swap on Pendle.
 * @param {string} market - The market ID for the swap.
 * @param {Object} swapData - The data required for the swap.
 * @returns {Promise<Object>} The result of the swap.
 */
const performSwap = async (poolId, token, requiredAmount, treasuryWallet) => {
    const swapData = {
        poolId,
        token,
        amount: requiredAmount,
        recipient,
    };

    try {
        const response = await axios.post(
            `${PENDLE_API_BASE_URL}/${CHAIN_ID}/markets/${poolId}/swap`,
            swapData
        );
        return response.data; // Swap result
    } catch (error) {
        console.error('Error performing swap:', error.message);
        throw new Error('Failed to perform stake swap.');
    }
};

/**
 * Construct a redeem transaction for a user’s matured PT tokens.
 * @param {string} userAddress - The user’s wallet address.
 * @param {string} marketAddress - The Pendle market address.
 * @returns {Promise<object>} Transaction data to be signed by the user.
 */
const getRedeemTransaction = async (userAddress, marketAddress) => {
    try {
        const response = await axios.post(`${PENDLE_API_BASE_URL}/sdk/redeem`, {
            chainId: CHAIN_ID,
            userAddress,
            marketAddress,
            tokenType: 'PT'
        });

        const tx = response.data?.tx;
        if (!tx) throw new Error('No transaction data returned from Pendle redeem endpoint.');

        console.log('Redeem transaction:', tx);
        return tx;
    } catch (err) {
        console.error('Failed to get redeem transaction:', err.message);
        throw new Error('Could not construct redeem transaction');
    }
};


module.exports = {
    getActiveMarkets,
    fetchActiveMarketsAndWriteToFile,
    readActiveMarketsFromFile,
    getMarketData,
    createMintTokensTransaction,
    performSwap,
    getRedeemTransaction,
};