// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC721 {
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;
}

contract EnglishAuction is Ownable {
    event Started();
    event Bid(address indexed bidder, uint256 amount);
    event Withdrawn(address indexed bidder, uint256 amount);
    event Ended(address winner, uint256 amount);

    IERC721 public immutable nft;
    uint256 public immutable tokenId;

    uint256 public endAt;
    bool public started;
    bool public ended;

    address public highestBidder;
    uint256 public highestBid;

    mapping(address => uint256) public bids;

    constructor(
        address _nft,
        uint256 _tokenId,
        uint256 _startingBid
    ) {
        require(_nft != address(0), "!nft");

        nft = IERC721(_nft);
        tokenId = _tokenId;
        highestBid = _startingBid;
    }

    function start(uint256 duration) external onlyOwner {
        require(!started, "already started");
        require(duration > 0, "duration > 0");

        nft.transferFrom(owner(), address(this), tokenId);
        started = true;
        endAt = block.timestamp + duration;

        emit Started();
    }

    function bid() external payable {
        require(started, "!started");
        require(block.timestamp < endAt, "sale already ended");

        uint256 newBid = bids[msg.sender] + msg.value;

        require(newBid > highestBid, "bid too low");

        highestBidder = msg.sender;
        highestBid = newBid;

        bids[msg.sender] = newBid;

        emit Bid(msg.sender, newBid);
    }

    function withdraw() external {
        uint256 userBid = bids[msg.sender];
        require(highestBidder != msg.sender, "highest bidder cant withdraw");
        require(userBid > 0, "user has no bids");

        bids[msg.sender] = 0;
        payable(msg.sender).transfer(userBid);

        emit Withdrawn(msg.sender, userBid);
    }

    function end() external {
        require(started, "!started");
        require(!ended, "already ended");
        require(block.timestamp > endAt, "auction didnt end yet");

        ended = true;

        if (highestBidder != address(0)) {
            payable(owner()).transfer(highestBid);
            nft.transferFrom(address(this), highestBidder, tokenId);
        } else {
            nft.transferFrom(address(this), owner(), tokenId);
        }

        emit Ended(highestBidder, highestBid);
    }
}
