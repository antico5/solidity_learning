const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("BytesAndStrings", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("BytesAndStrings");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });

  describe("init", function () {
    it("sets some values for b1 and s1", async () => {
      expect(await contract.s1()).to.eq('a string')
      expect(await contract.b1()).to.eq('0x736f6d65206279746573')
      await contract.addElement()
      expect(await contract.b1()).to.eq('0x736f6d6520627974657399')
    });
  });
});