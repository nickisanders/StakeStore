require('dotenv').config();
const { ethers } = require('ethers');
const { stakeOnPendle } = require('./stakeStoreService');

// Load environment variables
const RPC_WS_URL = process.env.RPC_WS_URL; // WebSocket URL for Base
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

// Ensure all required variables are set
if (!RPC_WS_URL || !CONTRACT_ADDRESS) {
    throw new Error("Missing environment variables.");
}

// Connect to WebSocket
const provider = new ethers.WebSocketProvider(RPC_WS_URL);

// ABI for listening to StakeInitiated event
const STAKESTORE_ABI = [
    "event StakeInitiated(address indexed user, address indexed token, uint256 amount, address indexed pool)"
];

// Connect to the contract
const stakeStoreContract = new ethers.Contract(CONTRACT_ADDRESS, STAKESTORE_ABI, provider);

// Listen for StakeInitiated event
stakeStoreContract.on("StakeInitiated", async (user, token, amount, pool) => {
    console.log(`🔹 New stake detected!`);
    console.log(`   📌 User: ${user}`);
    console.log(`   📌 Token: ${token}`);
    console.log(`   📌 Amount: ${ethers.formatEther(amount)} ETH`);
    console.log(`   📌 Pool: ${pool}`);

    // Handle the event, mint PT/YT tokens
    stakeOnPendle(token, amount, pool);
});

// Handle errors
provider._websocket.on("error", (err) => {
    console.error("🔴 WebSocket error:", err);
});

provider._websocket.on("close", (code) => {
    console.log(`🔴 WebSocket connection closed with code: ${code}`);
});
