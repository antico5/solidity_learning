const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import {
  Create2Factory,
  TestContract,
  TestContractSpy,
  TestContract__factory,
} from "../typechain";
import { DeployedEvent } from "../typechain/Create2Factory";

describe("Create2Factory", function () {
  let factoryContract: Create2Factory;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];

    // Deploy contact
    factoryContract = await (
      await ethers.getContractFactory("Create2Factory")
    ).deploy();
    await factoryContract.deployed();
  });

  describe("deploy()", function () {
    it("deploys a contract", async () => {
      const precalculatedAddress = await factoryContract.getAddress(
        TestContract__factory.bytecode,
        123
      );
      const deployTx = await factoryContract.deploy(
        TestContract__factory.bytecode,
        123
      );
      const receipt = await deployTx.wait();
      const deployEvent = receipt.events![0] as DeployedEvent;

      expect(deployEvent.args?.addr == precalculatedAddress);

      const testContract = TestContract__factory.connect(
        precalculatedAddress,
        signer
      );

      expect(await testContract.owner()).to.eq(factoryContract.address);
    });
  });
});
