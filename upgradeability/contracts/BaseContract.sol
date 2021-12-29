pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./StorageV1.sol";
import "hardhat/console.sol";

contract BaseContract is Ownable, StorageV1 {
  address public implementation;

  function setImplementation(address _implementation) external onlyOwner {
    implementation = _implementation;
  }

  fallback() external {
    (bool success, bytes memory data) = implementation.delegatecall(msg.data);
    require(success, "Call to implementation failed");
  }
}
