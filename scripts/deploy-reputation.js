const hre = require("hardhat");

async function main() {
  const signers = await hre.ethers.getSigners();
  if (!signers.length) {
    throw new Error("No signers found. Check your PRIVATE_KEY in the .env file.");
  }
  const deployer = signers[0];
  console.log("Deploying from:", deployer.address);

  // Get the contract factory
  const ReputationContract = await hre.ethers.getContractFactory("ReputationContract", deployer);

  // Deploy the contract
  const reputationContract = await ReputationContract.deploy();
  await reputationContract.waitForDeployment();

  const address = await reputationContract.getAddress();
  console.log("ReputationContract deployed to:", address);
  console.log("Deployment completed!");
  console.log("Contract Address:", address);
  console.log("Network:", (await hre.ethers.provider.getNetwork()).name);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 