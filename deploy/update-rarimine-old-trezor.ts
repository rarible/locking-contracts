

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from "hardhat";

type NetworkSettings = {
    rariMine: string;
    admin: string;
}

const mainnet : NetworkSettings = {
    rariMine: "0xc633F65A1BEBD433DF12D9F3ac7aCF31b26Ca1E6",
    admin: "0x80033c932904E077e55a6E43E5E9a796f34d2525"
}
const goerli : NetworkSettings = {
    rariMine: "0x6d037fa529EABfe517666c498C4E47D0bBE01b91",
    admin: "0x81C89D33681b8e4e7e35a8E1F2aBBc3B0438618A"
}
const def : NetworkSettings = {
    rariMine: "0x0000000000000000000000000000000000000000",
    admin: "0x0000000000000000000000000000000000000000",
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

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments;
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const nonce = await hre.ethers.provider.getTransactionCount(deployer)
    console.log('deployer', deployer, nonce)

    const { rariMine, admin } = getSettings(hre.network.name)
    console.log(`updating rariMine at: ${rariMine}, on network: ${hre.network.name}`)

    await deploy('RariMineV3Old', {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            viaAdminContract: admin
        }
    });
    
    console.log("RariMineV3Old upgraded");
};
export default func;

func.tags = ["all", "RariMineV3Old"];