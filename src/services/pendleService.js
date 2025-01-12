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
 * Calculate the rate that could be earned by staking with Pendle.
 * @param {string} asset - The asset address.
 * @param {number} lockupPeriod - The lockup period in days.
 * @returns {Promise<Object>} The APY data.
 */
const calculateRate = async (asset, lockupPeriod) => {
    try {
        const marketData = await getMarketData(asset);

        // Process the market data to calculate the APY
        const apy = marketData.underlyingApy;
        const rate = Math.pow(1 + apy / 365, lockupPeriod) - 1;

        return {
            asset,
            lockupPeriod,
            apy,
            rate,
        };
    } catch (error) {
        console.error('Error calculating APY:', error.message);
        throw new Error('Failed to calculate APY.');
    }
};

/**
 * Mint PT/YT tokens.
 * @param {Object} mintData - The data required to mint PT/YT tokens.
 * mintData = {
 *      receiver,
        yt,
        slippage,
        tokenIn,
        amountIn
    }
 * @returns {Promise<Object>} The result of the minting process.
 */
const mintTokens = async (mintData) => {
    try {
        const response = await axios.post(`${PENDLE_API_BASE_URL}/v1/sdk/${CHAIN_ID}/mint`, mintData, {
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
        recipient: treasuryWallet, // StakeStore wallet receives PT tokens
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
 * Fetch token redemption options.
 * @param {string} userAddress - The user's wallet address.
 * @param {number} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} Redemption options for the user.
 */
const getRedemptionOptions = async (userAddress) => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/positions`, {
            params: { owner: userAddress },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching redemption options:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch redemption options.');
    }
};

module.exports = {
    getActiveMarkets,
    fetchActiveMarketsAndWriteToFile,
    getMarketData,
    mintTokens,
    performSwap,
    getRedemptionOptions,
};