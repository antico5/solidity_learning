// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Lottery is Ownable {
    uint256 public constant minParticipants = 2;
    uint256 public constant maxParticipants = 10;

    address payable[] public participants;
    address payable public lastWinner;

    function participate() external payable {
        require(msg.value == 0.1 ether, "ticket cost is 0.1 eth"); // 0.1 eth
        require(
            participants.length < maxParticipants,
            "max participants reached for this round"
        );

        participants.push(payable(msg.sender));
    }

    function execute() external onlyOwner {
        require(
            participants.length >= minParticipants,
            "need more participants"
        );

        uint256 randomNumber = uint256(keccak256(abi.encode(block.timestamp)));
        uint256 winnerIndex = randomNumber % participants.length;
        lastWinner = participants[winnerIndex];
        lastWinner.transfer(address(this).balance);
        delete participants;
    }

    function participantsCount() external view returns (uint256) {
        return participants.length;
    }
}
