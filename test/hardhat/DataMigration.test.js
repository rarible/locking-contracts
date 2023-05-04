const TestMigrationLocking = artifacts.require("TestMigrationLocking.sol");

const ProxyAdmin = artifacts.require("ProxyAdmin.sol");
const { network, upgrades } = require('hardhat');
require('dotenv').config();

contract("Locking", accounts => {
  let proxyAdmin;

  const lockingProd = "0x096Bd9a7a2e703670088C05035e23c7a9F428496"
  const deployer = "0x20b9049c69DeA7e5d46De82cE0b33A9D5a8a0893"
  const proxyAdmingAddr = "0x80033c932904E077e55a6E43E5E9a796f34d2525"

  beforeEach(async () => {
    proxyAdmin = await ProxyAdmin.at(proxyAdmingAddr)
  })

  describe("data migration", () => {
    it("migrating one line works", async () => {
      if (process.env.RUN_MIGRATION_TEST !== "true") {
        console.log('skipping the migration test')
        return;
      }

      const impersonatedSigner = await ethers.getImpersonatedSigner(deployer);
      await network.provider.send("hardhat_setBalance", [
        impersonatedSigner.address,
        "0x3635C9ADC5DEA000000000000000000000000000000",
      ]);
      
      const LockingFactory = await ethers.getContractFactory("TestMigrationLocking");

      const locking = await LockingFactory.attach(lockingProd)
      const counter = (await locking.counter()).toNumber()

      await locking.connect(impersonatedSigner).stop();
      console.log(`set stopped = ${await locking.stopped()}`)

      //updating locking
      const newLocking = await TestMigrationLocking.new({ from: impersonatedSigner.address });
      await proxyAdmin.upgrade(locking.address, newLocking.address, { from: impersonatedSigner.address })
      let l = {}
      let b = {}
      let users = {}
      
      for (let i = 1; i <= counter; i++){
        const data = await locking.isRelevant(i)
        const isRelevant = data[0];
        const balanceStart = data[1];
        const delegate = data[2];
        const lockedStart = data[3]
        const account = data[4];

        if (!!!users[account]){
          users[account] = {}
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
      let locked = []
      for (const key in l) {
        locked = locked.concat(l[key]);
      }

      let balance = []
      for (const key in b) {
        balance = balance.concat(b[key]);
      }

      //let final_users = Object.keys(users);
      const users1 = Object.keys(users).slice(0,250)
      const users2 = Object.keys(users).slice(251)
      
      //fs.writeFileSync('./locked.json', JSON.stringify(locked, null, 2) , 'utf-8');
      //fs.writeFileSync('./balance.json', JSON.stringify(balance, null, 2) , 'utf-8');
      //fs.writeFileSync('./users.json', JSON.stringify(Object.keys(users), null, 2) , 'utf-8');
      
      //migrating balance lines
      await locking.connect(impersonatedSigner).migrateBalanceLines(balance);
      console.log("done migrating balance lines")

      //migrating locked lines
      await locking.connect(impersonatedSigner).migrateLockedLines(locked);
      console.log("done migrating locked lines")

      //copy amounts and make snapshots part1
      await locking.connect(impersonatedSigner).copyAmountMakeSnapshots(users1)
      console.log("done copying amounts and making snapshots part 1")

      //copy amounts and make snapshots part2
      await locking.connect(impersonatedSigner).copyAmountMakeSnapshots(users2)
      console.log("done copying amounts and making snapshots part 2")

      await locking.connect(impersonatedSigner).start();
      console.log(`set stopped = ${await locking.stopped()}`)
      console.log(`migration finished`)
      
      for (let i = 1; i <= counter; i++){
        const result = await locking.isLineCopiedCorrectly(i);
        assert.equal(result, true, "line " + i)
      }

    });

  })

})