import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

// These variables will be read from your environment or Hardhat Keystore
const SEPOLIA_RPC_URL = configVariable("https://sepolia.infura.io/v3/38db8dc16cd0448e85e5dde3a4c480b8");
const SEPOLIA_PRIVATE_KEY = configVariable("6bb8a9d7ff894786440b4401c30eaa4bdba78099706dda02ac0bb52eda8ca711");

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200, // This compresses the bytecode
          },
        },
      },
    },
  },
  networks: {
    // FIX: Added Sepolia network definition
    sepolia: {
      type: "http", // Tells Hardhat 3 this is a remote network
      url: "https://sepolia.infura.io/v3/38db8dc16cd0448e85e5dde3a4c480b8",
      accounts: ["6bb8a9d7ff894786440b4401c30eaa4bdba78099706dda02ac0bb52eda8ca711"],
    },
    // Your existing simulated networks preserved below
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      allowUnlimitedContractSize: true, 
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
      allowUnlimitedContractSize: true,
    },
  },
});