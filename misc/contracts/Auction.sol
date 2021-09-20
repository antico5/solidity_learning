// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

// Keys cannot be mappings, dynamic array, enum or struct
// Values can be any type

// Mappings are always saved in storage

// Mappings are not iterable

// Keys are not saved. Only the hashes

// Unexisting key => default value of that type

contract Auction {
    mapping(address => uint256) public bids;

    function bid() public payable {
        bids[msg.sender] += msg.value;
    }
}
