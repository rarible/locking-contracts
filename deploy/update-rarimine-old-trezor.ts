

import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';
import { ethers } from "hardhat";

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

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deploy } = hre.deployments;
    const { getNamedAccounts } = hre;
    const { deployer } = await getNamedAccounts();
    const nonce = await hre.ethers.provider.getTransactionCount(deployer)
    console.log('deployer', deployer, nonce)

    const { rariMine } = getSettings(hre.network.name)
    console.log(`updating rariMine at: ${rariMine}, on network: ${hre.network.name}`)

    await deploy('RariMineV3Old', {
        from: deployer,
        proxy: {
            proxyContract: "OpenZeppelinTransparentProxy",
            viaAdminContract: rariMine
        }
    });
    
    console.log("RariMineV3Old upgraded");
};
export default func;

func.tags = ["all", "RariMineV3Old"];