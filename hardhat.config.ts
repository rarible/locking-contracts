import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";
import "@nomicfoundation/hardhat-foundry";
import type { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import type { HttpNetworkUserConfig } from "hardhat/types";
import * as tdly from "@tenderly/hardhat-tenderly";
import * as dotenv from 'dotenv';
import * as os from 'os';
import * as path from 'path';
import 'hardhat-abi-exporter';
import "./tasks/deploy";

dotenv.config();

tdly.setup({
  automaticVerifications: false,
});

function getConfigPath() {
  const configPath = process.env["NETWORK_CONFIG_PATH"];
  if (configPath) {
    return configPath;
  } else {
    return path.join(os.homedir(),  ".ethereum");
  }
}

function createNetwork(name: string): HttpNetworkUserConfig {
  var json = require(path.join(getConfigPath(), name + ".json"));

  return {
    from: json.address,
    gas: parseInt(json.gasPrice),
    chainId: parseInt(json.network_id),
    url: json.url,
    accounts: {
      count: 10,
      mnemonic: json.key,
      path: "m/44'/60'/0'/0",
    },
  };
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
    },
    dev: createNetwork("dev"),
    goerli: createNetwork("goerli"),
    mainnet: createNetwork("mainnet"),
    optimism: createNetwork("optimism_mainnet"),
    optimismGoerli: createNetwork("optimism_goerli"),
    polygonDev: createNetwork("polygon_dev"),
    polygonMainnet: createNetwork("polygon_mainnet"),
    polygonMumbai: createNetwork("polygon_mumbai"),
    polygonStaging: createNetwork("polygon_staging"),
    staging: createNetwork("staging"),
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
            runs: 200,
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
    outDir: './typechain-types',
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY || "",
      goerli: process.env.ETHERSCAN_API_KEY || "",
      polygon: process.env.POLYGONSCAN_API_KEY || "",
      polygonMumbai: process.env.POLYGONSCAN_API_KEY || "",
      optimism: process.env.OPTIMISM_API_KEY || "",
      optimismGoerli: process.env.OPTIMISM_API_KEY || "",
    },
  },
  gasReporter: {
    currency: "USD",
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
};
export default config;
