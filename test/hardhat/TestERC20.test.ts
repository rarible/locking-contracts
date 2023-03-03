import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TestERC20__factory, TestERC20 } from "../../typechain";
import "@nomicfoundation/hardhat-toolbox";

describe("Token contract", function () {

	let testERC20: TestERC20;
	let owner: SignerWithAddress;
	let addr1: SignerWithAddress;
	let addr2: SignerWithAddress
	let addrs: SignerWithAddress[];

	beforeEach(async function () {

		[owner, addr1, addr2, ...addrs] = await ethers.getSigners();

		const testERC20Factory = (await ethers.getContractFactory(
			"TestERC20", owner
		)) as TestERC20__factory;
		testERC20 = await testERC20Factory.deploy()
		await testERC20.mint(owner.address, 1000000)
	});

	describe("Mint", function () {
		it("Should equal mint amount to owner", async function () {
			const ownerBalance = await testERC20.balanceOf(owner.address);
			expect(await testERC20.balanceOf(owner.address)).to.equal(ownerBalance);
		});
	});

	describe("Transactions", function () {
		it("Should transfer tokens between accounts", async function () {
			// Transfer 50 tokens from owner to addr1
			await testERC20.transfer(addr1.address, 50);
			const addr1Balance = await testERC20.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(50);

			// Transfer 50 tokens from addr1 to addr2
			// We use .connect(signer) to send a transaction from another account
			await testERC20.connect(addr1).transfer(addr2.address, 50);
			const addr2Balance = await testERC20.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});

		it("Should fail if sender doesn’t have enough tokens", async function () {
			const initialOwnerBalance = await testERC20.balanceOf(owner.address);

			// Try to send 1 token from addr1 (0 tokens) to owner (1000 tokens).
			// `require` will evaluate false and revert the transaction.
			await expect(
				testERC20.connect(addr1).transfer(owner.address, 1)
			).to.be.revertedWith("ERC20: transfer amount exceeds balance");

			// Owner balance shouldn't have changed.
			expect(await testERC20.balanceOf(owner.address)).to.equal(
				initialOwnerBalance
			);
		});

		it("Should update balances after transfers", async function () {
			const initialOwnerBalance = await testERC20.balanceOf(owner.address);

			// Transfer 100 tokens from owner to addr1.
			await testERC20.transfer(addr1.address, 100);

			// Transfer another 50 tokens from owner to addr2.
			await testERC20.transfer(addr2.address, 50);

			// Check balances.
			const finalOwnerBalance = await testERC20.balanceOf(owner.address);
			expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

			const addr1Balance = await testERC20.balanceOf(addr1.address);
			expect(addr1Balance).to.equal(100);

			const addr2Balance = await testERC20.balanceOf(addr2.address);
			expect(addr2Balance).to.equal(50);
		});
	});
});