import { task } from "hardhat/config";
import { RariMineV3Old__factory } from "../../typechain";
import { TrezorSigner } from "@nxqbao/eth-signer-trezor";

type NetworkSettings = {
  rariMine: string;
}
const mainnet : NetworkSettings = {
	rariMine: "0xc633F65A1BEBD433DF12D9F3ac7aCF31b26Ca1E6",
}
const goerli : NetworkSettings = {
	rariMine: "0x6d037fa529EABfe517666c498C4E47D0bBE01b91",
}
const def : NetworkSettings = {
	rariMine: "0x0000000000000000000000000000000000000000",
}

let settings: any = {
	"default": def,
	"mainnet": mainnet,
	"goerli": goerli
};

function getSettings(network: string) : NetworkSettings {
	if (settings[network] !== undefined) {
		return settings[network];
	} else {
		return settings["default"];
	}
} 
task("update:RariMineOld", "Upgrade").setAction(async (_, hre) => {
  const { getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();

  const { rariMine } = getSettings(hre.network.name)
  console.log(`updating rariMine at: ${rariMine}, on network: ${hre.network.name}, using deployer address: ${deployer}`)

  
  const trezorSigner = new TrezorSigner(hre.ethers.provider, deployer)
  const RariMineV3Old = await hre.ethers.getContractFactory("RariMineV3Old", trezorSigner) as RariMineV3Old__factory;
  
  await hre.upgrades.upgradeProxy(rariMine, RariMineV3Old);
  console.log("RariMineV3Old upgraded");
});