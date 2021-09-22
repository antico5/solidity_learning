const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Auction", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0]

    // Deploy contact
    const factory = await ethers.getContractFactory("Auction");
    contract = await factory.deploy(signer.address);
    await contract.deployed();
  });

  describe("owner", function () {
    it("is the contract deployer", async () => {
      expect(await contract.owner()).to.eq(signer.address)
    });
  });

  describe("placeBid", function () {
    it("cant be called by owner", async () => {
      expect(contract.placeBid()).to.revertedWith("not callable by owner")
    });
  });
});