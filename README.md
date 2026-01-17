# CryptoInvestDAO - Decentralized Investment Platform

CryptoInvestDAO is a blockchain-based governance system that allows members to pool resources and vote on investment proposals. The platform uses a customized governance token (CID) to track influence and manage the proposal lifecycle.

## 🚀 Core Features & Requirement Mapping
* **Stake & Influence (#1, #24)**: Users deposit SepoliaETH to receive CID tokens at a 1:1000 ratio.
* **DAO Metrics (#15, #20)**: Live tracking of Treasury Balance and individual Voting Power.
* **Governance Delegation (#5)**: Members activate voting weight via self-delegation or delegating to others.
* **Proposal Creation (#2)**: Members can propose investment transfers with a recipient, amount, and description.
* **Voting Interface (#4)**: Support for 'For' and 'Against' votes on active proposals.

## 🛠 Technical Stack
* **Smart Contracts**: Solidity (UUPS Upgradeable pattern).
* **Frontend**: React.js with Tailwind CSS.
* **Library**: Ethers.js (v6).
* **Network**: Ethereum Sepolia Testnet.

## 📝 Usage Instructions
1. **Connect**: Link MetaMask to the dashboard (using account `0xC04F...bb43`).
2. **Stake**: Deposit ETH to mint CID tokens.
3. **Delegate**: Paste your address in "Delegate Power" and click "Delegate Now" to activate your weight.
4. **Propose**: After a 1-minute network propagation delay, submit a new investment proposal.

## ⚠️ Important Note on Network Latency
The Sepolia network requires approximately 60-120 seconds to finalize delegation snapshots. Proposal creation will only succeed once the network confirms the governance weight update.s