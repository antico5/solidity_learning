pragma solidity ^0.8.7;

contract owned {
    address owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
}

contract mortal is owned {
    function kill() public onlyOwner {
        selfdestruct(payable(owner));
    }
}

contract receiver {
    event Deposit(address indexed from, uint256 amount);

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }
}

contract Faucet is mortal, receiver {
    event Withdrawal(address indexed to, uint256 amount);

    function withdraw(uint256 amt) public {
        require(amt <= 0.1 ether, "can only withdraw less than 0.1");
        payable(msg.sender).transfer(amt);
        emit Withdrawal(msg.sender, amt);
    }
}
