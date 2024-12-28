const axios = require('axios');

// Base URL for the Pendle hosted API
const PENDLE_API_BASE_URL = 'https://api-v2.pendle.finance/core';
const CHAIN_ID = 8453; // Use BASE chain by default

/**
 * Fetch available staking pools (active markets) from Pendle.
 * @param {string} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} List of available staking pools.
 */
const getActiveMarkets = async () => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/markets/active`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active markets:', error.message);
        throw new Error('Failed to fetch active markets.');
    }
};

/**
 * Perform a token swap on Pendle.
 * @param {string} market - The market ID for the swap.
 * @param {Object} swapData - The data required for the swap.
 * @param {string} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} The result of the swap.
 */
const performSwap = async (market, swapData) => {
    try {
        const response = await axios.post(`${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/markets/${market}/swap`, swapData);
        return response.data;
    } catch (error) {
        console.error('Error performing swap:', error.message);
        throw new Error('Failed to perform token swap.');
    }
};

/**
 * Fetch token redemption options.
 * @param {string} userAddress - The user's wallet address.
 * @param {string} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} Redemption options for the user.
 */
const getRedemptionOptions = async (userAddress) => {
    try {
        const response = await axios.get(
            `${PENDLE_API_BASE_URL}/v1/${CHAIN_ID}/positions?owner=${userAddress}`
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching redemption options:', error.message);
        throw new Error('Failed to fetch redemption options.');
    }
};

module.exports = {
    getActiveMarkets,
    performSwap,
    getRedemptionOptions,
};
