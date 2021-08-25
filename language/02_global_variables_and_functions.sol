contract DataTypes {
    function foo() public payable {
        // Message context. Message can be started by EOA or contract
        msg.sender; // caller EOA address or contact addres
        msg.value; // value in ether sent in call
        gasleft(); // remaining gas supply
        msg.data; // call data payload
        msg.sig; // first four bytes of payload, function selector

        // Transaction context. Transaction is started by EOA
        tx.gasprice; // gas price
        tx.origin; // EOA address that originated the call chain. UNSAFE

        // Block context. Information about current block
        blockhash(block.number - 1); // function for getting block hash. parameter is up to 256 block hashes in the past
        block.coinbase; // miner address of current block (will receive fee and reward)
        block.difficulty; // difficulty of PoW
        block.gaslimit; // max amt of gas that can be spent by all txns on current block
        block.number;
        block.timestamp; // placed by the miner. epoch seconds

        // Address methods
        address myAddress = 0x1234567890123456789012345678901234567890;
        myAddress.balance; // Balance in wei
        address(this).balance; // current contracts balance
        payable(myAddress).transfer(123); // Transfer from contract to address. throws EXCEPTION on failure
        payable(myAddress).send(123); // Transfer from contract to address. returns FALSE on failure
        myAddress.call(""); // low level call function. returns FALSE on error. recipient can use up all your gas
        myAddress.delegatecall(""); // call another contract with current msg

        // Built-in functions
        addmod(123, 435, 13); // (a + b) % c // with arbitrary precision on the sum
        mulmod(123, 435, 13); // (a * b) % c // with arbitrary precision on the sum
        keccak256("asdsa");
        sha256("asdsa");
        ripemd160("asdsa");
        selfdestruct(payable(myAddress)); // Suicides and sends remaining ether
    }
}
