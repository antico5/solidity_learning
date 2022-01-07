const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("MyContract", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    contract = await (
      await ethers.getContractFactory("MyContract")
    ).deploy();
    await contract.deployed();
  });

  describe("myFunction()", function () {
    it("does something", async () => {
      expect(1).to.equal(1);
    });
  });
});
