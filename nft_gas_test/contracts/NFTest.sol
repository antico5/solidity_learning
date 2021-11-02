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

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NFTest is ERC721("Test", "TEST") {
  function mint(address to, uint256 tokenId) public {
    _mint(to, tokenId);
  }

  function transfer(
    address from,
    address to,
    uint256 tokenId
  ) public {
    _transfer(from, to, tokenId);
  }

  function mintWithMerkleProof(
    address to,
    uint256 tokenId,
    string[] calldata proof
  ) public {
    _mint(to, tokenId);
    _hashProof(proof);
  }

  function transferWithMerkleProof(
    address from,
    address to,
    uint256 tokenId,
    string[] calldata proof
  ) public {
    _hashProof(proof);
    _transfer(from, to, tokenId);
  }

  function _hashProof(string[] calldata proof) internal pure {
    for (uint256 index = 0; index < proof.length; index++) {
      keccak256(abi.encode(proof[index]));
    }
  }
}
