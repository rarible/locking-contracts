import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-toolbox"; 
import type { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import type { HttpNetworkUserConfig } from "hardhat/types";
import "@tenderly/hardhat-tenderly";
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as path from 'path';
import 'hardhat-abi-exporter';
import "./tasks/deploy";
import "hardhat-gas-reporter";
import '@openzeppelin/hardhat-upgrades';
import * as tdly from "@tenderly/hardhat-tenderly";
import "hardhat-gas-reporter";
import fs from 'fs';
import 'hardhat-deploy';

tdly.setup();

dotenv.config();

function getConfigPath() {
  const configPath = process.env["NETWORK_CONFIG_PATH"];
  if (configPath) {
    return configPath;
  } else {
    return path.join(os.homedir(),  ".ethereum");
  }
}

function createNetwork(name: string): HttpNetworkUserConfig {
  const configPath = path.join(getConfigPath(), name + ".json");
  if (fs.existsSync(configPath)) {
    var json = require(configPath);
    return {
      from: json.address,
      gasPrice: "auto",
      chainId: parseInt(json.network_id),
      url: json.url,
      accounts: [json.key],
      gas: "auto"
    };
  } else {
    // File doesn't exist in path
    return {
      from: "0x0000000000000000000000000000000000000000",
      gas: 0,
      chainId: 0,
      url: "",
      accounts: [],
      gasPrice: 0
    };
  }
}

const config: HardhatUserConfig = {
  namedAccounts: {
    deployer: {
      default: "trezor://0x04609d9dd55accB3b1552C3721d8d964Ca95002a",
      "goerli": "ledger://m/44'/60'/1'/0/0:0x84ded7b35314c827977c4794ed66e9a80f948269:",
      "polygon": "ledger://m/44'/60'/1'/0/0:0x84ded7b35314c827977c4794ed66e9a80f948269:",
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: "https://mainnet.infura.io/v3/23aeda901f4249e096e584b8be409743",
        blockNumber: 16813952,
      }
    },
    dev: createNetwork("dev"),
    goerli: createNetwork("goerli"),
    mainnet: createNetwork("mainnet"),
    optimisticEthereum: createNetwork("optimism_mainnet"),
    optimisticGoerli: createNetwork("optimism_goerli"),
    polygonDev: createNetwork("polygon_dev"),
    polygonMainnet: createNetwork("polygon_mainnet"),
    polygonMumbai: createNetwork("polygon_mumbai"),
    polygonStaging: createNetwork("polygon_staging"),
    staging: createNetwork("staging"),
  },
  mocha: {
    timeout: 1000000000000
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  solidity: {
    compilers: [
      {
        version: "0.8.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 10_000,
          },
        },
      }
    ],
    settings: {
      metadata: {
        // Not including the metadata hash
        // https://github.com/paulrberg/hardhat-template/issues/31
        bytecodeHash: "none",
      },
      // Disable the optimizer when debugging
      // https://hardhat.org/hardhat-network/#solidity-optimizer-support
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  abiExporter: {
    path: './abi',
    clear: true,
  },
  typechain: {
    outDir: './typechain',
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      optimisticEthereum: process.env.ETHERSCAN_API_KEY || "",
      optimisticGoerli: process.env.ETHERSCAN_API_KEY || "",
    }
  },
  gasReporter: {
    currency: "ETH",
    enabled: true,
    excludeContracts: [],
    src: "./contracts",
    gasPrice: 20
  },
  tenderly: { // as before
    username: "tenderly",
    project: "locking",
    privateVerification: false
  }
};
export default config;
