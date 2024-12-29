// pendleService.test.js
const axios = require('axios');
const pendleService = require('../src/services/pendleService');

// Mock axios
jest.mock('axios');

describe('pendleService', () => {
    afterEach(() => {
        // Clear all mocks after each test
        jest.clearAllMocks();
    });

    describe('getActiveMarkets', () => {
        it('should fetch active markets successfully', async () => {
            const mockData = { data: 'mockActiveMarketsData' };
            axios.get.mockResolvedValue(mockData);

            const result = await pendleService.getActiveMarkets();
            expect(result).toEqual('mockActiveMarketsData');
            expect(axios.get).toHaveBeenCalledWith('https://api-v2.pendle.finance/core/v1/8453/markets/active');
        });

        it('should throw an error when fetching active markets fails', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            await expect(pendleService.getActiveMarkets()).rejects.toThrow('Failed to fetch active markets.');
            expect(axios.get).toHaveBeenCalledWith('https://api-v2.pendle.finance/core/v1/8453/markets/active');
        });
    });

    describe('performSwap', () => {
        it('should perform token swap successfully', async () => {
            const mockData = { data: 'mockSwapData' };
            axios.post.mockResolvedValue(mockData);

            const swapData = { amount: 100, fromToken: 'ETH', toToken: 'DAI' };
            const result = await pendleService.performSwap('market1', swapData);
            expect(result).toEqual('mockSwapData');
            expect(axios.post).toHaveBeenCalledWith(
                'https://api-v2.pendle.finance/core/v1/8453/markets/market1/swap',
                swapData,
                { headers: { 'Content-Type': 'application/json' } }
            );
        });

        it('should throw an error when token swap fails', async () => {
            axios.post.mockRejectedValue(new Error('Network Error'));

            const swapData = { amount: 100, fromToken: 'ETH', toToken: 'DAI' };
            await expect(pendleService.performSwap('market1', swapData)).rejects.toThrow('Failed to perform token swap.');
            expect(axios.post).toHaveBeenCalledWith(
                'https://api-v2.pendle.finance/core/v1/8453/markets/market1/swap',
                swapData,
                { headers: { 'Content-Type': 'application/json' } }
            );
        });
    });

    describe('getRedemptionOptions', () => {
        it('should fetch redemption options successfully', async () => {
            const mockData = { data: 'mockRedemptionOptions' };
            axios.get.mockResolvedValue(mockData);

            const result = await pendleService.getRedemptionOptions('userAddress');
            expect(result).toEqual('mockRedemptionOptions');
            expect(axios.get).toHaveBeenCalledWith('https://api-v2.pendle.finance/core/v1/8453/positions', {
                params: { owner: 'userAddress' },
            });
        });

        it('should throw an error when fetching redemption options fails', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));

            await expect(pendleService.getRedemptionOptions('userAddress')).rejects.toThrow('Failed to fetch redemption options.');
            expect(axios.get).toHaveBeenCalledWith('https://api-v2.pendle.finance/core/v1/8453/positions', {
                params: { owner: 'userAddress' },
            });
        });
    });
});