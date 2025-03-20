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

### **2. Get Active Markets**
- **URL**: `/api/markets`
- **Method**: `GET`
- **Description**: Fetches active staking markets from Pendle.
- **Response**:
  ```json
    {
      "markets": [
        {
          "name": "cbETH",
          "address": "0x483f2e223c58a5ef19c4b32fbc6de57709749cb3",
          "expiry": "2025-12-25T00:00:00.000Z",
          "pt": "8453-0xe46c8ba948f8071b425a1f7ba45c0a65cbacea2e",
          "yt": "8453-0xf9da8f69d518d7f6488179014f475e843ee2defd",
          "sy": "8453-0x75372f72ec752a761e96cbcb3395f4b9586d9afd",
          "underlyingAsset": "8453-0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22"
        }
      ]
    }

### **3. Approve Token Transfer**
- **URL**: `/api/approveToken`
- **Method**: `POST`
- **Description**: Approves the StakeStore contract to transfer a given amount of a specific ERC-20 token.
- **Request Body**:
  ```json
    {
      "token": "0xTokenAddress",
      "spender": "0xSpenderAddress",
      "amount": "1000000000000000000"
    }
- **Response**:
  ```json
    {
      "status": "success",
      "txHash": "0xtransactionhash..."
    }

### **4. Get Staking Transaction Data**
- **URL**: `/api/getStakeTransactionData`
- **Method**: `POST`
- **Description**: Constructs the transaction data required for staking. The frontend will sign and submit this transaction.
- **Request Body**:
  ```json
    {
      "userAddress": "0xUserAddress",
      "token": "0xTokenAddress",
      "amount": "1000000000000000000",
      "pool": "0xPoolAddress"
    }
- **Response**:
  ```json
    {
      "to": "0xStakeStoreContractAddress",
      "data": "0xEncodedTransactionData",
      "value": "0"
    }

### **5. Redeem Tokens**
- **URL**: `/api/redeem`
- **Method**: `POST`
- **Description**: 
- **Request Body**:
