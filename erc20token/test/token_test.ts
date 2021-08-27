const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("ArmanToken", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  const totalSupply = 1000

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("ArmanToken");
    contract = await factory.deploy(totalSupply);
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });

  it("Has a total supply", async () => {
    expect(await contract.totalSupply()).to.eq(totalSupply)
  });
});
