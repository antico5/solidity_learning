const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { MerkleProof, TestMerkleProof } from "../typechain";

describe("MerkleProof", function () {
  let contract: TestMerkleProof;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    contract = await (
      await ethers.getContractFactory("TestMerkleProof")
    ).deploy();
    await contract.deployed();
  });

  describe("getRoot", function () {
    it("gets the merkle roof", async () => {
      expect(await contract.getRoot()).to.equal(
        "0x6ea2dc0101dc1558f3019142709d7edcefbc8b26ba9708b2c6d65713e5cf27c3"
      );
    });
  });
});
