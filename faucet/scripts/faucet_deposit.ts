import { TransactionResponse } from '@ethersproject/abstract-provider';
import { providers, Signer } from 'ethers';
import {ethers} from 'hardhat'

const contractAddress = '0x252ccddA5cb868f5fB69120985b332c11dB15bE7';

async function main() {
  const [account] = await ethers.getSigners();
  
  const tx = await account.sendTransaction({to: contractAddress, value: ethers.utils.parseEther('0.01')})
  console.log('Transaction sent')

  const receipt = await tx.wait() as any
  console.log('Transaction confirmed')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
