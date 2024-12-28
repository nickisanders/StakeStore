const express = require('express');
const cors = require('cors');

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
app.get('/', (req, res) => {
    res.send('Welcome to StakeStore API!');
});

// Wallet Connection (Dummy Implementation)
app.post('/auth/connect-wallet', (req, res) => {
    const { walletAddress } = req.body;
    if (walletAddress) {
        res.json({
            success: true,
            message: 'Wallet connected',
            walletAddress,
        });
    } else {
        res.status(400).json({ success: false, message: 'Wallet address is required' });
    }
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

// Get Active Markets
app.get('/markets', (req, res) => {
    res.json({
        success: true,
        pools: dummyPools,
    });
});

// Endpoint to perform a token swap
router.post('/swap', async (req, res) => {
    try {
        const swapData = req.body; // Assumes the frontend sends required data in the body
        const swapResult = await pendleService.performSwap(swapData);
        res.json({ success: true, data: swapResult });
    } catch (error) {
        console.error('Error in /swap API:', error.message);
        res.status(500).json({ success: false, error: 'Failed to perform token swap.' });
    }
});

// Endpoint to fetch redemption options for a user
router.get('/redemptions/:address', async (req, res) => {
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
