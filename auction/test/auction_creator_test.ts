const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("AuctionCreator", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("AuctionCreator");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });


  describe("createAuction", function () {
    it("creates an auction with owner as the caller", async () => {
      await contract.createAuction();
      const auctionAddress = await contract.auctions(0);
      const auctionContract = (await ethers.getContractFactory("Auction")).attach(auctionAddress);
      const auctionOwner = await auctionContract.owner()
      expect(auctionOwner).to.eq(signer.address)
    });
  });
});