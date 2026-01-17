import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DeployDAO = buildModule("CryptoInvestDAO", (m) => {
  // 1. Deploy the Governance Token
  const govToken = m.contract("GovToken");

  // 2. Deploy the Timelock (Treasury)
  // minDelay: 3600 (1 hour for testing), proposers: [], executors: [], admin: current account
  const timelock = m.contract("TreasuryTimelock", [
    3600n,
    [],
    [],
    m.getAccount(0),
  ]);

  // 3. Deploy the Governor (DAO Brain)
  const governor = m.contract("DAOManager", [govToken, timelock]);

  // 4. Deploy the Main Entry Point
  const investDAO = m.contract("InvestDAO", [govToken, timelock]);

  // 5. Setup Permissions (The "Handshake")
  // Grant the Governor the PROPOSER_ROLE on the Timelock
  const PROPOSER_ROLE = m.staticCall(timelock, "PROPOSER_ROLE");
  m.call(timelock, "grantRole", [PROPOSER_ROLE, governor]);

  // Make InvestDAO the owner of the Token so it can mint
  m.call(govToken, "transferOwnership", [investDAO]);

  return { govToken, timelock, governor, investDAO };
});

export default DeployDAO;