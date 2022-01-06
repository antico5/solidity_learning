// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract PaymentChannel {
    using ECDSA for bytes32;

    event BalancesUpdated(address indexed sender, uint256 nonce);
    event Withdrawn(address indexed to, uint256 amount);

    address payable[2] public users;
    mapping(address => bool) public isUser;

    mapping(address => uint256) public balances;

    uint256 public immutable lockTime;
    uint256 public expiresAt;
    uint256 public nonce;

    modifier checkBalances(uint256[2] memory _balances) {
        require(address(this).balance >= _balances[0] + _balances[1], "contract balance not enough");
        _;
    }

    constructor(
        address payable[2] memory _users,
        uint256[2] memory _balances,
        uint256 _expiresAt,
        uint256 _lockTime
    ) payable checkBalances(_balances) {
        require(_expiresAt > block.timestamp);
        require(_lockTime > 0);

        expiresAt = _expiresAt;
        lockTime = _lockTime;

        for (uint256 i = 0; i < _users.length; i++) {
            address payable user = _users[i];

            require(!isUser[user], "duplicate users");

            users[i] = user;
            isUser[user] = true;
            balances[user] = _balances[i];
        }
    }

    function verify(
        bytes[2] memory _signatures,
        address _contract,
        address[2] memory _signers,
        uint256[2] memory _balances,
        uint256 _nonce
    ) public pure returns (bool) {
        for (uint256 i = 0; i < _signatures.length; i++) {
            bytes memory signature = _signatures[i];
            address signer = _signers[i];

            address recovered = keccak256(abi.encodePacked(_contract, _balances, _nonce))
                .toEthSignedMessageHash()
                .recover(signature);

            if (recovered != signer) {
                return false;
            }
        }

        return true;
    }

    modifier checkSignatures(
        bytes[2] memory _signatures,
        uint256[2] memory _balances,
        uint256 _nonce
    ) {
        address[2] memory signers;

        // Copy users from storage to memory
        for (uint256 i = 0; i < users.length; i++) {
            signers[i] = users[i];
        }

        require(verify(_signatures, address(this), signers, _balances, _nonce), "Invalid signatures");

        _;
    }

    modifier onlyUser() {
        require(isUser[msg.sender], "only users");
        _;
    }

    function updateBalances(
        uint256[2] memory _balances,
        uint256 _nonce,
        bytes[2] memory _signatures
    ) public onlyUser checkSignatures(_signatures, _balances, _nonce) checkBalances(_balances) {
        require(block.timestamp < expiresAt, "lock period expired");
        require(_nonce > nonce, "nonce must be greater than the current nonce");

        for (uint256 i = 0; i < _balances.length; i++) {
            balances[users[i]] = _balances[i];
        }

        nonce = _nonce;
        expiresAt = block.timestamp + lockTime;

        emit BalancesUpdated(msg.sender, nonce);
    }

    function withdraw() public onlyUser {
        require(block.timestamp >= expiresAt, "Lock period not expired yet");

        uint256 amount = balances[msg.sender];
        balances[msg.sender] = 0;

        payable(msg.sender).transfer(amount);

        emit Withdrawn(msg.sender, amount);
    }
}
