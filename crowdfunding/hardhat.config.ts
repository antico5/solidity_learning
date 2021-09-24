import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "hardhat-gas-reporter"
import "hardhat-tracer"
import "@atixlabs/hardhat-time-n-mine"
import "@atixlabs/hardhat-time-n-mine/dist/src/type-extensions";

import dotenv from 'dotenv'
dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: "0.8.7",
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [`0x${process.env.ROPSTEN_PRIVATE_KEY}`],
    },
  },
};
