"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const { expect } = require("chai");
const hardhat_1 = __importStar(require("hardhat"));
describe("CrowdFunding", function () {
    let contract;
    let signer;
    beforeEach(async () => {
        // Deploy contact
        const factory = await hardhat_1.ethers.getContractFactory("CrowdFunding");
        contract = await factory.deploy(hardhat_1.ethers.utils.parseEther('10'), 600);
        await contract.deployed();
        // Store signer
        signer = (await hardhat_1.ethers.getSigners())[0];
    });
    describe("contribute", function () {
        it("adds to the contract balance and raised amount", async () => {
            const balance = await hardhat_1.ethers.provider.getBalance(contract.address);
            const raisedAmount = await contract.raisedAmount();
            await contract.contribute({ value: hardhat_1.ethers.utils.parseEther('1') });
            await signer.sendTransaction({ to: contract.address, value: hardhat_1.ethers.utils.parseEther('1') });
            const newBalance = await hardhat_1.ethers.provider.getBalance(contract.address);
            const newRaisedAmount = await contract.raisedAmount();
            expect(newBalance.sub(balance)).to.eq(hardhat_1.ethers.utils.parseEther('2'));
            expect(newRaisedAmount.sub(raisedAmount)).to.eq(hardhat_1.ethers.utils.parseEther('2'));
        });
        it("rejects if deadline is over", async () => {
            // const hrep = hre as any;
            await hardhat_1.default.timeAndMine.increaseTime("601");
            expect(contract.contribute({ value: 100000 })).to.revertedWith('already finished');
        });
    });
});
