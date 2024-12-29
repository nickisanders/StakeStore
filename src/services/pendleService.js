const axios = require('axios');
require('dotenv').config();

// Base URL for the Pendle hosted API
const PENDLE_API_BASE_URL = process.env.PENDLE_API_BASE_URL || 'https://api-v2.pendle.finance/core';
const DEFAULT_CHAIN_ID = process.env.PENDLE_CHAIN_ID || 8453; // Use BASE chain by default

/**
 * Fetch available staking pools (active markets) from Pendle.
 * @param {number} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} List of available staking pools.
 */
const getActiveMarkets = async (chainId = DEFAULT_CHAIN_ID) => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${chainId}/markets/active`);
        return response.data;
    } catch (error) {
        console.error('Error fetching active markets:', error.response ? error.response.data : error.message);
        throw new Error('Failed to fetch active markets.');
    }
};

/**
 * Perform a token swap on Pendle.
 * @param {string} market - The market ID for the swap.
 * @param {Object} swapData - The data required for the swap.
 * @param {number} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} The result of the swap.
 */
const performSwap = async (market, swapData, chainId = DEFAULT_CHAIN_ID) => {
    try {
        const response = await axios.post(`${PENDLE_API_BASE_URL}/v1/${chainId}/markets/${market}/swap`, swapData, {
            headers: { 'Content-Type': 'application/json' },
        });
        return response.data;
    } catch (error) {
        console.error('Error performing swap:', error.response ? error.response.data : error.message);
        throw new Error('Failed to perform token swap.');
    }
};

/**
 * Fetch token redemption options.
 * @param {string} userAddress - The user's wallet address.
 * @param {number} chainId - The chain ID (default: BASE).
 * @returns {Promise<Object>} Redemption options for the user.
 */
const getRedemptionOptions = async (userAddress, chainId = DEFAULT_CHAIN_ID) => {
    try {
        const response = await axios.get(`${PENDLE_API_BASE_URL}/v1/${chainId}/positions`, {
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
    performSwap,
    getRedemptionOptions,
};