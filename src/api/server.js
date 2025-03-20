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
    res.send("✅ StakeStoreService API is running!");
});

// 📌 Fetch Active Markets
app.get('/api/markets', stakeStoreService.getActiveMarkets);

// 📌 Approve Token Transfer
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

// 📌 Get Staking Transaction Data (Frontend Signs)
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

// 📌 Stake Tokens on Pendle (Backend Handles)
app.post('/api/stakeOnPendle', async (req, res) => {
    try {
        const { user, token, amount, pool } = req.body;
        if (!user || !token || !amount || !pool) {
            return res.status(400).json({ error: "Missing required parameters" });
        }

        const receipt = await stakeStoreService.stakeOnPendle(user, token, amount, pool);
        res.json({ status: "success", txHash: receipt.transactionHash });

    } catch (error) {
        console.error("Error staking on Pendle:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// 📌 (Future) Redeem PT Tokens
app.post('/api/redeemTokens', async (req, res) => {
    try {
        const { userAddress } = req.body;
        if (!userAddress) {
            return res.status(400).json({ error: "Missing userAddress" });
        }

        // Placeholder until redemption logic is implemented
        res.json({ status: "pending", message: "Redemption logic to be implemented." });

    } catch (error) {
        console.error("Error redeeming tokens:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`StakeStoreService API is running on port ${PORT}`);
});
