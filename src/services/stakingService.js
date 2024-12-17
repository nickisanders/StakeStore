// src/services/stakingService.js
const { ethers } = require("ethers");
const contractHelper = require("../utils/contractHelper");

async function stakeAssets(userAddress, asset, amount, duration) {
  const contract = contractHelper.getContract("StakeStore");
  const tx = await contract.stake(userAddress, asset, amount, duration);
  return tx.wait();
}

module.exports = {
  stakeAssets,
};
