const { createMintTokensTransaction } = require('../src/services/pendleService.js');

const mintData = {
    yt: '0xe84009923221bb401c811643c5a5efaf56eed4ca',
    slippage: 0.01,
    enableAggregator: true,
    tokenIn: '0x4200000000000000000000000000000000000006',
    amountIn: '1000000000000000',
};

createMintTokensTransaction(mintData)
    .then((transactionData) => {
        console.log('Mint transaction created successfully:');
        console.log(JSON.stringify(transactionData, null, 2)); // Pretty print the transaction data
    })
    .catch((error) => {
        console.error('Error:', error.message);
    });
