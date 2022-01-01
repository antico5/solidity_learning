pragma solidity ^0.8.7;

import "hardhat/console.sol";

contract MerkleProof {
  function verify(
    bytes32[] memory proof,
    bytes32 root,
    bytes32 leaf,
    uint256 index
  ) public pure returns (bool) {
    bytes32 hash = leaf;
    for (uint256 i = 0; i < proof.length; i++) {
      bytes32 proofElement = proof[i];
      if (index % 2 == 0) {
        hash = keccak256(abi.encodePacked(hash, proofElement));
      } else {
        hash = keccak256(abi.encodePacked(proofElement, hash));
      }

      index = index / 2;
    }

    return hash == root;
  }
}

contract TestMerkleProof is MerkleProof {
  bytes32[] public hashes;

  constructor() {
    string[4] memory transactions = ["transaction 1", "transaction 2", "transaction 3", "transaction 4"];

    for (uint256 i = 0; i < transactions.length; i++) {
      hashes.push(keccak256(abi.encodePacked(transactions[i])));
    }

    uint256 n = transactions.length;
    uint256 offset = 0;

    while (n > 0) {
      for (uint256 i = 0; i < n - 1; i += 2) {
        hashes.push(keccak256(abi.encodePacked(hashes[offset + i], hashes[offset + i + 1])));
      }
      offset += n;
      n = n / 2;
    }
  }

  function getRoot() public view returns (bytes32) {
    return hashes[hashes.length - 1];
  }
}
