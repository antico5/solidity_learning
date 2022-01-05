// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PaymentChannel is ReentrancyGuard {
  using ECDSA for bytes32;

  address payable public payer;
  address payable public receiver;

  uint256 private constant DURATION = 7 * 24 * 60 * 60;
  uint256 public immutable expiresAt;

  constructor(address payable _receiver) {
    require(_receiver != address(0), "receiver is zero address");
    payer = payable(msg.sender);
    receiver = _receiver;
    expiresAt = block.timestamp + DURATION;
  }

  receive() external payable {}

  function getHash(uint256 amount) public view returns (bytes32) {
    return keccak256(abi.encodePacked(address(this), amount));
  }

  function getEthSignedHash(uint256 amount) public view returns (bytes32) {
    return getHash(amount).toEthSignedMessageHash();
  }

  function verify(uint256 amount, bytes memory signature) public view returns (bool) {
    return getEthSignedHash(amount).recover(signature) == payer;
  }

  function close(uint256 amount, bytes memory signature) external nonReentrant {
    require(msg.sender == receiver, "!receiver");
    require(verify(amount, signature), "invalid signature");

    receiver.transfer(amount);

    selfdestruct(payer);
  }

  function cancel() external {
    require(msg.sender == payer, "!payer");
    require(block.timestamp >= expiresAt, "channel not expired yet");

    selfdestruct(payer);
  }
}
