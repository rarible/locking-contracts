// import { tenderly } from "hardhat";
import { task } from "hardhat/config";
import { TestERC20__factory, TestERC20 } from "../../typechain";
import {spawn} from './spawn';

task("deploy:TestERC20", "Upgrade").setAction(async (_, hre) => {
  const signers = await hre.ethers.getSigners();
  const testERC20Factory = (await hre.ethers.getContractFactory(
    "TestERC20",
    signers[0]
  )) as TestERC20__factory;
  let testERC20: TestERC20 = await testERC20Factory.deploy();
  await testERC20.deployed();

  console.log("testERC20: ", testERC20.address);

  const verify =  await spawn("npx", ["hardhat", "verify", "--network", hre.network.name, testERC20.address]);

  console.log("verification done", verify);
  // verify
  // npx hardhat verify --network <network> DEPLOYED_CONTRACT_ADDRESS

  //   await tenderly.verify({
  //     name: "TestERC20",
  //     address: testERC20.address,
  //   });
});

// deploy artifact
// https://stermi.medium.com/how-to-deploy-your-first-smart-contract-on-ethereum-with-solidity-and-hardhat-22f21d31096e
