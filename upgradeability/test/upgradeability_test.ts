const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import hre, { ethers } from "hardhat";
import { mineBlocks } from "./utils/network";
import { MockContract, smock } from "@defi-wonderland/smock";

describe("Upgradeability", function () {
  let baseContract: Contract;
  let imp1Contract: Contract;
  let imp2Contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    baseContract = await (
      await ethers.getContractFactory("BaseContract")
    ).deploy();
    await baseContract.deployed();

    imp1Contract = await (
      await ethers.getContractFactory("Implementation1")
    ).deploy();
    await imp1Contract.deployed();

    imp2Contract = await (
      await ethers.getContractFactory("Implementation2")
    ).deploy();
    await imp2Contract.deployed();
  });

  describe("foo", function () {
    it("bar", async () => {
      console.log("baseContract", baseContract.address);
      console.log("imp1Contract", imp1Contract.address);
      console.log("imp2Contract", imp2Contract.address);

      console.log("owner base", await baseContract.owner());
      console.log("implementation", await baseContract.implementation());

      await (await baseContract.setImplementation(imp1Contract.address)).wait();
      let attached = imp1Contract.attach(baseContract.address);
      await (await attached.setVar()).wait();

      console.log("owner base", await baseContract.owner());
      console.log(await baseContract.signer.getAddress());
      await (await baseContract.setImplementation(imp2Contract.address)).wait();
      attached = imp2Contract.attach(baseContract.address);
      await (await attached.setVar()).wait();
    });
  });
});
