import { expect } from "chai";
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
      await depositTx.wait();

      return depositTx;
    }

    it("receives ether deposits", async function () {
      let oldBalance = await ethers.provider.getBalance(contract.address);

      await doDeposit()
  
      const balance = await ethers.provider.getBalance(contract.address);
      expect(balance).to.equal(oldBalance.add(depositAmt));
    });

    it("fires a Deposit event", async function () {
      let depositAmt = ethers.utils.parseEther('0.123');
  
      const depositTx = await doDeposit()

      await expect(depositTx).to.emit(contract, "Deposit")
        .withArgs(signer.address, depositAmt)
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

      await expect(withdrawTx).to.emit(contract, "Withdrawal")
        .withArgs(signer.address, validAmount);

      await expect(contract.withdraw(invalidAmount)).to.revertedWith("can only withdraw less than 0.1")
    });

    it("doesn't allow to withdraw more than 0.1 eth", async () => {
      await expect(contract.withdraw(invalidAmount)).to.revertedWith("can only withdraw less than 0.1")
    });

    it("fires a Withdrawal event", async () => {
      const withdrawTx = await contract.withdraw(validAmount)
      const receipt = await withdrawTx.wait()

      await expect(withdrawTx).to.emit(contract, "Withdrawal")
        .withArgs(signer.address, validAmount);
    });
  })

  describe("Destroying the contract", async () => {
    it("owner can destroy the contract", async () => {
      const killTx = await contract.kill()
      const receipt = await killTx.wait()
      expect(receipt).to.be.ok

      const code = await ethers.provider.getCode(contract.address)

      // check that contract selfdestructed
      expect(code).to.equal("0x")
    })

    it("non owners cant destroy the contract", async () => {
      const nonOwner = (await ethers.getSigners())[1]
      contract = contract.connect(nonOwner)

      await expect(contract.kill()).to.be.revertedWith("Only owner can perform this action")
    })
  })
});
