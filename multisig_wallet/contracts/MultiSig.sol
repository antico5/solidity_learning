pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract MultiSig {
  event Deposit(address indexed sender, uint256 amount, uint256 balance);
  event SubmitTransaction(address indexed owner, uint256 indexed txnId, address indexed to, uint256 value, bytes data);
  event ConfirmTransaction(address indexed owner, uint256 indexed txnIndex);
  event RevokeTransaction(address indexed owner, uint256 indexed txnId);
  event ExecuteTransaction(address indexed owner, uint256 indexed txnId);

  address[] public owners;
  mapping(address => bool) public isOwner;
  uint256 public reqConfirmations;

  struct Transaction {
    address to;
    uint256 value;
    bytes data;
    uint256 confirmations;
    bool executed;
  }

  mapping(uint256 => mapping(address => bool)) public confirmations;

  Transaction[] public transactions;

  modifier onlyOwner() {
    require(isOwner[msg.sender], "only owner");
    _;
  }

  modifier txnExists(uint256 txnId) {
    require(txnId < transactions.length, "invalid txn id");
    _;
  }

  modifier notExecuted(uint256 txnId) {
    require(!transactions[txnId].executed, "already executed");
    _;
  }

  modifier notConfirmed(uint256 txnId) {
    require(!confirmations[txnId][msg.sender], "sender already confirmed this txn");
    _;
  }

  constructor(address[] memory _owners, uint256 _reqConfirmations) {
    require(_owners.length > 0, "need owners");
    require(_reqConfirmations > 0, "confirmations shoudl be >0");

    for (uint256 i = 0; i < _owners.length; i++) {
      address owner = _owners[i];

      require(owner != address(0), "owner cant be 0");
      require(!isOwner[owner], "duplicate owner");

      owners.push(owner);
      isOwner[owner] = true;
    }

    reqConfirmations = _reqConfirmations;
  }

  receive() external payable {
    emit Deposit(msg.sender, msg.value, address(this).balance);
  }

  function submitTransaction(
    address _to,
    uint256 _value,
    bytes memory _data
  ) public onlyOwner {
    uint256 txnId = transactions.length;

    Transaction memory txn = Transaction({to: _to, value: _value, data: _data, confirmations: 0, executed: false});
    transactions.push(txn);

    emit SubmitTransaction(msg.sender, txnId, _to, _value, _data);
  }

  function confirmTransaction(uint256 txnId) public onlyOwner txnExists(txnId) notExecuted(txnId) notConfirmed(txnId) {
    confirmations[txnId][msg.sender] = true;
    transactions[txnId].confirmations += 1;
    emit ConfirmTransaction(msg.sender, txnId);
  }

  function executeTransaction(uint256 txnId) external onlyOwner txnExists(txnId) notExecuted(txnId) {
    Transaction storage txn = transactions[txnId];
    require(txn.confirmations >= reqConfirmations, "need more confirmations");

    txn.executed = true;
    emit ExecuteTransaction(msg.sender, txnId);
    (bool success, ) = txn.to.call{value: txn.value}(txn.data);
    require(success, "Call failed");
  }

  function revokeConfirmation(uint256 txnId) public onlyOwner txnExists(txnId) notExecuted(txnId) {
    require(confirmations[txnId][msg.sender], "cant revoke non-confirmed txn");

    Transaction storage txn = transactions[txnId];
    confirmations[txnId][msg.sender] = false;
    txn.confirmations -= 1;

    emit RevokeTransaction(msg.sender, txnId);
  }

  function getOwners() public view returns (address[] memory) {
    return owners;
  }

  function getTransactionCount() public view returns (uint256) {
    return transactions.length;
  }

  function getTransaction(uint256 txnId) public view returns (Transaction memory) {
    Transaction storage txn = transactions[txnId];
    return (txn);
  }
}
