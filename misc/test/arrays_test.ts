const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import exp from "constants";
import { BigNumber, Contract } from "ethers";
import hre, { ethers } from "hardhat";

describe("FixedSizeArrays", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("FixedSizeArrays");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0];
  });

  describe("numbers array", function () {
    it("is initialized", async () => {
      console.log("numbers", await contract.numbers(0));
    });

    it("has getLength", async () => {
      expect(await contract.getLength()).to.eq(3);
    });

    it("can set values", async () => {
      await contract.setNumber(0, 123);
      expect(await contract.numbers(0)).to.eq(123);
    });

    it("has bytes array", async () => {
      await contract.setB2('0x1234')
      expect(await contract.b2()).to.eq('0x1234');

      await contract.initializeB2();
      expect(await contract.b2()).to.eq('0x6100');
    });
  });
});


describe("DynamicArrays", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("DynamicArrays");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0];
  });

  describe("numbers array", function () {
    it("can push numbers", async () => {
      await contract.pushNumber(99)
      const txn = await contract.numbers(0);
      console.log(txn)
      expect(txn).to.eq(99)
      expect(await contract.getLength()).to.eq(1)
    });

    it("reverts when index out of bounds", async () => {
      expect(contract.numbers(10)).to.revertedWith('')
    });

    it("can pop numbers", async () => {
      await contract.pushNumber(99)
      expect(await contract.getLength()).to.eq(1)
      const txn = await contract.popNumber();
      expect(await contract.getLength()).to.eq(0)
    });
  });

  describe("memoryArrayFunction", function () {
    it("returns an array", async () => {
      // expect(await contract.memoryArrayFunction()).to.eq([10,20,30].map(n => BigNumber.from(n)))
    });
  });
});