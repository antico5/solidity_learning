const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("BooleanInteger", function () {
   let contract: Contract;
   let signer: SignerWithAddress;

   beforeEach(async () => {
      // Deploy contact
      const factory = await ethers.getContractFactory("BooleanInteger");
      contract = await factory.deploy();
      await contract.deployed();

      // Store signer
      signer = (await ethers.getSigners())[0]
   });

   describe("increase", function () {
     it("overflows", async () => {
       expect(contract.increase()).to.revertedWith('overflow')
     });
   });
});
