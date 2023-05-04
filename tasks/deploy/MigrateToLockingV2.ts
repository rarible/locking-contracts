
import { task } from "hardhat/config";
import { Locking__factory, Locking } from "../../typechain";

const mainnet: string = "0x096Bd9a7a2e703670088C05035e23c7a9F428496"

var fs = require('fs');

task("deploy:Locking", "Upgrade").setAction(async (_, hre) => {

  console.log(`upgrading Locking on network ${hre.network.name}`)

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const Locking = await hre.ethers.getContractFactory("Locking") as Locking__factory;

  const locking = await Locking.attach(mainnet)
  if (hre.network.name !== "mainnet") {
    throw new Error("This migration works only for mainnet");
  }

  const counter = (await locking.counter()).toNumber()

  //stopping locking
  await locking.stop();
  console.log(`set stopped = ${await locking.stopped()}`)

  //upgrade to tbe new version
  await hre.upgrades.upgradeProxy(mainnet, Locking);
  console.log(`contract upgraded`)

  let l:any = {}
  let b:any = {}
  let users:any = {}

  console.log('gathering data')
  //gather the data
  for (let i = 1; i <= counter; i++){
    const data: any = await locking.isRelevant(i)
    const isRelevant: boolean = data[0];
    const balanceStart: any = data[1];
    const delegate: string = data[2];
    const lockedStart: any = data[3]
    const account: string = data[4];

    if (!!!users[account]){
      users[account] = {}
    }

    if (i % 50 == 0) {
      console.log(`gathering line data, line = ${i} out of ${counter}`)
    }

    if (!!isRelevant) {
      if (!!!b[balanceStart]){
        b[balanceStart] = []
      }

      if (!!!l[lockedStart]){
        l[lockedStart] = []
      }
      
      b[balanceStart].push(i)
      l[lockedStart].push(i)

      if (!!!users[delegate]){
        users[delegate] = {}
      }

    }
  }
  let locked: any = []
  for (const key in l) {
    locked = locked.concat(l[key]);
  }

  let balance: any = []
  for (const key in b) {
    balance = balance.concat(b[key]);
  }

  fs.writeFileSync('./locked.json', JSON.stringify(locked, null, 2) , 'utf-8');
  fs.writeFileSync('./balance.json', JSON.stringify(balance, null, 2) , 'utf-8');
  fs.writeFileSync('./users.json', JSON.stringify(Object.keys(users), null, 2) , 'utf-8');
  
  const users1 = Object.keys(users).slice(0,250)
  const users2 = Object.keys(users).slice(251)
  //migrating balance lines
  await locking.migrateBalanceLines(balance);
  console.log("done migrating balance lines")

  //migrating locked lines
  await locking.migrateLockedLines(locked);
  console.log("done migrating locked lines")

  //copy amounts and make snapshots part1
  await locking.copyAmountMakeSnapshots(users1)
  console.log("done copying amounts and making snapshots part 1")

  //copy amounts and make snapshots part2
  await locking.copyAmountMakeSnapshots(users2)
  console.log("done copying amounts and making snapshots part 2")

  await locking.start();
  console.log(`set stopped = ${await locking.stopped()}`)
  console.log(`migration finished`)

});
