const { expect } = require("chai");
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { PaymentChannel } from "../typechain";

describe("PaymentChannel", function () {
  let contract: PaymentChannel;
  let payer: SignerWithAddress;
  let receiver: SignerWithAddress;

  beforeEach(async () => {
    payer = (await ethers.getSigners())[0];
    receiver = (await ethers.getSigners())[1];

    // Deploy contact
    contract = await (
      await ethers.getContractFactory("PaymentChannel")
    ).deploy(receiver.address);

    await payer.sendTransaction({ value: 100, to: contract.address });

    await contract.deployed();
  });

  describe("close()", function () {
    it("sends approved amount to the receiver, and the rest back to payer with selfdestruct", async () => {
      const hashFor50wei = await contract.getHash(30);
      const signatureFor50wei = await payer.signMessage(
        ethers.utils.arrayify(hashFor50wei)
      );

      await expect(() =>
        contract.connect(receiver).close(30, signatureFor50wei)
      ).to.changeEtherBalances([receiver, payer], [30, 70]);

      expect(await ethers.provider.getCode(contract.address)).to.equal("0x");
    });
  });
});
