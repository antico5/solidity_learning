const { expect } = require("chai");
import { TransactionRequest, TransactionResponse } from '@ethersproject/abstract-provider';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("CrowdFunding", function () {
  let contract: Contract;
  let signer: SignerWithAddress;
  let otherSigner: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("CrowdFunding");
    contract = await factory.deploy(ethers.utils.parseEther('10'), 600);
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
    otherSigner = (await ethers.getSigners())[1]
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
});