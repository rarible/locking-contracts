// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;


import "../../contracts/libs/LibBrokenLine.sol";
import "../../contracts/INextVersionLock.sol";

contract TestNewLocking is INextVersionLock {
    function initiateData(uint idLock, LibBrokenLine.Line memory line, address locker, address delegate) override external {

    }
}
