// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TreasuryTimelock is TimelockController {
    /**
     * @param minDelay Initial minimum delay (in seconds) before a passed proposal can be executed.
     * @param proposers List of addresses allowed to propose (this will be our Governor contract).
     * @param executors List of addresses allowed to execute passed proposals (usually anyone, or the Governor).
     * @param admin Admin address (should be the DAO itself to remain decentralized).
     */
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}

    /**
     * @dev Overriding the base receive function to allow the treasury to accept ETH 
     * from members who want to deposit funds for governance influence.
     */
    receive() external payable override {}
}
