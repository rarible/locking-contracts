// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import {TestERC20} from "test/contracts/TestERC20.sol";
import {Utilities} from "./utils/Utilities.sol";
import {Vm} from "forge-std/Vm.sol";
import {DSTest} from "ds-test/test.sol";

contract TestERC20Test is DSTest {
    Vm internal immutable vm = Vm(HEVM_ADDRESS);

    Utilities internal utils;
    address payable[] internal users;
    TestERC20 public testERC20;

    function setUp() public {
        utils = new Utilities();
        users = utils.createUsers(5);
        testERC20 = new TestERC20();
    }

    function testMint() public {
        console.log('test mint');
        console.log(users[0]);
        testERC20.mint(users[0], 1000);
        assertEq(testERC20.balanceOf(users[0]), 1000);
    }

}
