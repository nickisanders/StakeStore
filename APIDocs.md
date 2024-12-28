# StakeStore API Documentation

This API powers the backend of the StakeStore application, enabling asset retrieval, staking market interaction, and token swapping. Below are the available API endpoints.

---

## **Base URL**
- Localhost: `http://localhost:3001`

---

## **Endpoints**

### **1. Default Route**
- **URL**: `/`
- **Method**: `GET`
- **Description**: Basic health check for the API.
- **Response**:
  ```json
  {
    "message": "Welcome to StakeStore API!"
  }

### **2. Get User Assets**
- **URL**: `/assets`
- **Method**: `GET`
- **Description**: Fetches the user's assets and staking details.
- **Query Parameters**: `walletAddress` (string, required): The user's wallet address.
- **Response**:
  ```json
  {
    "assets": [
        { "asset": "ETH", "balance": 2.5, "staked": 1.0 },
        { "asset": "USDC", "balance": 1000.0, "staked": 500.0 }
    ]
  }

### **3. Get Active Markets**
- **URL**: `/markets`
- **Method**: `GET`
- **Description**: Fetches active staking markets from Pendle.
- **Response**:
  ```json
    {
        "data": [
            {
            "marketId": "1",
            "asset": "ETH",
            "apy": 12.5,
            "lockupPeriod": 90,
            "minStake": 0.1
            },
            {
            "marketId": "2",
            "asset": "USDC",
            "apy": 8.0,
            "lockupPeriod": 180,
            "minStake": 100.0
            }
        ]
    }

### **4. Perform Token Swap**
- **URL**: `/swap`
- **Method**: `POST`
- **Description**: Executes a token swap using the Pendle API.
- **Request Body**:
  ```json
    {
        "assetIn": "ETH",
        "amountIn": "1.0",
        "assetOut": "PT",
        "market": "1"
    }
- **Response**:
  ```json
    {
        "data": {
            "swapId": "abc123",
            "assetOut": "PT",
            "amountOut": "1.1"
        }
    }

### **4. Get Redemption Options**
- **URL**: `/redemptions/:address`
- **Method**: `GET`
- **Description**: Retrieves redemption options for a user's PT tokens.
- **URL Parameters**: `address` (string, required): The wallet address of the user.
- **Response**:
  ```json
    {
        "data": [
            {
            "asset": "ETH",
            "amount": 1.0,
            "redeemableAt": "2024-12-31T23:59:59Z"
            }
        ]
    }