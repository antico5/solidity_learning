pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract DutchAuction is Ownable {
    IERC721 public immutable nft;
    uint256 public immutable tokenId;

    uint256 public immutable startPrice;
    uint256 public immutable endPrice;

    uint256 public immutable startTime;
    uint256 public immutable endTime;

    address public buyer; // address of buyer
    uint256 public saleMoney; // price at which the nft sold
    uint256 public buyersChange; // in case buyer sends more money than actual price

    modifier onlyBuyer() {
        require(msg.sender == buyer, "sender is not buyer");
        _;
    }

    modifier ongoingSale() {
        require(block.timestamp >= startTime, "sale didnt start yet");
        require(block.timestamp <= endTime, "sale already ended");
        _;
    }

    constructor(
        address _nft,
        uint256 _tokenId,
        uint256 _startPrice,
        uint256 _endPrice,
        uint256 _startTime,
        uint256 _endTime
    ) {
        require(_nft != address(0), "nft zero address");
        require(_startPrice > 0, "start price must be positive");
        require(_endPrice > 0, "end price must be positive");
        require(_startPrice > _endPrice, "start price must be > end price");
        require(_startTime >= block.timestamp, "must start in the future");
        require(_endTime > _startTime, "end time must be > start time");

        nft = IERC721(_nft);
        tokenId = _tokenId;
        startPrice = _startPrice;
        endPrice = _endPrice;
        startTime = _startTime;
        endTime = _endTime;
    }

    function buy() external payable ongoingSale {
        require(buyer == address(0), "already sold");

        require(msg.value >= currentPrice(), "not enough ether");

        saleMoney = currentPrice();
        buyersChange = msg.value - saleMoney;
        buyer = msg.sender;

        nft.transferFrom(address(this), msg.sender, tokenId);
    }

    function withdrawPayment() external onlyOwner {
        require(buyer != address(0), "token not sold yet");
        require(saleMoney > 0, "already withdrew");

        uint256 _saleMoney = saleMoney;
        saleMoney = 0;
        payable(owner()).transfer(_saleMoney);
    }

    function retrieveUnsoldToken() external onlyOwner {
        require(buyer == address(0), "token was sold");
        require(block.timestamp > endTime, "sale still in progress");
        require(nft.ownerOf(tokenId) == address(this), "contract doesnt have the token anymore");

        nft.transferFrom(address(this), owner(), tokenId);
    }

    function withdrawChange() external onlyBuyer {
        require(buyersChange > 0, "nothing to withdraw");

        uint256 _buyersChange = buyersChange;
        buyersChange = 0;

        payable(msg.sender).transfer(_buyersChange);
    }

    function currentPrice() public view ongoingSale returns (uint256) {
        uint256 elapsed = block.timestamp - startTime;
        uint256 duration = endTime - startTime;

        uint256 priceDelta = startPrice - endPrice;

        uint256 discount = (priceDelta * elapsed) / duration;
        return startPrice - discount;
    }
}
