import { Signer } from 'ethers'
import { ethers } from 'hardhat'
import { MagicNumber } from '../typechain-types'
import { loadOrCreateLevelInstance, submitLevelInstance } from './ethernaut'

const levelAddress = '0x200d3d9Ac7bFd556057224e7aEB4161fED5608D0'

const main = async () => {
  const signer = (await ethers.getSigners())[0] as Signer

  const targetContract = (await loadOrCreateLevelInstance('MagicNumber', levelAddress, signer, {})) as MagicNumber

  const runtimeCode = [
    '0x',
    '60 2a',   // PUSH1 0x2a (42)
    '60 00',   // PUSH1 00 (memory position to store the 42)
    '52',      // MSTORE
    '60 20',   // PUSH1 20 (memory size)
    '60 00',   // PUSH1 00 (memory offset)
    'F3',      // RETURN
  ].join('').replace(/\s+/g,'')

  console.log({runtimeCode})

  const initcode = ethers.utils.hexConcat([
    [
      '0x',
      '60 0a',   // PUSH1 0x0a (code length)
      '80',      // DUP1
      '61 000c', // PUSH2 0x000c (start position of code)
      '60 00',   // PUSH1 0x00
      '39',      // CODECOPY
      '60 00',   // PUSH1 0x00
      'f3',      // RETURN
    ].join('').replace(/\s+/g,''),
    runtimeCode,
  ])

  console.log({initcode})


  const abi = [
    "function whatIsTheMeaningOfLife() pure returns (uint)"
  ];
  const factory = new ethers.ContractFactory(abi, initcode, signer)

  const solver = await factory.deploy()
  console.log(`Solver address: ${solver.address}`)

  const setSolverTx = await targetContract.setSolver(solver.address)
  console.log('set solver tx hash: ', setSolverTx.hash)
  await setSolverTx.wait()

  await submitLevelInstance(targetContract.address, signer)
}

main()
  .then(() => process.exit())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
