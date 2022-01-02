pragma solidity ^0.8.7;

contract Create2Factory {
    event Deployed(address addr, uint256 salt);

    function getAddress(bytes memory bytecode, uint256 salt) public view returns (address) {
        bytes32 hash = keccak256(abi.encodePacked(bytes1(0xff), address(this), salt, keccak256(bytecode)));
        address addr = address(uint160(uint(hash)));
        return addr;
    }

    function deploy(bytes memory bytecode, uint salt) public payable returns (address) {
        address addr;
        assembly {
            addr := create2(
                callvalue(), // wei to send to the created contract
                add(bytecode, 0x20), // start memory position of the code (it starts after the first 32 bytes)
                mload(bytecode), // length in bytes of the code. the length is stored on the first 32 bytes
                salt
            )

            if iszero(extcodesize(addr)) {
                revert(0,0)
            }
        }

        emit Deployed(addr, salt);
        return addr;
    }
}

contract TestContract {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function getBalance() public view returns(uint){
        return address(this).balance;
    }
}