import { Contract, Signer, PayableOverrides } from 'ethers'
import fs from 'fs'
import { ethers } from 'hardhat'
import _ from 'lodash'

const ethernautAddress = '0xD991431D8b033ddCb84dAD257f4821E9d5b38C33'
const ethernautABI = JSON.parse(fs.readFileSync('abis/ethernaut.json').toString())

export const getEthernautContract = (signer: Signer) => {
  return new ethers.Contract(ethernautAddress, ethernautABI, signer as any)
}

export const createLevelInstance = async (
  name: string,
  levelAddress: string,
  signer: Signer,
  overrides: PayableOverrides = {},
): Promise<Contract> => {
  console.log(`Creating level instance for level address ${levelAddress} (${name})`)
  const txResponse = await getEthernautContract(signer).createLevelInstance(levelAddress, overrides)
  console.log('Create level instance Tx ID:', txResponse.hash)

  const txReceipt = await txResponse.wait()
  console.log('Tx mined!')
  const instanceAddress = ethers.utils.hexZeroPad(ethers.utils.hexStripZeros(_.last(txReceipt.logs as any[]).data), 20)
  console.log('Level instance address', instanceAddress)

  return (await ethers.getContractFactory(name, signer)).attach(instanceAddress)
}

export const loadOrCreateLevelInstance = async (
  name: string,
  levelAddress: string,
  signer: Signer,
  overrides: PayableOverrides = {},
): Promise<Contract> => {
  const fileName = `/tmp/address_level_${name}`
  try {
    const instanceAddress = fs.readFileSync(fileName).toString()
    console.log(`Using cached level instance ${name}:${instanceAddress} from ${fileName}`)
    return (await ethers.getContractFactory(name, signer)).attach(instanceAddress)
  } catch (error) {
    const contract = await createLevelInstance(name, levelAddress, signer, overrides)
    fs.writeFileSync(fileName, contract.address)
    return contract
  }
}

export const submitLevelInstance = async (instanceAddress: string, signer: Signer): Promise<boolean> => {
  const submitTx = await getEthernautContract(signer).submitLevelInstance(instanceAddress)
  console.log(`Submitted level instance address ${instanceAddress}. Tx ID: ${submitTx.hash}`)
  const receipt = await submitTx.wait()
  if (receipt.logs.length) {
    console.log('Submission ACCEPTED :)')
    return true
  } else {
    console.log('Submission REJECTED :(')
    return false
  }
}
