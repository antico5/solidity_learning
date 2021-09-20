// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

contract BytesAndStrings {
    // String is like bytes but doesn't allow length and index access
    // Also cant add elements to string

    bytes public b1 = "some bytes"; // Use bytes for arbitrary length raw data
    string public s1 = "a string"; // Use string for arbitrary length utf8-encoded data

    function addElement() public {
        b1.push(0x99);
    }
}
