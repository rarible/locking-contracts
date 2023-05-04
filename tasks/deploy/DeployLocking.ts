import { task } from "hardhat/config";
import { Locking__factory, Locking } from "../../typechain";

type NetworkSettings = {
  token: string;
  startingPointWeek: number;
  minCliffPeriod: number;
  minSlopePeriod: number;
}
const mainnet : NetworkSettings = {
	token: "0xFca59Cd816aB1eaD66534D82bc21E7515cE441CF",
  startingPointWeek: 336,
  minCliffPeriod: 3,
  minSlopePeriod: 1
}
const goerli : NetworkSettings = {
	token: "0xbe6dEA792E5D557d71a4cDEf7d22d6dccA133891",
  startingPointWeek: 173,
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

let settings: any = {
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
task("deploy:Locking", "Upgrade").setAction(async (_, hre) => {

  console.log(`deploying Locking on network ${hre.network.name}`)

  const [deployer] = await hre.ethers.getSigners();

  const {token, startingPointWeek, minCliffPeriod, minSlopePeriod} = getSettings(hre.network.name)
  console.log("settings:", token, startingPointWeek, minCliffPeriod, minSlopePeriod)

  console.log("Deploying contracts with the account:", deployer.address);

  const Locking = await hre.ethers.getContractFactory("Locking") as Locking__factory;
  
  const locking = await hre.upgrades.deployProxy(Locking, [token, startingPointWeek, minCliffPeriod, minSlopePeriod], { initializer: '__Locking_init' });
  await locking.deployed();

  console.log("locking address:", locking.address);

});