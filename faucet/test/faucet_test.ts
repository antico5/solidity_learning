const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Faucet", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Faucet");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]

    // Fund the contract
    const depositTx = await signer.sendTransaction({
      to: contract.address,
      value: ethers.utils.parseEther("1"),
    });
    await depositTx.wait();
  });

  it("Should store owner as the contact deployer", async () => {
    const owner = await contract.owner();
    expect(owner).to.equal(signer.address);
  });

  describe("Depositing ether in the faucet", async () => {
    const depositAmt = ethers.utils.parseEther('0.123');

    const doDeposit = async () => {
      const depositTx = await signer.sendTransaction({
        to: contract.address,
        value: depositAmt,
      });
      return depositTx.wait();
    }

    it("receives ether deposits", async function () {
      let oldBalance = await ethers.provider.getBalance(contract.address);

      await doDeposit()
  
      const balance = await ethers.provider.getBalance(contract.address);
      expect(balance).to.equal(oldBalance.add(depositAmt));
    });

    it("fires a Deposit event", async function () {
      let depositAmt = ethers.utils.parseEther('0.123');
  
      await doDeposit()

  
      const depositEvents =  await contract.queryFilter(contract.filters.Deposit())
      expect(
        depositEvents.some(e => e.args?.from == signer.address && e.args?.amount.eq(depositAmt))
      ).to.be.ok
    });
  })

  describe("Withdrawing ether from the faucet", async () => {
    const validAmount = ethers.utils.parseEther("0.1")
    const invalidAmount = ethers.utils.parseEther("0.1").add(1)

    it("allows to withdraw up to 0.1 eth", async () => {
      const signerOldBalance = await ethers.provider.getBalance(signer.address);
      const contractOldBalance = await ethers.provider.getBalance(contract.address);
  
      const withdrawTx = await contract.withdraw(validAmount)
      const receipt = await withdrawTx.wait()
  
      const signerNewBalance = await ethers.provider.getBalance(signer.address);
      const contractNewBalance = await ethers.provider.getBalance(contract.address);
  
      expect(contractNewBalance).to.equal(contractOldBalance.sub(validAmount))
      expect(signerNewBalance).to.equal(signerOldBalance.add(validAmount).sub(withdrawTx.gasPrice.mul(receipt.gasUsed)))
  
      const withdrawalEvents =  await contract.queryFilter(contract.filters.Withdrawal())
      expect(
        withdrawalEvents.some(e => e.args?.to == signer.address && e.args?.amount.eq(validAmount))
      ).to.be.ok
  
      try {
        const secondWithdrawTx = await contract.withdraw(invalidAmount)
        await secondWithdrawTx.wait()
      } catch (error) {
        expect(error).to.match(/can only withdraw less than 0.1/)
      }
    });

    it("doesn't allow to withdraw more than 0.1 eth", async () => {
      try {
        const withdrawTx = await contract.withdraw(invalidAmount)
        await withdrawTx.wait()
      } catch (error) {
        expect(error).to.match(/can only withdraw less than 0.1/)
      }
    });

    it("fires a Withdrawal event", async () => {
      const withdrawTx = await contract.withdraw(validAmount)
      const receipt = await withdrawTx.wait()
  
      const withdrawalEvents =  await contract.queryFilter(contract.filters.Withdrawal())
      expect(
        withdrawalEvents.some(e => e.args?.to == signer.address && e.args?.amount.eq(validAmount))
      ).to.be.ok
    });
  })

  describe("Destroying the contract", async () => {
    it("owner can destroy the contract", async () => {
      const killTx = await contract.kill()
      const receipt = await killTx.wait()
      expect(receipt).to.be.ok
    })

    it("non owners cant destroy the contract", async () => {
      const nonOwner = (await ethers.getSigners())[1]
      contract = contract.connect(nonOwner)
      try {
        const killTx = await contract.kill()
        await killTx.wait()
      } catch (error) {
        expect(error).to.match(/Only owner can perform this action/)      
      }
    })
  })
});
