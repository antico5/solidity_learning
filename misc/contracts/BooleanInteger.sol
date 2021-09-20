// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

contract BooleanInteger {
    bool public sold;

    uint8 public x = 255;
    int8 public y = -10;

    function increase() public {
        x += 1;
    }
}
