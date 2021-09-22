// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

contract Auction is Ownable {
    uint256 constant BLOCKS_IN_A_WEEK = 40320;

    enum State {
        STARTED,
        RUNNING,
        ENDED,
        CANCELED
    }

    uint256 public startBlock;
    uint256 public endBlock;
    string public ipfsHash;
    State public state;
    uint256 public highestBindingBid;
    address payable public highestBidder;
    mapping(address => uint256) public bids;
    uint256 bidIncrement;

    constructor(address owner) {
        state = State.RUNNING;
        startBlock = block.number;
        endBlock = startBlock + BLOCKS_IN_A_WEEK;
        ipfsHash = "";
        bidIncrement = 100;
        transferOwnership(owner);
    }

    modifier notOwner() {
        require(msg.sender != owner(), "not callable by owner");
        _;
    }

    modifier afterStart() {
        require(block.number >= startBlock, "auction didnt start yet");
        _;
    }

    modifier beforeEnd() {
        require(block.number <= endBlock, "auction already ended");
        _;
    }

    function cancel() public onlyOwner {
        state = State.CANCELED;
    }

    function placeBid() public payable notOwner afterStart beforeEnd {
        require(state == State.RUNNING, "auction is not running");
        require(msg.value >= 100, "minimum bid is 100 wei");

        uint256 currentSenderBid = bids[msg.sender] + msg.value;
        require(currentSenderBid > highestBindingBid);

        bids[msg.sender] = currentSenderBid;

        uint256 currentHighestBid = bids[highestBidder];
        if (currentSenderBid <= currentHighestBid) {
            highestBindingBid = Math.min(
                currentSenderBid + bidIncrement,
                currentHighestBid
            );
        } else {
            highestBindingBid = Math.min(
                currentSenderBid,
                currentHighestBid + bidIncrement
            );
            highestBidder = payable(msg.sender);
        }
    }

    function finalize() public {
        require(state == State.CANCELED || block.number > endBlock);
        require(msg.sender == owner() || bids[msg.sender] > 0);

        address payable recipient;
        uint256 value;

        if (state == State.CANCELED) {
            recipient = payable(msg.sender);
            value = bids[msg.sender];
        } else {
            if (msg.sender == payable(owner())) {
                recipient = payable(owner());
                value = highestBindingBid;
            } else {
                if (msg.sender == highestBidder) {
                    recipient = highestBidder;
                    value = bids[highestBidder] - highestBindingBid;
                } else {
                    recipient = payable(msg.sender);
                }
            }
        }

        bids[recipient] = 0;
        recipient.transfer(value);
    }
}
