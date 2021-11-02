import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";

describe("NFTest", function () {
  let contract: Contract;
  let signer: SignerWithAddress;
  let otherSigner: SignerWithAddress;

  const merkleProof = [
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  ];

  beforeEach(async () => {
    // Store signer
    signer = (await ethers.getSigners())[0];
    otherSigner = (await ethers.getSigners())[1];

    // Deploy contact
    const factory = await ethers.getContractFactory("NFTest");

    contract = await factory.deploy();
    await contract.deployed();
  });

  describe("mint and transfer", function () {
    it("mint and transfer token", async () => {
      await contract.mint(signer.address, 1234);
      await contract.transfer(signer.address, otherSigner.address, 1234);
    });
  });

  describe("mintWithMerkleProof", function () {
    it("mints a token and accepts a proof", async () => {
      await contract.mintWithMerkleProof(signer.address, 1234, merkleProof);
      await contract.transferWithMerkleProof(
        signer.address,
        otherSigner.address,
        1234,
        merkleProof
      );
    });
  });
});
