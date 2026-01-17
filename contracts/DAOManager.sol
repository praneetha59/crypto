// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract DAOManager is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction, 
    GovernorTimelockControl 
{
    // Threshold to differentiate tiers: 10 ETH
    uint256 public constant HIGH_TIER_THRESHOLD = 10 ether;

    // Track ETH values for each proposal to apply multi-tier logic
    mapping(uint256 => uint256) private _proposalValues;

    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("CryptoInvestDAO")
        GovernorSettings(
            1,           /* 1 block - Voting Delay */
            50400,       /* ~1 week - Voting Period */
            0            /* 0 tokens - Proposal Threshold */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // Default Base Quorum (4%)
        GovernorTimelockControl(_timelock)
    {}

    /**
     * @dev Overridden propose to capture ETH values for tier logic.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override returns (uint256) {
        uint256 proposalId = super.propose(targets, values, calldatas, description);
        
        uint256 totalValue = 0;
        for (uint256 i = 0; i < values.length; i++) {
            totalValue += values[i];
        }
        _proposalValues[proposalId] = totalValue;
        
        return proposalId;
    }

    /**
     * @dev Requirement: Multi-tier approval thresholds.
     * We provide a helper to check if a proposal needs a higher (20%) quorum.
     */
    function getQuorumRequirement(uint256 proposalId, uint256 blockNumber) public view returns (uint256) {
        uint256 proposalValue = _proposalValues[proposalId];
        uint256 totalSupply = token().getPastTotalSupply(blockNumber);

        if (proposalValue >= HIGH_TIER_THRESHOLD) {
            return (totalSupply * 20) / 100; // 20% Quorum for high-tier
        } else {
            return (totalSupply * 4) / 100;  // 4% Quorum for operational-tier
        }
    }

    /**
     * @dev Requirement: Emergency intervention.
     * Allows canceling a proposal if it is deemed malicious before execution.
     */
    function emergencyVeto(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) public onlyGovernance {
        _cancel(targets, values, calldatas, descriptionHash);
    }

    // --- Overrides required by Solidity and OpenZeppelin 5.x ---

    function votingDelay() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }

    function votingPeriod() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber) public view override(Governor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }

    function state(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }

    function proposalNeedsQueuing(uint256 proposalId) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.proposalNeedsQueuing(proposalId);
    }

    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }

    function _queueOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) internal override(Governor, GovernorTimelockControl) returns (uint48) {
        return super._queueOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _executeOperations(uint256 proposalId, address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) internal override(Governor, GovernorTimelockControl) {
        super._executeOperations(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(address[] memory targets, uint256[] memory values, bytes[] memory calldatas, bytes32 descriptionHash) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
}