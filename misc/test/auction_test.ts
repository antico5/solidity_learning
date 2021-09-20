const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Auction", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Auction");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });

  describe("bids mapping", function () {
    it("gets the mapping", async () => {
      expect(await contract.bids(signer.address)).to.eq(0)
    });
  });

  describe("bid function", function () {
    it("adds to the signers bid", async () => {
      await contract.bid({value: 1000})
      await contract.bid({value: 1000})
      await contract.bid({value: 1000})
      expect(await contract.bids(signer.address)).to.eq(3000)
    });
  });
});