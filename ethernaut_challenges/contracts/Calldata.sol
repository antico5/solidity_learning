pragma solidity ^0.6.0;

import "hardhat/console.sol";

contract Calldata {
  function logCallData(uint256 number, string memory str) public view returns (bytes memory) {
    return msg.data;
  }

  function getDelegated() public returns (bool) {
    (bool result, ) = address(this).delegatecall(abi.encodeWithSignature("get()"));
    return result;
  }
}
