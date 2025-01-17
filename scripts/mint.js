const { sendMintTokensTransaction } = require('../src/services/stakeStoreService.js');

const mintData = {
    yt: '0xe84009923221bb401c811643c5a5efaf56eed4ca',
    slippage: 0.01,
    enableAggregator: true,
    tokenIn: '0x4200000000000000000000000000000000000006',
    amountIn: '100000000000000',
};

sendMintTokensTransaction(mintData)
    .then(() => {
        console.log('Mint tokens transaction sent successfully');
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });