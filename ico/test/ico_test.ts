const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'
import {mineBlocks} from './utils/network'
import {MockContract, smock} from '@defi-wonderland/smock'

describe("ICO", function () {
  let contract: MockContract;
  let investor: SignerWithAddress;
  let recipient: SignerWithAddress;
  let tokenContract: Contract;

  let currentBlock: number
  let tradeableAfterBlock: number;
  const blockOffset = 5;
  const blockDuration = 10
  const hardcap = ethers.utils.parseEther('10')

  beforeEach(async () => {
    // Store signer
    investor = (await ethers.getSigners())[0]
    recipient = (await ethers.getSigners())[1]

    // Deploy contact
    const factory = await smock.mock("ICO");
    const tokenFactory = await smock.mock("Token");

    currentBlock = await ethers.provider.getBlockNumber()
    
    const startBlock = currentBlock + blockOffset;
    const endBlock = startBlock + blockDuration
    tradeableAfterBlock = startBlock + blockDuration * 2;

    contract = await factory.deploy(recipient.address, startBlock, endBlock, tradeableAfterBlock);
    await contract.deployed();
    tokenContract = tokenFactory.attach(await contract.token())
  });

  describe("invest", function () {
    describe("when within block boundaries", function () {
      beforeEach(async () => {
        await mineBlocks(blockOffset)
      });

      it("exchanges ether for tokens. transfers the ethers to ICO recipient", async () => {
        await expect(() => 
          contract.invest({value: ethers.utils.parseEther('1')})
        ).to.changeEtherBalance(recipient, ethers.utils.parseEther('1'))
  
        expect(await tokenContract.balanceOf(investor.address)).to.eq(ethers.utils.parseEther('1000'))
      });

      describe("hardcap behavior", function () {
        it("reverts if hardcap was reached", async () => {
          await contract.setVariable('totalRaised', ethers.utils.parseEther('9.99').add(1))
          await expect(contract.invest({value: ethers.utils.parseEther('0.01')})).to.be.revertedWith('Hardcap')
        });
  
        it("doesnt revert if hardcap not reached", async () => {
          await contract.setVariable('totalRaised', ethers.utils.parseEther('9.99'))
          await contract.invest({value: ethers.utils.parseEther('0.01')})
        });
      });

      describe("minimum and maximum investment", function () {
        it("fails if < minimum investment", async () => {
          await expect(contract.invest({value: ethers.utils.parseEther('0.01').sub(1)})).to.be.revertedWith('Minimum investment')
        });

        it("fails if > maximum investment", async () => {
          await expect(contract.invest({value: ethers.utils.parseEther('5').add(1)})).to.be.revertedWith('Maximum investment')
        });
      });

      it("emits an Invested event", async () => {
        await expect(contract.invest({value: ethers.utils.parseEther('1')}))
          .to.emit(contract, 'Invested')
          .withArgs(investor.address, ethers.utils.parseEther('1'), ethers.utils.parseEther('1000'))
      });
    });

    describe("when before startBlock", function () {
      it("reverts", async () => {
        await expect(contract.invest({value: ethers.utils.parseEther('1')})).to.be.revertedWith('not started yet')
      });
    });

    describe("when after startBlock", function () {
      it("reverts", async () => {
        await mineBlocks(blockOffset + blockDuration)
        await expect(contract.invest({value: ethers.utils.parseEther('1')})).to.be.revertedWith('already finished')
      });
    });

  });

  describe("setBlocks", function () {
    it("sets startBlock and endBlock", async () => {
      await contract.setBlocks(100, 200)
      expect(await contract.startBlock()).to.eq(100)
      expect(await contract.endBlock()).to.eq(200)
    });

    it("can only be called by owner", async () => {
      await expect(contract.connect(recipient).setBlocks(100,200)).to.be.revertedWith('not the owner')
    });
  });

  describe("token", function () {
    let testTokenContract: MockContract;

    beforeEach(async () => {
      const testTokenFactory =  await smock.mock("Token");
      testTokenContract = await testTokenFactory.deploy(tradeableAfterBlock)
      await testTokenContract.deployed()
  
      await testTokenContract.mint(investor.address, 1000)
    });

    it("is not transferrable before block specified", async () => {
      await expect(testTokenContract.transfer(recipient.address, 1)).to.be.revertedWith('not tradeable yet')
      await expect(testTokenContract.transferFrom(investor.address, recipient.address, 1)).to.be.revertedWith('not tradeable yet')
    });

    it("is transferrable after block specified", async () => {
      await mineBlocks(tradeableAfterBlock - currentBlock)
      await testTokenContract.transfer(recipient.address, 1)
      await testTokenContract.approve(investor.address, 1)
      await testTokenContract.transferFrom(investor.address, recipient.address, 1)
    });
  });
});