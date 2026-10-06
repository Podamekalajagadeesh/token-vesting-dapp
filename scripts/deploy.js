import hre from "hardhat";

const { ethers } = await hre.network.connect();

async function main() {
  console.log("🚀 Deploying TokenVest contracts...\n");

  // Deploy MockToken
  const MockToken = await ethers.getContractFactory("MockToken");
  const token = await MockToken.deploy();
  await token.waitForDeployment();

  const tokenAddress = await token.getAddress();

  console.log("✅ MockToken deployed:");
  console.log(tokenAddress);

  // Deploy TokenVesting
  const TokenVesting =
    await ethers.getContractFactory("TokenVesting");

  const vesting = await TokenVesting.deploy(tokenAddress);
  await vesting.waitForDeployment();

  const vestingAddress = await vesting.getAddress();

  console.log("\n✅ TokenVesting deployed:");
  console.log(vestingAddress);

  console.log("\n📋 Deployment Summary");
  console.log("------------------------------");
  console.log("MockToken:   ", tokenAddress);
  console.log("TokenVesting:", vestingAddress);
  console.log("------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});