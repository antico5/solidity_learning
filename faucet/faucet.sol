pragma solidity ^0.8.7;

contract Faucet {
    function withdraw(uint256 amt) public {
        require(amt < 10000000000000000000000);
        payable(msg.sender).transfer(amt);
    }

    receive() external payable {}
}
