// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

contract Property {
    uint256 private price;
    string public location = "Street 123";
    address public owner;
    uint256 immutable area;

    constructor(uint256 _price) {
        price = _price;
        owner = msg.sender;
        area = 20;
    }

    function setPrice(uint256 _price) public {
        price = _price;
    }

    function getPrice() public view returns (uint256) {
        return price;
    }

    function getInt() public pure returns (uint256) {
        uint256 x = 5;
        x = x * 2;
        return x;
    }

    function setLocation(string memory _location) public {
        location = _location;
    }

    function getString() public pure returns (string memory) {
        string memory x = "hi";
        return x;
    }
}
