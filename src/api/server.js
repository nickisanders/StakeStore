require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { ethers } = require('ethers');
const stakeStoreService = require('../services/stakeStoreService');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable cross-origin requests
app.use(express.json()); // Parse JSON requests

// Base Route (Health Check)
app.get('/', (req, res) => {
    res.send("StakeStoreService API is running!");
});

// Fetch Active Markets
app.get('/api/markets', stakeStoreService.getActiveMarkets);

// Approve Token Transfer
app.post('/api/approveToken', async (req, res) => {
    try {
        const { token, spender, amount } = req.body;
        if (!token || !spender || !amount) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const txHash = await stakeStoreService.approveToken(token, spender, amount);
        res.json({ status: "success", txHash });

    } catch (error) {
        console.error("Error approving token:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get Staking Transaction Data (Frontend Signs)
app.post('/api/getStakeTransactionData', async (req, res) => {
    try {
        const { userAddress, token, amount, pool } = req.body;
        if (!userAddress || !token || !amount || !pool) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const txData = await stakeStoreService.getStakeTransactionData(req, res);
        res.json(txData);

    } catch (error) {
        console.error("Error fetching stake transaction data:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get Current Holdings
app.get('/api/getCurrentHoldings/:userAddress', async (req, res) => {
    try {
        const { userAddress } = req.params;
        if (!userAddress) return res.status(400).json({ error: "User address is required" });

        const holdings = await stakeStoreService.getCurrentHoldings(userAddress);
        res.json(holdings);
    } catch (error) {
        console.error("Error fetching holdings:", error.message);
        res.status(500).json({ error: "Failed to fetch holdings" });
    }
});

// Redeem PT Tokens
app.post('/api/redeemTokens', async (req, res) => {
    const { userAddress, marketAddress } = req.body;

    if (!userAddress || !marketAddress) {
        return res.status(400).json({ error: 'Missing required parameters: userAddress or marketAddress' });
    }

    try {
        const txData = await getRedeemTransactionData(userAddress, marketAddress);
        res.json(txData);
    } catch (error) {
        console.error('Error in redeemTokens endpoint:', error.message);
        res.status(500).json({ error: 'Failed to get redeem transaction data' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`StakeStoreService API is running on port ${PORT}`);
});
