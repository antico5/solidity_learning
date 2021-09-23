const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("CrowdFunding", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("CrowdFunding");
    contract = await factory.deploy(ethers.utils.parseEther('10'), 600);
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });

  describe("contribute", function () {
    it("adds to the contract balance and raised amount", async () => {
      const balance = await ethers.provider.getBalance(contract.address);
      const raisedAmount = await contract.raisedAmount();

      await contract.contribute({value: ethers.utils.parseEther('1')})
      await signer.sendTransaction({to: contract.address, value: ethers.utils.parseEther('1')})

      const newBalance = await ethers.provider.getBalance(contract.address);
      const newRaisedAmount = await contract.raisedAmount();

      expect(newBalance.sub(balance)).to.eq(ethers.utils.parseEther('2'))
      expect(newRaisedAmount.sub(raisedAmount)).to.eq(ethers.utils.parseEther('2'))
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
});