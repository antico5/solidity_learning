pragma solidity ^0.8.7;

import "./StorageV1.sol";
import "hardhat/console.sol";

contract Implementation1 is StorageV1 {
  function setVar() external {
    console.log("Hi from implementation 1");
    myVar = 1;
  }
}
