const axios = require('axios');

// Base URL for the Pendle hosted API
const PENDLE_API_BASE_URL = 'https://api-v2.pendle.finance/core';
const chainId = 8453; // BASE

/**
 * Fetch available staking pools from Pendle.
 * @returns {Promise<Object>} List of available staking pools.
 */
const getActiveMarkets = async () => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${chainId}/markets/active`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active markets:', error.message);
        throw new Error('Failed to fetch active markets.');
    }
};

/**
 * Perform a token swap on Pendle.
 * @param {Object} swapData - The data required for the swap.
 * @returns {Promise<Object>} The result of the swap.
 */
const performSwap = async (swapData) => {
    try {
        const response = await axios.post(`${PENDLE_API_BASE_URL}/v1/sdk/${chainId}/markets/{market}/swap`, swapData);
        return response.data;
    } catch (error) {
        console.error('Error performing swap:', error.message);
        throw new Error('Failed to perform token swap.');
    }
};

/**
 * Fetch token redemption options.
 * @param {string} userAddress - The user's wallet address.
 * @returns {Promise<Object>} Redemption options for the user.
 */
const getRedemptionOptions = async (userAddress) => {
    try {
        const response = await axios.get(
            `${PENDLE_API_BASE_URL}/positions?owner=${userAddress}`
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
