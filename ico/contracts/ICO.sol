// SPDX-License-Identifier: GPL-3.0

/*
Requirements:

  - Must receive eth in exchange for an ERC20 token
  - There is a recipient address that receives all incoming eth.
  - Exchange rate is fixed. 1 eth = 1000 tokens
  - Minimum investment is 0.01 eth and maximum is 5 eth.
  - The ICO hardcap is 300 eth.
  - An admin decides when the ICO starts and ends.
  - The ICO ends when the hardcap is reached or end time is reached.
  - The token will be tradeable only after a specific time set by the admin

*/

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./Token.sol";

uint256 constant TOKENS_PER_ETH = 1000;
uint256 constant HARDCAP = 10 ether;
uint256 constant MIN_INVESTMENT = 0.01 ether;
uint256 constant MAX_INVESTMENT = 5 ether;

contract ICO is Ownable {
  address payable recipient; // address that will receive all invested eth
  uint256 totalRaised; // keep track of raised eth
  uint256 public startBlock; // block after which investment is allowed
  uint256 public endBlock; // block until which investment is allowed
  Token public token; // ERC20 token minted from this ICO

  event Invested(address indexed investor, uint256 etherValue, uint256 tokensReceived);

  constructor(
    address payable _recipient,
    uint256 _startBlock,
    uint256 _endBlock,
    uint256 _tradeableAfterBlock
  ) {
    recipient = _recipient;
    startBlock = _startBlock;
    endBlock = _endBlock;
    token = new Token(_tradeableAfterBlock);
  }

  modifier notFinished() {
    require(block.number >= startBlock, "ICO not started yet");
    require(block.number <= endBlock, "ICO already finished");
    _;
  }

  function invest() public payable notFinished {
    require(msg.value >= MIN_INVESTMENT, "Minimum investment is 0.01 eth");
    require(msg.value <= MAX_INVESTMENT, "Maximum investment is 5 eth");

    // Ensure hardcap is not passed even with current investment
    totalRaised += msg.value;
    require(totalRaised <= HARDCAP, "Hardcap exceeded");

    // Send eth to the contract's recipient
    recipient.transfer(msg.value);

    // Mint tokens for the investor
    uint256 tokens = msg.value * TOKENS_PER_ETH;
    token.mint(msg.sender, tokens);

    emit Invested(msg.sender, msg.value, tokens);
  }

  function setBlocks(uint256 _startBlock, uint256 _endBlock) public onlyOwner {
    startBlock = _startBlock;
    endBlock = _endBlock;
  }
}
