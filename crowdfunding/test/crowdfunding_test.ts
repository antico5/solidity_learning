const { expect } = require("chai");
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'
import { MockContract, smock } from '@defi-wonderland/smock'

describe("CrowdFunding", function () {
  let contract: MockContract;
  let signer: SignerWithAddress;
  let otherSigner: SignerWithAddress;
  let yetAnotherSigner: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await smock.mock("CrowdFunding");
    contract = await factory.deploy(ethers.utils.parseEther('10'), 600);
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
    otherSigner = (await ethers.getSigners())[1]
    yetAnotherSigner = (await ethers.getSigners())[2]
  });

  describe("contribute", function () {
    it("adds to the contract balance and raised amount", async () => {
      const balance = await ethers.provider.getBalance(contract.address);
      const raisedAmount = await contract.raisedAmount();

      // Calling contribute
      await contract.contribute({value: ethers.utils.parseEther('1')})

      //  Sending eth directly
      await signer.sendTransaction({to: contract.address, value: ethers.utils.parseEther('1')})

      // Calling contribute with other sender
      await contract.connect(otherSigner).contribute({value: ethers.utils.parseEther('0.5')})

      const newBalance = await ethers.provider.getBalance(contract.address);
      const newRaisedAmount = await contract.raisedAmount();

      expect(newBalance.sub(balance)).to.eq(ethers.utils.parseEther('2.5'))
      expect(newRaisedAmount.sub(raisedAmount)).to.eq(ethers.utils.parseEther('2.5'))
      expect(await contract.contributorsCount()).to.eq(2)
    });

    it("rejects if deadline is over", async () => {
      const hrep = hre as any;
      await hre.timeAndMine.increaseTime("601")

      expect(contract.contribute({value: 100000})).to.revertedWith('already finished')
    });

    it("rejects if the deposit amount is too low", async () => {
      expect(contract.contribute({value: 99})).to.revertedWith('minimum contribution')
    });
  });

  describe("getRefund", function () {
    it("returns the deposited funds to the contributor", async () => {
      await contract.contribute({value: 1000});
      await contract.contribute({value: 500});

      // Pass deadline
      await hre.timeAndMine.increaseTime("601")

      const oldBalance = await ethers.provider.getBalance(signer.address);

      const tx = await contract.getRefund() as TransactionResponse;
      const receipt = await tx.wait();

      const expectedBalance = oldBalance.sub(receipt.effectiveGasPrice.mul(receipt.gasUsed)).add(1500);
      const newBalance = await ethers.provider.getBalance(signer.address);

      expect(newBalance).to.eq(expectedBalance)
      expect(await contract.raisedAmount()).to.eq(0)
      expect(await contract.contributorsCount()).to.eq(0)
    });

    it("fails if the crowdfund didnt finish", async () => {
      await contract.contribute({value: 1000});

      // Dont pass deadline
      await hre.timeAndMine.increaseTime("599")

      expect(contract.getRefund()).to.revertedWith('')
    });

    it("fails if the user is not a contributor", async () => {
      // Pass deadline
      await hre.timeAndMine.increaseTime("601")

      expect(contract.getRefund()).to.revertedWith('')
    });
  });

  describe("createRequest", function () {
    it("creates a request", async () => {
      await contract.createRequest('Test request', signer.address, 1000);

      const request = await contract.requests(0)
      expect(request.description).to.eq('Test request')
      expect(request.recipient).to.eq(signer.address)
      expect(request.value).to.eq(BigNumber.from(1000))
      expect(request.executed).to.eq(false)
      expect(request.votersCount).to.eq(0)
    });

    it("can be created only by the owner", async () => {
      expect(contract.connect(otherSigner).createRequest('Test request', signer.address, 1000)).to.revertedWith('owner')
    });
  });

  describe("vote", function () {
    beforeEach(async () => {
      await contract.createRequest('Test request', signer.address, 1000);
    });

    describe("when the campaign was funded", function () {
      beforeEach(async () => {
          await contract.contribute({value: ethers.utils.parseEther('20')})
      });      

      it("increases vote count and marks the contributor as voted", async () => {
        let request = await contract.requests(0)
        expect(request.votersCount).to.eq(0)
        expect(await contract.didVote(0, signer.address)).to.eq(false)

        await contract.vote(0);

        request = await contract.requests(0)
        expect(request.votersCount).to.eq(1)
        expect(await contract.didVote(0, signer.address)).to.eq(true)
      });

      it("only allows contributors to vote", async () => {
        expect(contract.connect(otherSigner).vote(0)).to.revertedWith('only contributors')
      });

      it("doesnt allow you to vote twice", async () => {
        expect(contract.vote(0)).to.not.be.reverted;
        expect(contract.vote(0)).to.be.revertedWith('already voted')
      });

      it("doenst allow you to vote if request was already executed", async () => {
        await contract.setVariable('requests', {
          0: {
            executed: true
          }
        })

        expect(contract.vote(0)).to.revertedWith('already been executed')
      });
    });

    describe("when the campaign was not funded", function () {
      it("doesnt allow you to vote", async () => {
        await contract.contribute({value: 1000}); // user is contributor
        expect(contract.vote(0)).to.be.revertedWith('didnt reach its goal')
      });
    });

  });

  describe("makePayment", function () {
    it("transfers eth to the request recipient", async () => {
      // contribute until goal is reached
      await contract.connect(signer).contribute({value: ethers.utils.parseEther('5')})
      await contract.connect(otherSigner).contribute({value: ethers.utils.parseEther('5')})
      await contract.connect(yetAnotherSigner).contribute({value: ethers.utils.parseEther('5')})

      const recipient = (await ethers.getSigners())[3]
      const recipientOldBalance = await ethers.provider.getBalance(recipient.address)

      const requestValue = ethers.utils.parseEther('1.5');
      const tx = await contract.createRequest('Test request', recipient.address, requestValue) as TransactionResponse
      const receipt = await tx.wait()

      const requestId = BigNumber.from(receipt.logs[0].topics[1]) // second value of first emmited event

      await contract.connect(signer).vote(requestId)
      await contract.connect(otherSigner).vote(requestId)

      await contract.makePayment(requestId)
      
      const recipientNewBalance =  await ethers.provider.getBalance(recipient.address)
      expect(recipientNewBalance.sub(recipientOldBalance)).to.eq(requestValue)
    });

    it("is only callable by owner", async () => {
      
    });
  });
});