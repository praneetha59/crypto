// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./GovToken.sol";
import "./TreasuryTimelock.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract InvestDAO is Ownable {
    GovToken public govToken;
    TreasuryTimelock public treasury;

    event Deposited(address indexed member, uint256 amount, uint256 tokensMinted);

    constructor(address _govToken, address payable _treasury) Ownable(msg.sender) {
        govToken = GovToken(_govToken);
        treasury = TreasuryTimelock(_treasury);
    }

    /**
     * @notice Deposit ETH to join the DAO and receive governance tokens (1 ETH = 1000 CID)
     * This satisfies the requirement for proportional influence.
     */
    function deposit() external payable {
        require(msg.value > 0, "Must deposit ETH");
        
        uint256 tokensToMint = msg.value * 1000;
        
        // 1. Send ETH to the Treasury
        (bool success, ) = address(treasury).call{value: msg.value}("");
        require(success, "Transfer to treasury failed");

        // 2. Mint tokens to the user
        // Note: InvestDAO must be the 'owner' of GovToken for this to work
        govToken.mint(msg.sender, tokensToMint);

        emit Deposited(msg.sender, msg.value, tokensToMint);
    }

    // This contract will eventually hold the logic for different "Tiers" of investments
}