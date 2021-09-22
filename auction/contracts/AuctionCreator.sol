// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Auction.sol";

contract AuctionCreator is Ownable {
    Auction[] public auctions;

    function createAuction() public {
        Auction auction = new Auction(msg.sender);
        auctions.push(auction);
    }
}
