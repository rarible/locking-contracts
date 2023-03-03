// import { tenderly } from "hardhat";
import { task } from "hardhat/config";
import { TestERC20__factory, TestERC20 } from "../../typechain";

task("deploy:TestERC20", "Upgrade").setAction(async (_, hre) => {
  const signers = await hre.ethers.getSigners();
  const testERC20Factory = (await hre.ethers.getContractFactory(
    "TestERC20",
    signers[0]
  )) as TestERC20__factory;
  let testERC20: TestERC20 = await testERC20Factory.deploy();
  await testERC20.deployed();

  console.log("testERC20: ", testERC20.address);

});

// deploy artifact
// https://stermi.medium.com/how-to-deploy-your-first-smart-contract-on-ethereum-with-solidity-and-hardhat-22f21d31096e
