contract DataTypes {
    enum Name {
        item1,
        item2
    }

    struct Person {
        string name;
        uint256 age;
    }

    constructor() {
        uint256 aUint = 123;
        bool aBool = false;
        ufixed32x4 aFixed = 1000.1234;
        address anAddress = 0x1234512345123451234512345123451234512345;
        bytes2 aBytes = "12";
        bytes memory aString = "hello world";
        uint256 timeToParty = 2 days;
        uint256 someEther = 0.1 ether;
    }
}
