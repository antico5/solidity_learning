import '@typechain/hardhat'
import '@atixlabs/hardhat-time-n-mine'
import '@atixlabs/hardhat-time-n-mine/dist/src/type-extensions'
import '@nomiclabs/hardhat-waffle'
import dotenv from 'dotenv'
import 'hardhat-gas-reporter'
import 'hardhat-tracer'
import { task } from 'hardhat/config'

dotenv.config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (args, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(await account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  solidity: {
    compilers: [
      {
        version: '0.8.7',
        settings: {
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
      {
        version: '0.6.2',
        settings: {
          outputSelection: {
            '*': {
              '*': ['storageLayout', 'evm.bytecode.opcodes'],
            },
          },
        },
      },
    ],
  },
  networks: {
    ropsten: {
      url: `https://eth-ropsten.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
    },
    rinkeby: {
      url: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY_1, process.env.PRIVATE_KEY_2],
    },
  },
}
