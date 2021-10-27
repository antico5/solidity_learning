// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdFunding is Ownable {
  mapping(address => uint256) public contributors;
  uint256 public contributorsCount;
  uint256 public minContribution;
  uint256 public deadline; //timestamp
  uint256 public goal;
  uint256 public raisedAmount;

  mapping(uint256 => Request) public requests;
  uint256 public requestsCount;

  struct Request {
    string description;
    address recipient;
    uint256 value;
    bool executed;
    uint256 votersCount;
    mapping(address => bool) voters;
  }

  event RequestCreated(uint indexed requestId, string description, address indexed recipient, uint value);

  modifier onFailed() {
    require(block.timestamp > deadline && raisedAmount < goal);
    _;
  }

  modifier onSuccess() {
    require(raisedAmount >= goal, "the campaign didnt reach its goal yet");
    _;
  }

  modifier onlyContributors() {
    require(_contributed() > 0, "only contributors can vote");
    _;
  }

  modifier notExecuted(uint256 requestId) {
    require(requests[requestId].executed == false, 'the request has already been executed');
    _;
  }

  constructor(uint256 _goal, uint256 secondsToDeadline) {
    goal = _goal;
    deadline = block.timestamp + secondsToDeadline;
    minContribution = 100 wei;
  }

  function contribute() public payable {
    require(block.timestamp <= deadline, "Crowdfunding already finished");
    require(msg.value >= minContribution, "minimum contribution not met");

    if (_contributed() == 0) {
      // first time contributor
      contributorsCount++;
    }

    _addContribution(msg.value);
    raisedAmount += msg.value;
  }

  function getRefund() public onlyContributors onFailed {
    uint256 refundAmount = _contributed();
    _setContribution(0);
    raisedAmount -= refundAmount;
    contributorsCount--;
    payable(msg.sender).transfer(refundAmount);
  }

  receive() external payable {
    contribute();
  }

  function _contributed() internal view returns (uint256) {
    return contributors[msg.sender];
  }

  function _addContribution(uint256 value) internal {
    contributors[msg.sender] += value;
  }

  function _setContribution(uint256 value) internal {
    contributors[msg.sender] = value;
  }

  function createRequest(
    string memory description,
    address recipient,
    uint256 value
  ) public onlyOwner returns(uint) {
    uint requestId = requestsCount;
    Request storage request = requests[requestId];

    request.description = description;
    request.recipient = recipient;
    request.value = value;

    requestsCount++;

    emit RequestCreated(requestId, description, recipient, value);
    return requestId;
  }

  function vote(uint256 requestId) public onlyContributors onSuccess notExecuted(requestId) {
    require(requests[requestId].voters[msg.sender] == false, "you already voted");

    requests[requestId].voters[msg.sender] = true;
    requests[requestId].votersCount++;
  }

  function didVote(uint256 requestId, address contributor) public view returns (bool) {
    return requests[requestId].voters[contributor];
  }

  function makePayment(uint256 requestId) public onlyOwner onSuccess notExecuted(requestId) {
    Request storage request = requests[requestId];
    require(request.votersCount >= contributorsCount/2, 'need more than half of contributors votes');
    require(address(this).balance >= request.value, 'not enough funds');

    payable(request.recipient).transfer(request.value);
  }
}
