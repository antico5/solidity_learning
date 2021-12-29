pragma solidity ^0.8.7;

import "./StorageV1.sol";
import "hardhat/console.sol";

contract Implementation2 is StorageV1 {
  function setVar() external {
    console.log("Hi from implementation 2");
    myVar = 2;
  }
}
