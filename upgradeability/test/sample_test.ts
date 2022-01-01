const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("Upgradeability", function () {
  let baseContract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    baseContract = await (
      await ethers.getContractFactory("BaseContract")
    ).deploy();
    await baseContract.deployed();
  });

  describe("foo", function () {
    it("bar", async () => {
      expect(1);
    });
  });
});
