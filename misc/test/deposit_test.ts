const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Deposit", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Deposit");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });
  describe("", function () {
    it("", async () => {
      const tx = await signer.sendTransaction({to: contract.address, value: 1000})
      console.log('gas limit', tx.gasLimit.toString())
      const rec = await tx.wait()
      console.log(rec)
      console.log('gas used', rec.gasUsed.toString())
    });
  });
});