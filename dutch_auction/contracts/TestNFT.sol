pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestNFT is ERC721("", "") {
    function mint(address to, uint256 tokenId) public {
        _mint(to, tokenId);
    }
}
