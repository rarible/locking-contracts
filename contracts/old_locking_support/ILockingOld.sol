// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

interface ILockingOld {
    function lock(
        address account,
        address delegate,
        uint amount,
        uint slope,
        uint cliff
    ) external returns (uint);
}