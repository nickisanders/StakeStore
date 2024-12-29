// eCommerceService.js
import axios from 'axios';

const COINBASE_COMMERCE_API_URL = process.env.COINBASE_COMMERCE_API_URL;
const API_KEY = process.env.COINBASE_COMMERCE_API_KEY;

const eCommerceService = {
    createCharge: async (chargeData) => {
        try {
            const response = await axios.post(`${COINBASE_COMMERCE_API_URL}/charges`, chargeData, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CC-Api-Key': API_KEY,
                    'X-CC-Version': '2018-03-22',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error creating charge:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    getCharge: async (chargeId) => {
        try {
            const response = await axios.get(`${COINBASE_COMMERCE_API_URL}/charges/${chargeId}`, {
                headers: {
                    'X-CC-Api-Key': API_KEY,
                    'X-CC-Version': '2018-03-22',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching charge:', error.response ? error.response.data : error.message);
            throw error;
        }
    },

    listCharges: async () => {
        try {
            const response = await axios.get(`${COINBASE_COMMERCE_API_URL}/charges`, {
                headers: {
                    'X-CC-Api-Key': API_KEY,
                    'X-CC-Version': '2018-03-22',
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error listing charges:', error.response ? error.response.data : error.message);
            throw error;
        }
    },
};

export default eCommerceService;