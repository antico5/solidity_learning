const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { TestIterableMappping } from "../typechain";

describe("IterableMapping", function () {
  let contract: TestIterableMappping;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    const library = await (
      await ethers.getContractFactory("IterableMapping")
    ).deploy();
    contract = await (
      await ethers.getContractFactory("TestIterableMappping", {
        libraries: { IterableMapping: library.address },
      })
    ).deploy();
    await contract.deployed();
  });

  describe("testIterableMap()", function () {
    it("doesnt revert", async () => {
      const tx = await contract.testIterableMap();
      await tx.wait();
    });
  });
});
