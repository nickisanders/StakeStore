const { ethers } = require('ethers');
const { approveToken } = require('../src/services/stakeStoreService');

(async () => {
    try {
        const tokenAddress = '0x4200000000000000000000000000000000000006'; // WETH address on Base
        const spender = '0x888888888889758F76e7103c6CbF23ABbF58F946'; // Pendle contract address
        const amount = ethers.parseEther('0.1'); // Approve 0.1 WETH (adjust amount as needed)

        const txHash = await approveToken(tokenAddress, spender, amount);

        if (txHash) {
            console.log(`Token approval successful. Transaction hash: ${txHash}`);
        } else {
            console.log('Approval was not needed.');
        }
    } catch (error) {
        console.error('Error during token approval:', error.message);
    }
})();
