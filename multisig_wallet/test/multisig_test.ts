const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { MultiSig } from "../typechain";

describe("MultiSig", function () {
  let contract: MultiSig;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    contract = await (
      await ethers.getContractFactory("MultiSig")
    ).deploy([signer.address], 1);
    await contract.deployed();
  });

  describe("foo", function () {
    it("bar", async () => {
      console.log(await contract.getTransactionCount());
      const tx = await contract.submitTransaction(signer.address, 0, "0x");
      await tx.wait();
      console.log(await contract.getTransaction(0));
    });
  });
});
