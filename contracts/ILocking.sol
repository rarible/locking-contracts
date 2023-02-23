// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;
pragma abicoder v2;

interface ILocking {
    function lock(
        address account,
        address delegate,
        uint96 amount,
        uint32 slope,
        uint32 cliff
    ) external returns (uint);
}