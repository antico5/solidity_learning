// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.7;

enum Specialty {
    JAVASCRIPT,
    SOLIDITY
}

struct Instructor {
    uint256 age;
    string name;
    address addr;
    Specialty specialty;
}

contract Academy {
    Instructor public academyInstructor;

    constructor(uint256 _age, string memory _name) {
        academyInstructor.age = _age;
        academyInstructor.name = _name;
        academyInstructor.addr = msg.sender;
    }

    function changeInstructor(
        uint256 _age,
        string memory _name,
        address _addr
    ) public {
        Instructor memory newInstructor = Instructor({
            age: _age,
            name: _name,
            addr: _addr,
            specialty: Specialty.JAVASCRIPT
        });

        academyInstructor = newInstructor;
    }
}

contract School {
    Instructor public schoolInstructor;
}
