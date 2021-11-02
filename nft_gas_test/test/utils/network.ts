import { ContractTransaction } from "@ethersproject/contracts";
import { ethers } from "hardhat";

export const takeSnapshot = async (): Promise<number> => {
  const result = await send("evm_snapshot");
  await mineBlock();
  return result;
};

export const restoreSnapshot = async (id: number) => {
  await send("evm_revert", [id]);
  await mineBlock();
};

export const mineBlock = () => {
  return send("evm_mine", []);
};

export const mineBlocks = async (count: number) => {
  for(let i = 0; i<count; i++){
    await mineBlock()
  }
}

export const send = (method: string, params?: Array<any>) => {
  return ethers.provider.send(method, params === undefined ? [] : params);
};

export const waitForTx = async (tx: ContractTransaction) => await tx.wait();

export const advanceTime = async (seconds: number) => {
  await send("evm_increaseTime", [seconds]);
  await mineBlock();
};

export const latestBlock = async () => ethers.provider.getBlockNumber();

export const advanceBlockTo = async (target: number) => {
  const currentBlock = await latestBlock();

  const start = Date.now();
  let notified;
  if (target < currentBlock) throw Error(`Target block #(${target}) is lower than current block #(${currentBlock})`);
  // eslint-disable-next-line no-await-in-loop
  while ((await latestBlock()) < target) {
    if (!notified && Date.now() - start >= 5000) {
      notified = true;
      console.log("advanceBlockTo: Advancing too many blocks is causing this test to be slow.'");
    }
    // eslint-disable-next-line no-await-in-loop
    await advanceTime(0);
  }
};
