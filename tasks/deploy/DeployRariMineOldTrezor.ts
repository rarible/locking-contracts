import { task } from "hardhat/config";
import { RariMineV3Old__factory } from "../../typechain";
import { getHardwareSigner } from "../../lib/utils/getHardwareSigner";

task("deploy:RariMineOldHardware", "Upgrade").setAction(async (_, hre) => {
	const signer = await getHardwareSigner(hre)
	const RariMineV3Old = await hre.ethers.getContractFactory("RariMineV3Old", signer) as RariMineV3Old__factory;
	
	await hre.upgrades.deployProxy(RariMineV3Old);
	console.log("RariMineV3Old deployed");
  });