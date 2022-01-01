pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

library IterableMapping {
  // iterable mapping of address to uint
  struct Map {
    address[] keys;
    mapping(address => uint256) values;
    mapping(address => bool) includes;
    mapping(address => uint256) indexes;
  }

  function set(
    Map storage map,
    address key,
    uint256 value
  ) public {
    if (map.includes[key]) {
      map.values[key] = value;
    } else {
      map.values[key] = value;
      map.includes[key] = true;
      map.indexes[key] = map.keys.length;
      map.keys.push(key);
    }
  }

  function get(Map storage map, address key) public view returns (uint256) {
    return map.values[key];
  }

  function getKeyAtIndex(Map storage map, uint256 index) public view returns (address) {
    return map.keys[index];
  }

  function size(Map storage map) public view returns (uint256) {
    return map.keys.length;
  }

  function remove(Map storage map, address keyToRemove) public {
    address lastKey = map.keys[map.keys.length - 1];

    uint256 indexToReassign = map.indexes[keyToRemove];
    map.keys[indexToReassign] = lastKey;
    map.indexes[lastKey] = indexToReassign;

    map.keys.pop();
    delete map.values[keyToRemove];
    delete map.includes[keyToRemove];
    delete map.indexes[keyToRemove];
  }
}

contract TestIterableMappping {
  using IterableMapping for IterableMapping.Map;

  IterableMapping.Map private map;

  function testIterableMap() public {
    map.set(address(0), 0);
    map.set(address(1), 100);
    map.set(address(2), 200); // insert
    map.set(address(2), 200); // update
    map.set(address(3), 300);

    for (uint256 i = 0; i < map.size(); i++) {
      address key = map.getKeyAtIndex(i);

      assert(map.get(key) == i * 100);
    }

    map.remove(address(1));

    // keys = [address(0), address(3), address(2)]
    assert(map.size() == 3);
    assert(map.getKeyAtIndex(0) == address(0));
    assert(map.getKeyAtIndex(1) == address(3));
    assert(map.getKeyAtIndex(2) == address(2));
  }
}
