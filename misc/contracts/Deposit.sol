// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;
import "hardhat/console.sol";

contract Deposit {
    receive() external payable {
        console.log("Calling receive with value", msg.value);
    }

    fallback() external payable {
        console.log("Calling fallback", msg.value);
    }
}
