const { expect } = require("chai");
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { BigNumber, Contract } from 'ethers';
import hre, {ethers} from 'hardhat'

describe("Lottery", function () {
  let contract: Contract;
  let signer: SignerWithAddress;
  let otherSigner: SignerWithAddress;

  beforeEach(async () => {
    // Deploy contact
    const factory = await ethers.getContractFactory("Lottery");
    contract = await factory.deploy();
    await contract.deployed();

    // Store signer
    signer = (await ethers.getSigners())[0]
    otherSigner = (await ethers.getSigners())[1]
  });

  describe("participate", async function () {
    it("adds to the contract balance", async () => {
      await contract.participate({value: ethers.utils.parseEther('0.1')})
      await contract.participate({value: ethers.utils.parseEther('0.1')})
      expect(await ethers.provider.getBalance(contract.address)).to.eq(ethers.utils.parseEther('0.2'))
    });

    it("requires 0.1 eth to participate", async () => {
      expect(contract.participate({value: 123})).to.revertedWith('0.1 eth')
    });

    it("adds the participant to the array", async () => {
      await contract.participate({value: ethers.utils.parseEther('0.1')})
      expect(await contract.participants(0)).to.eq(signer.address)
      
      const contract2 = contract.connect(otherSigner)
      await contract2.participate({value: ethers.utils.parseEther('0.1')})
      expect(await contract.participants(1)).to.eq(otherSigner.address)
    });
  });

  describe("execute", function () {
    describe("when there are enough participants", function () {
      let participant1: SignerWithAddress
      let participant2: SignerWithAddress
      const balancesBeforeExecute: {[address: string]: BigNumber} = {}
  
      beforeEach(async () => {
        // Participants
        participant1 = (await ethers.getSigners())[1]
        participant2 = (await ethers.getSigners())[2]
  
        await contract.connect(participant1).participate({value: ethers.utils.parseEther('0.1')})
        await contract.connect(participant2).participate({value: ethers.utils.parseEther('0.1')})
  
        balancesBeforeExecute[participant1.address] = await ethers.provider.getBalance(participant1.address)
        balancesBeforeExecute[participant2.address] = await ethers.provider.getBalance(participant2.address)
      });
  
      it("requires owner to run it", async () => {
        const newContract = contract.connect(otherSigner);
        expect(newContract.execute()).to.revertedWith('is not the owner')
      });
  
      it("picks a random participant and transfers the prize pool", async () => {
        expect(await contract.participantsCount()).to.eq(2)
        await contract.execute()
        expect(await contract.participantsCount()).to.eq(0)
        const winnerAddress = await contract.lastWinner()
  
        const oldBalance = balancesBeforeExecute[winnerAddress]
        const newBalance = await ethers.provider.getBalance(winnerAddress)
  
  
        expect(newBalance.sub(oldBalance)).to.eq(ethers.utils.parseEther('0.2'))
      });
    });

    describe("when there are not enough participants", function () {
      it("reverts with an error", async () => {
        const minParticipants = await contract.minParticipants()
        for (let i = 0; i < minParticipants - 1; i++) {
          await contract.participate({value: ethers.utils.parseEther('0.1')});
        }

        expect(contract.execute()).to.revertedWith('need more participants')
      });
    });
  });
});