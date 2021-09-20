// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "hardhat/console.sol";

contract BuiltInVars {
    constructor() {}

    function printGlobals() public {
        console.log("gasleft");
        console.log(gasleft());
        console.log("this");
        console.log(address(this));
        console.log("block.timestamp");
        console.log(block.timestamp);
        console.log("block.number");
        console.log(block.number);
        console.log("block.difficulty");
        console.log(block.difficulty);
        console.log("tx.gasprice");
        console.log(tx.gasprice);
    }

    function countGas() public view returns (uint256) {
        uint256 start = gasleft();
        uint256 j = 1235 * 127396;
        uint256 end = gasleft();

        return start - end;
    }
}
