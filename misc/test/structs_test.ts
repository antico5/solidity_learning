const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Academy", function () {
  let contract: Contract;
  let signer: SignerWithAddress;
  let otherSigner: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Academy");
    contract = await factory.deploy(29, 'Armando');
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
    otherSigner = (await ethers.getSigners())[1]
  });

  describe("instructor", function () {
    it("returns the instructor", async () => {
      const instructor = await contract.academyInstructor();
      expect(instructor.age).to.eq(29)
      expect(instructor.name).to.eq('Armando')
      expect(instructor.addr).to.eq(signer.address)
      expect(instructor.specialty).to.eq(0)
    });
  });

  describe("changeInstructor", function () {
    it("changes the instructor", async () => {
      await contract.changeInstructor(30, 'David', otherSigner.address)
      const instructor = await contract.academyInstructor();

      expect(instructor.age).to.eq(30)
      expect(instructor.name).to.eq('David')
      expect(instructor.addr).to.eq(otherSigner.address)
    });
  });
});