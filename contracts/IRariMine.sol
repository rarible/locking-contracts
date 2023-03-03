// SPDX-License-Identifier: MIT

pragma solidity 0.8.17;

interface IRariMine {
    event Claim(address indexed owner, uint value);
    event Value(address indexed owner, uint value);

    struct Balance {
        address recipient;
        uint256 value;
    }
}
