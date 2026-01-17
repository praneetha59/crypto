import { expect } from "chai";
import { network } from "hardhat";

describe("CryptoInvestDAO Multi-Tier Governance", function () {
  
  /**
   * @dev In Hardhat 3, the fixture function receives the connection object.
   * We destructure ethers directly from it.
   */
  async function deployDAOFixture({ ethers }: any) {
    const [owner, member, recipient] = await ethers.getSigners();

    const GovToken = await ethers.getContractFactory("GovToken");
    const govToken = await GovToken.deploy();

    const Timelock = await ethers.getContractFactory("TreasuryTimelock");
    const timelock = await Timelock.deploy(3600, [], [], owner.address);

    const Governor = await ethers.getContractFactory("DAOManager");
    const governor = await Governor.deploy(await govToken.getAddress(), await timelock.getAddress());

    const InvestDAO = await ethers.getContractFactory("InvestDAO");
    const investDAO = await InvestDAO.deploy(await govToken.getAddress(), await timelock.getAddress());

    // Permissions setup
    const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
    await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
    await govToken.transferOwnership(await investDAO.getAddress());

    return { govToken, timelock, governor, investDAO, owner, member, recipient, ethers };
  }

  it("Should correctly track proposal values for Multi-Tier logic", async function () {
    // 1. Establish a connection to the network to get the Manager
    const connection = await network.connect();
    const { networkHelpers } = connection;
    
    // 2. Access loadFixture from the networkHelpers object
    // Note: We pass our named fixture function here.
    const { govToken, governor, investDAO, member, recipient, ethers } = 
      await networkHelpers.loadFixture(deployDAOFixture);

    // 3. Join DAO - Proportional Influence logic
    await investDAO.connect(member).deposit({ value: ethers.parseEther("15") });
    await govToken.connect(member).delegate(member.address);

    // 4. Create a High-Tier proposal (11 ETH)
    const targets = [recipient.address];
    const values = [ethers.parseEther("11")];
    const calldatas = ["0x"];
    const description = "High-tier investment";

    const tx = await governor.connect(member).propose(targets, values, calldatas, description);
    const receipt = await tx.wait();
    
    // Hardhat 3 log parsing
    const event = governor.interface.parseLog(receipt.logs[0]);
    const proposalId = event.args.proposalId;

    expect(proposalId).to.not.be.undefined;
    expect(await governor.state(proposalId)).to.equal(0); // 0 = Pending
  });
});