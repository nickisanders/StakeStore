const express = require('express');
const cors = require('cors');
const pendleService = require('../services/pendleService');

const app = express();
const PORT = 3001; // API server runs on port 3001

// Middleware
app.use(cors());
app.use(express.json());

// Dummy data
const dummyAssets = [
    { asset: 'ETH', balance: 2.5, staked: 1.0 },
    { asset: 'USDC', balance: 1000.0, staked: 500.0 },
];

const dummyPools = [
    { poolId: '1', asset: 'ETH', apy: 12.5, lockupPeriod: 90, minStake: 0.1 },
    { poolId: '2', asset: 'USDC', apy: 8.0, lockupPeriod: 180, minStake: 100.0 },
];

// Routes

// default
app.get('/', (req, res) => {
    res.send('Welcome to StakeStore API!');
});

// Get User Assets
app.get('/assets', (req, res) => {
    const { walletAddress } = req.query;
    if (walletAddress) {
        res.json({
            success: true,
            assets: dummyAssets,
        });
    } else {
        res.status(400).json({ success: false, message: 'Wallet address is required' });
    }
});

// Get Active Markets and write to file
app.get('/markets', async (req, res) => {
    pendleService.fetchActiveMarketsAndWriteToFile()
        .then(() => {
            console.log('Active markets data fetched and written to file successfully.');
        })
        .catch((error) => {
            console.error('Error:', error.message);
        });
});

/**
 * API endpoint to calculate the APY for staking with Pendle.
 */
app.post('/api/calculateRate', async (req, res) => {
    const { asset, lockupPeriod } = req.body;

    // Validate the input data
    if (!asset || typeof lockupPeriod !== 'number' || lockupPeriod <= 0) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    try {
        const apyData = await pendleService.calculateRate(asset, lockupPeriod);
        res.status(200).json(apyData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mint PT/YT tokens
app.post('/api/mintTokens', async (req, res) => {
    const { receiver, yt, slippage, tokenIn, amountIn } = req.body;

    // Validate the input data
    if (!receiver || !yt || typeof slippage !== 'number' || !tokenIn || !amountIn) {
        return res.status(400).json({ error: 'Invalid input data' });
    }

    const mintData = {
        receiver,
        yt,
        slippage,
        tokenIn,
        amountIn,
    };

    try {
        const result = await pendleService.mintTokens(mintData);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to perform a token swap
app.post('/swap', async (req, res) => {
    try {
        const swapData = req.body;
        const swapResult = await pendleService.performSwap(swapData);
        res.json({ success: true, data: swapResult });
    } catch (error) {
        console.error('Error in /swap API:', error.message);
        res.status(500).json({ success: false, error: 'Failed to perform token swap.' });
    }
});

// Endpoint to fetch redemption options for a user
app.get('/redemptions/:address', async (req, res) => {
    try {
        const userAddress = req.params.address;
        const options = await pendleService.getRedemptionOptions(userAddress);
        res.json({ success: true, data: options });
    } catch (error) {
        console.error('Error in /redemptions API:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch redemption options.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
});
