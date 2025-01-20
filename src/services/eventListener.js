const { ethers } = require("ethers");
require("dotenv").config();

// Load environment variables
const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const INFURA_URL = `https://base-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS; // Replace with your deployed contract address
const ABI = [
    // Add the contract's ABI here
    "event StakeInitiated(address indexed user, address indexed token, uint256 amount, address indexed pool)",
    "event PTYTReceived(address indexed pool, uint256 ptAmount, uint256 ytAmount)"
];

async function listenToEvents() {
    try {
        // Connect to the network
        const provider = new ethers.JsonRpcProvider(INFURA_URL);

        // Connect to the contract
        const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

        console.log("Listening for events...");

        // Listen for StakeInitiated events
        contract.on("StakeInitiated", (user, token, amount, pool, event) => {
            console.log("StakeInitiated Event Detected:");
            console.log(`User: ${user}`);
            console.log(`Token: ${token}`);
            console.log(`Amount: ${ethers.utils.formatUnits(amount, 18)} (in tokens)`);
            console.log(`Pool: ${pool}`);
            console.log(`Transaction Hash: ${event.transactionHash}`);
            console.log("-------------------------");

            // TODO: Add logic to process or save this event in the database
        });

        // Listen for PTYTReceived events
        contract.on("PTYTReceived", (pool, ptAmount, ytAmount, event) => {
            console.log("PTYTReceived Event Detected:");
            console.log(`Pool: ${pool}`);
            console.log(`PT Amount: ${ethers.utils.formatUnits(ptAmount, 18)} (in tokens)`);
            console.log(`YT Amount: ${ethers.utils.formatUnits(ytAmount, 18)} (in tokens)`);
            console.log(`Transaction Hash: ${event.transactionHash}`);
            console.log("-------------------------");

            // TODO: Add logic to process or save this event in the database
        });
    } catch (error) {
        console.error("Error setting up event listener:", error.message);
    }
}

// Start the listener
listenToEvents();
