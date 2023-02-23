// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;
pragma abicoder v2;

import "./libs/LibBrokenLine.sol";

interface INextVersionLock {
    function initiateData(uint idLock, LibBrokenLine.Line memory line, address locker, address delegate) external;
}
