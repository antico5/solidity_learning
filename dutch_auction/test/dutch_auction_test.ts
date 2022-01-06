const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { DutchAuction, TestNFT } from "../typechain";
import { advanceTime, restoreSnapshot, takeSnapshot } from "./utils/network";

const TOKEN_ID = 0;
const START_PRICE = 100_000;
const END_PRICE = 50_000;
const A_WEEK = 7 * 24 * 60 * 60;

describe("DutchAuction", function () {
  let auctionContract: DutchAuction;
  let tokenContract: TestNFT;
  let seller: SignerWithAddress;
  let buyer: SignerWithAddress;
  let snapshot: number;

  beforeEach(async () => {
    if (snapshot) {
      await restoreSnapshot(snapshot);
      return;
    }

    // Store signer
    seller = (await ethers.getSigners())[0];
    buyer = (await ethers.getSigners())[1];

    // Deploy contracts
    tokenContract = await (await ethers.getContractFactory("TestNFT")).deploy();

    await tokenContract.mint(seller.address, 0);

    const startAt = Math.floor(new Date().getTime() / 1000) + 5;
    const endAt = startAt + A_WEEK;

    auctionContract = await (
      await ethers.getContractFactory("DutchAuction")
    ).deploy(tokenContract.address, TOKEN_ID, START_PRICE, END_PRICE, startAt, endAt);
    await auctionContract.deployed();

    // Transfer the NFT to the auction contract
    await tokenContract.connect(seller).transferFrom(seller.address, auctionContract.address, 0);

    snapshot = await takeSnapshot();
  });

  describe("Someone buys the token", function () {
    it("buyer gets token and change, seller gets money", async () => {
      await advanceTime(A_WEEK / 2); // middle of sale, price is between min and max

      const buyTx = await auctionContract.connect(buyer).buy({ value: 100_000 });
      const buyRcp = await buyTx.wait();

      // buyer  got the NFT
      expect(await tokenContract.ownerOf(TOKEN_ID)).to.equal(buyer.address);

      // Contract recorded money for seller and change for buyer
      const saleMoney = await auctionContract.saleMoney();
      expect(saleMoney).to.be.closeTo(BigNumber.from(75000), 10);
      const buyersChange = await auctionContract.buyersChange();
      expect(buyersChange).to.be.closeTo(BigNumber.from(25000), 10);

      // seller can withdraw money
      await expect(() => auctionContract.connect(seller).withdrawPayment()).to.changeEtherBalance(seller, saleMoney);

      // buyer can withdraw change
      await expect(() => auctionContract.connect(buyer).withdrawChange()).to.changeEtherBalance(buyer, buyersChange);

      expect(await ethers.provider.getBalance(auctionContract.address)).to.equal(0);
      expect(await tokenContract.balanceOf(auctionContract.address)).to.equal(0);
    });
  });

  describe("Nobody buys the token", function () {
    it("the seller can get their NFT back", async () => {
      await advanceTime(A_WEEK + 10);

      expect(await tokenContract.ownerOf(TOKEN_ID)).to.equal(auctionContract.address);

      await (await auctionContract.connect(seller).retrieveUnsoldToken()).wait();

      expect(await tokenContract.ownerOf(TOKEN_ID)).to.equal(seller.address);
    });
  });
});
