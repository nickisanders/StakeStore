const { ethers } = require('ethers');
require('dotenv').config();
const { createMintTokensTransaction } = require('./pendleService');

// Environment variables
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

if (!RPC_URL || !PRIVATE_KEY) {
    throw new Error('Environment variables RPC_URL and PRIVATE_KEY must be set');
}

// Initialize ethers.js provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

// ABI of the StakeStore smart contract
const STAKESTORE_ABI = [
    "function stakeTokens(address token, uint256 amount, address pool) public",
];

// Create an instance of the StakeStore contract
const stakeStoreContract = new ethers.Contract(CONTRACT_ADDRESS, STAKESTORE_ABI, signer);

// Hardcoded gas settings
const DEFAULT_GAS_LIMIT = '10000000'; // Example gas limit
const DEFAULT_GAS_PRICE = '1000000000'; // Example gas price (10 gwei)

/**
 * Approve a spender to spend a specified amount of an ERC-20 token.
 */
const approveToken = async (tokenAddress, spender, amount) => {
    try {
        const tokenContract = new ethers.Contract(
            tokenAddress,
            [
                'function approve(address spender, uint256 amount) public returns (bool)',
                'function allowance(address owner, address spender) public view returns (uint256)',
            ],
            signer
        );

        console.log(`Approving ${ethers.formatEther(amount)} tokens for spender: ${spender}`);

        const tx = await tokenContract.approve(spender, amount);
        await tx.wait();

        console.log(`Approval transaction hash: ${tx.hash}`);
        return tx.hash;
    } catch (error) {
        console.error('Error during token approval:', error.message);
        throw new Error('Failed to approve token.');
    }
};

/**
 * Send a transaction to mint PT/YT tokens using the data from createMintTokensTransaction.
 * mintData = {
 *      yt,
        slippage,
        tokenIn,
        amountIn
    }
 */
const stakeOnPendle = async (user, token, amount, pool) => {
    try {
        console.log(`Minting PT/YT for ${user} using token ${token} at pool ${pool}`);

        const mintData = {
            yt: pool,
            slippage: 0.01,
            enableAggregator: true,
            tokenIn: token,
            amountIn: amount,
        };
        const mintTxData = await createMintTokensTransaction(mintData);

        if (!mintTxData) {
            throw new Error('Invalid transaction data received from createMintTokensTransaction.');
        }

        const { to, data } = mintTxData.tx;

        console.log('Mint Transaction Data:', { to, data });

        const tx = {
            to,
            data,
            gasLimit: DEFAULT_GAS_LIMIT,
            gasPrice: DEFAULT_GAS_PRICE,
        };

        console.log('Sending transaction...');
        const txResponse = await signer.sendTransaction(tx);

        console.log('Waiting for transaction confirmation...');
        const receipt = await txResponse.wait();

        console.log('Transaction confirmed:', receipt.transactionHash);

        //TODO: Send minted PT tokens back

    } catch (error) {
        console.error('Error sending mint tokens transaction:', error.message);
        throw new Error(`Failed to send mint tokens transaction: ${error.message}`);
    }
};


module.exports = {
    approveToken,
    stakeOnPendle,
};
