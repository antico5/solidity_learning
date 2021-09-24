"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("hardhat-tracer");
require("@atixlabs/hardhat-time-n-mine");
// import "@atixlabs/hardhat-time-n-mine/dist/src/type-extensions";
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
(0, config_1.task)("accounts", "Prints the list of accounts", async (args, hre) => {
    const accounts = await hre.ethers.getSigners();
    for (const account of accounts) {
        console.log(await account.address);
    }
});
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
exports.default = {
    solidity: "0.8.7",
    networks: {
        ropsten: {
            url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
            accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
        },
    },
};
