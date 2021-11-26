import { Contract, Signer } from 'ethers'
import fs from 'fs'
import { ethers } from 'hardhat'

export const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[],
  signer?: Signer,
): Promise<ContractType> => {
  console.log(`Deploying contract ${contractName} with args ${JSON.stringify(args)}`)
  const contract = (await (await ethers.getContractFactory(contractName, signer)).deploy(...args)) as ContractType
  console.log(`Deployed at address ${contract.address}`)
  return contract
}

export const loadOrDeployContract = async (name: string, args: any[], signer: Signer): Promise<Contract> => {
  const fileName = `/tmp/address_${name}`
  try {
    const instanceAddress = fs.readFileSync(fileName).toString()
    console.log(`Using cached contract instance ${name}:${instanceAddress} from ${fileName}`)
    return (await ethers.getContractFactory(name, signer)).attach(instanceAddress)
  } catch (error) {
    const contract = await deployContract(name, args, signer)
    fs.writeFileSync(fileName, contract.address)
    return contract
  }
}
