// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

contract FixedSizeArrays {
    uint256[3] public numbers = [1, 2, 3];
    bytes1 public b1;
    bytes2 public b2;

    function setNumber(uint256 index, uint256 value) public {
        numbers[index] = value;
    }

    function getLength() public view returns (uint256) {
        return numbers.length;
    }

    function setB2(bytes2 value) public {
        b2 = value;
    }

    function initializeB2() public {
        b2 = "a";
    }
}

contract DynamicArrays {
    uint256[] public numbers;

    function pushNumber(uint256 number) public {
        numbers.push(number);
    }

    function popNumber() public returns (uint256) {
        uint256 number = numbers[numbers.length - 1];
        numbers.pop();
        return number;
    }

    function getLength() public view returns (uint256) {
        return numbers.length;
    }

    function memoryArrayFunction() public pure returns (uint256[] memory) {
        uint256[] memory onMemoryArray = new uint256[](3);
        onMemoryArray[0] = 10;
        onMemoryArray[1] = 20;
        onMemoryArray[2] = 30;

        return onMemoryArray;
    }
}
