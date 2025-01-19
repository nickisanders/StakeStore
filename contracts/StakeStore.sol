// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakeStore is Ownable {
    event StakeInitiated(
        address indexed user,
        address indexed token,
        uint256 amount,
        address indexed pool
    );
    event PTYTReceived(
        address indexed pool,
        uint256 ptAmount,
        uint256 ytAmount
    );

    // Mapping to track stakes (if necessary)
    mapping(address => mapping(address => uint256)) public stakes;

    /**
     * @dev Function for users to stake tokens.
     * Emits a StakeInitiated event.
     */
    function stakeTokens(address token, uint256 amount, address pool) external {
        require(amount > 0, "Amount must be greater than zero");

        // Transfer tokens from the user to this contract
        IERC20(token).transferFrom(msg.sender, address(this), amount);

        // Update stakes mapping (if needed)
        stakes[msg.sender][token] += amount;

        // Emit StakeInitiated event
        emit StakeInitiated(msg.sender, token, amount, pool);
    }

    /**
     * @dev Function for handling the receipt of PT and YT tokens after minting.
     * Emits a PTYTReceived event.
     */
    function receivePTYT(
        address pool,
        uint256 ptAmount,
        uint256 ytAmount
    ) external {
        require(ptAmount > 0, "PT amount must be greater than zero");
        require(ytAmount > 0, "YT amount must be greater than zero");

        // Emit PTYTReceived event
        emit PTYTReceived(pool, ptAmount, ytAmount);
    }

    /**
     * @dev Function for the owner to transfer out tokens from the contract.
     * Only callable by the owner.
     */
    function transferOutTokens(
        address token,
        address to,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(to != address(0), "Invalid recipient address");
        require(
            IERC20(token).balanceOf(address(this)) >= amount,
            "Insufficient contract balance"
        );

        // Transfer tokens from the contract to the specified address
        IERC20(token).transfer(to, amount);
    }

    /**
     * @dev Function for the owner to withdraw Ether from the contract (if needed).
     * Only callable by the owner.
     */
    function withdrawEther(
        address payable to,
        uint256 amount
    ) external onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        require(to != address(0), "Invalid recipient address");
        require(
            address(this).balance >= amount,
            "Insufficient contract balance"
        );

        // Transfer Ether
        to.transfer(amount);
    }

    // Fallback function to receive Ether
    receive() external payable {}
}
