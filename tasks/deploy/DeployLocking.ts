import { ethers, network, upgrades } from "hardhat";

type NetworkSettings = {
  token: string;
  startingPointWeek: number;
  minCliffPeriod: number;
  minSlopePeriod: number;
}
const mainnet : NetworkSettings = {
	token: "0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF",
  startingPointWeek: 309,
  minCliffPeriod: 3,
  minSlopePeriod: 1
}
const goerli : NetworkSettings = {
	token: "0xbe6dEA792E5D557d71a4cDEf7d22d6dccA133891",
  startingPointWeek: 150,
  minCliffPeriod: 0,
  minSlopePeriod: 0
}
const dev : NetworkSettings = {
	token: "0x55eB2809896aB7414706AaCDde63e3BBb26e0BC6",
  startingPointWeek: 0,
  minCliffPeriod: 0,
  minSlopePeriod: 0
}
const def : NetworkSettings = {
	token: "0x0000000000000000000000000000000000000000",
  startingPointWeek: 0,
  minCliffPeriod: 0,
  minSlopePeriod: 0
}

let settings = {
	"default": def,
	"mainnet": mainnet,
	"goerli": goerli,
	"dev": dev
};

function getSettings(network: string) : NetworkSettings {
	if (settings[network] !== undefined) {
		return settings[network];
	} else {
		return settings["default"];
	}
} 

async function main() {
  console.log(`deploying Locking on network ${network.name}`)

  const [deployer] = await ethers.getSigners();

  const {token, startingPointWeek, minCliffPeriod, minSlopePeriod} = getSettings(network.name)
  console.log("settings:", token, startingPointWeek, minCliffPeriod, minSlopePeriod)

  console.log("Deploying contracts with the account:", deployer.address);

  const Locking = await ethers.getContractFactory("Locking");
  
  const locking = await upgrades.deployProxy(Locking, [token, startingPointWeek, minCliffPeriod, minSlopePeriod], { initializer: '__Locking_init' });
  await locking.deployed();

  console.log("locking address:", locking.address);

  await upgrades.upgradeProxy(locking.address, Locking);
  console.log("Locking upgraded");

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });