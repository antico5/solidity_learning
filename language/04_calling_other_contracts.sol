// 1) by creating them
import "../faucet/contracts/Faucet.sol";

contract Token is mortal {
    Faucet _faucet;

    constructor() {
        _faucet = new Faucet();
        _faucet = (new Faucet).value(0.1 ether)(); // Fund it initially
    }
}

// 2) by addressing them

contract Token2 is mortal {
    Faucet _faucet;

    constructor(address faucetAddress) {
        _faucet = Faucet(faucetAddress);
        _faucet.withdraw(0.1 ether); // can call functions directly
    }
}
