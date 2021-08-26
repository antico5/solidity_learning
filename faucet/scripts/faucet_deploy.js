const hre = require("hardhat");

async function main() {
  const faucetFactory = await hre.ethers.getContractFactory("Faucet");
  const faucetContract = await faucetFactory.deploy();

  await faucetContract.deployed();

  console.log("Contract deployed to:", faucetContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
