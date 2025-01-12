const axios = require('axios');
const fs = require('fs');
const {
    getActiveMarkets,
    fetchActiveMarketsAndWriteToFile,
    getMarketData,
    mintTokens,
    performSwap,
    getRedemptionOptions,
} = require('../src/services/pendleService.js');

jest.mock('axios');
jest.mock('fs');

describe('Pendle Service', () => {
    const chainId = 8453; // BASE chain
    const baseUrl = 'https://api-v2.pendle.finance/core';
    const treasuryWallet = '0x123456789abcdef';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getActiveMarkets', () => {
        it('should fetch active markets successfully', async () => {
            const mockResponse = { data: [{ marketId: '1', apy: 10 }] };
            axios.get.mockResolvedValue(mockResponse);

            const result = await getActiveMarkets();
            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/v1/${chainId}/markets/active`);
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if fetching active markets fails', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));

            await expect(getActiveMarkets()).rejects.toThrow('Failed to fetch active markets.');
        });
    });

    describe('fetchActiveMarketsAndWriteToFile', () => {
        it('should fetch active markets and write to a file', async () => {
            const mockResponse = { data: [{ marketId: '1', apy: 10 }] };
            axios.get.mockResolvedValue(mockResponse);
            fs.writeFileSync.mockImplementation(() => { });

            await fetchActiveMarketsAndWriteToFile();

            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/v1/${chainId}/markets/active`);
            expect(fs.writeFileSync).toHaveBeenCalledWith(
                'active_markets.json',
                JSON.stringify(mockResponse.data, null, 2),
                'utf-8'
            );
        });

        it('should throw an error if writing to a file fails', async () => {
            axios.get.mockResolvedValue({ data: [] });
            fs.writeFileSync.mockImplementation(() => {
                throw new Error('File write error');
            });

            await expect(fetchActiveMarketsAndWriteToFile()).rejects.toThrow('Failed to fetch active markets.');
        });
    });

    describe('getMarketData', () => {
        it('should fetch market data successfully', async () => {
            const address = '0xabcdef';
            const mockResponse = { data: { apy: 12.5 } };
            axios.get.mockResolvedValue(mockResponse);

            const result = await getMarketData(address);
            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/v2/${chainId}/markets/${address}/data`);
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if fetching market data fails', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));
            const address = '0xabcdef';

            await expect(getMarketData(address)).rejects.toThrow('Failed to fetch market data.');
        });
    });

    describe('mintTokens', () => {
        it('should mint PT/YT tokens successfully', async () => {
            const mintData = { receiver: '0x123', yt: '0x456', amountIn: 100 };
            const mockResponse = { data: { status: 'success' } };
            axios.post.mockResolvedValue(mockResponse);

            const result = await mintTokens(mintData);
            expect(axios.post).toHaveBeenCalledWith(
                `${baseUrl}/v1/sdk/${chainId}/mint`,
                mintData,
                expect.any(Object)
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if minting fails', async () => {
            axios.post.mockRejectedValue(new Error('API Error'));
            const mintData = { receiver: '0x123', yt: '0x456', amountIn: 100 };

            await expect(mintTokens(mintData)).rejects.toThrow('Failed to mint PT/YT tokens.');
        });
    });

    describe('performSwap', () => {
        it('should perform a token swap successfully', async () => {
            const poolId = '1';
            const token = '0xToken';
            const requiredAmount = 100;
            const mockResponse = { data: { success: true } };
            axios.post.mockResolvedValue(mockResponse);

            const result = await performSwap(poolId, token, requiredAmount, treasuryWallet);
            expect(axios.post).toHaveBeenCalledWith(
                `${baseUrl}/${chainId}/markets/${poolId}/swap`,
                { poolId, token, amount: requiredAmount, recipient: treasuryWallet }
            );
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if swap fails', async () => {
            axios.post.mockRejectedValue(new Error('API Error'));
            const poolId = '1';
            const token = '0xToken';
            const requiredAmount = 100;

            await expect(performSwap(poolId, token, requiredAmount, treasuryWallet)).rejects.toThrow(
                'Failed to perform stake swap.'
            );
        });
    });

    describe('getRedemptionOptions', () => {
        it('should fetch redemption options successfully', async () => {
            const userAddress = '0xabcdef';
            const mockResponse = { data: { positions: [] } };
            axios.get.mockResolvedValue(mockResponse);

            const result = await getRedemptionOptions(userAddress);
            expect(axios.get).toHaveBeenCalledWith(`${baseUrl}/v1/${chainId}/positions`, {
                params: { owner: userAddress },
            });
            expect(result).toEqual(mockResponse.data);
        });

        it('should throw an error if fetching redemption options fails', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));
            const userAddress = '0xabcdef';

            await expect(getRedemptionOptions(userAddress)).rejects.toThrow('Failed to fetch redemption options.');
        });
    });
});
