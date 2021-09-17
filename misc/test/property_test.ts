const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("", function () {
  let contract: Contract;
  let signer: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Property");
    contract = await factory.deploy(100);
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
  });

  it("test", async () => {
    expect(await contract.getPrice()).to.eq(100)
    expect(await contract.location()).to.eq('Street 123')
    expect(await contract.getInt()).to.eq(10)

    await contract.setPrice(99)
    expect(await contract.getPrice()).to.eq(99)


    const tx = await contract.setLocation('New street')
    const receipt = await tx.wait()
    const gasUsed = receipt.gasUsed.toString()
    console.log({gasUsed})
    expect(await contract.location()).to.eq('New street')

    expect(await contract.owner()).to.eq(signer.address)
  });
});