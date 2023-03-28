import { ethers, network, upgrades } from "hardhat";

type NetworkSettings = {
  timelock: string;
  adminProxyAddress: string;
  lockingAddress: string;
  rariMineAddress: string;
}

type Settings = {
  mainnet: NetworkSettings;
  goerli: NetworkSettings;
  default: NetworkSettings;
}


const mainnet: NetworkSettings = {
	timelock: "0x7e9c956e3EFA81Ace71905Ff0dAEf1A71f42CBC5",
  adminProxyAddress: "0xDc8BaA86f136F8B0851F090a4DfFDc7b5F46688D",
  lockingAddress: "0x096Bd9a7a2e703670088C05035e23c7a9F428496",
  rariMineAddress: "0xc633F65A1BEBD433DF12D9F3ac7aCF31b26Ca1E6"
}

const goerli: NetworkSettings = {
	timelock: "0x1C795d4AEf47BBbf0698471A3b04D51b2BFac893",
  adminProxyAddress: "0x919AEd466F30A821670b12aaab3A4102d8536486",
  lockingAddress: "0x39C9D13e1b17Bf1975aFe892e18B1D5A1482b52D",
  rariMineAddress: "0xD335eEc939Ff164AF82e2ab97B6c16380308eCEB"
}

const def: NetworkSettings = {
	timelock: "0x0000000000000000000000000000000000000000",
  adminProxyAddress: "0x0000000000000000000000000000000000000000",
  lockingAddress: "0x0000000000000000000000000000000000000000",
  rariMineAddress: "0x0000000000000000000000000000000000000000"
}

let settings: Settings = {
	"default": def,
	"mainnet": mainnet,
	"goerli": goerli
};

function getSettings(network: string) : NetworkSettings {
	if (settings[network as keyof Settings] !== undefined) {
		return settings[network as keyof Settings];
	} else {
		return settings["default"];
	}
} 

async function main() {
  console.log(`deploying Locking on network ${network.name}`)

  const [deployer] = await ethers.getSigners();

  const set = getSettings(network.name);
  console.log("settings:", set)

  console.log("Deploying contracts with the account:", deployer.address);
  
  //changing owner of locking to timelock
  const Locking = await ethers.getContractFactory("Locking");
  const locking = await Locking.attach(set.lockingAddress)
  await changeOwner(locking, set.timelock, "locking")

  //changing owner of rariMineV3 to timelock
  const RariMineV3 = await ethers.getContractFactory("RariMineV3");
  const rariMineV3 = await RariMineV3.attach(set.rariMineAddress)
  await changeOwner(rariMineV3, set.timelock, "rariMineV3")
  
  //changing Locking and RariMineV3 proxyAdmin address
  //setting proxyAdmin that owned by governance
  const admin = (await upgrades.admin.getInstance())

  await changeAdminProxy(admin, locking, set.adminProxyAddress, "locking")
  await changeAdminProxy(admin, rariMineV3, set.adminProxyAddress, "rariMineV3" )

}

async function changeOwner(contract: any, newOwner: string, contractName: string) {
  const oldOwner = await contract.owner();
  await contract.transferOwnership(newOwner)
  console.log(`for contract ${contractName} at ${contract.address} changed owner from ${oldOwner} to ${await contract.owner()}`)
}

async function changeAdminProxy(admin: any, contract : any, newAdmin: string, contractName: string) {
  const oldAdmin = await admin.getProxyAdmin(contract.address)
  await admin.changeProxyAdmin(contract.address, newAdmin)
  const ProxyAdmin = await ethers.getContractFactory("ProxyAdmin");
  const newAdminContract = await ProxyAdmin.attach(newAdmin)
  console.log(`for contract ${contractName} at ${contract.address} changed ProxyAdmin address from ${oldAdmin} to ${await newAdminContract.getProxyAdmin(contract.address)}`)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });