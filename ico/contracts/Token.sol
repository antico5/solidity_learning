// SPDX-License-Identifier: GPL-3.0

// ICO Token

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC20('Terra Vision', 'TVI'), Ownable {
  uint tradeableAfterBlock;

  constructor(uint _tradeableAfterBlock){
    tradeableAfterBlock = _tradeableAfterBlock;
  }

  function mint(address account, uint amount) public onlyOwner {
    _mint(account, amount);
  }

  function _transfer(address sender, address recipient, uint amount) internal override {
    require(block.number >= tradeableAfterBlock, "Token is not tradeable yet");
    ERC20._transfer(sender, recipient, amount);
  }

  function setTradeableAfterBlock(uint _tradeableAfterBlock) public onlyOwner {
    tradeableAfterBlock = _tradeableAfterBlock;
  }
}
