import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

describe("TokenVesting", function () {
  let owner;
  let employee;
  let otherUser;

  let token;
  let vesting;

  const ONE_TOKEN = 10n ** 18n;

  beforeEach(async function () {
    [owner, employee, otherUser] =
      await ethers.getSigners();

    // Deploy MockToken
    const MockToken =
      await ethers.getContractFactory("MockToken");

    token = await MockToken.deploy();

    await token.waitForDeployment();

    // Deploy TokenVesting
    const TokenVesting =
      await ethers.getContractFactory("TokenVesting");

    vesting = await TokenVesting.deploy(
      await token.getAddress()
    );

    await vesting.waitForDeployment();

    // Give the vesting contract owner enough tokens
    await token.transfer(
      owner.address,
      500_000n * ONE_TOKEN
    );

    // Approve vesting contract to pull tokens
    await token.approve(
      await vesting.getAddress(),
      500_000n * ONE_TOKEN
    );
  });

  // --------------------------------------------------
  // Deployment
  // --------------------------------------------------

  it("should deploy the token correctly", async function () {
    assert.equal(
      await token.name(),
      "TokenVest USD"
    );

    assert.equal(
      await token.symbol(),
      "TVUSD"
    );
  });

  // --------------------------------------------------
  // Vesting Creation
  // --------------------------------------------------

  it("should create a vesting schedule", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp) + 60n;

    const cliff =
      60n * 60n * 24n * 30n;

    const duration =
      60n * 60n * 24n * 180n;

    const amount =
      120_000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      cliff,
      duration
    );

    const schedule =
      await vesting.schedules(0);

    assert.equal(
      schedule.beneficiary,
      employee.address
    );

    assert.equal(
      schedule.totalAmount,
      amount
    );

    assert.equal(
      schedule.claimed,
      0n
    );

    assert.equal(
      schedule.revoked,
      false
    );
  });

  it("should reject an invalid beneficiary", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp) + 60n;

    await assert.rejects(
      vesting.createVesting(
        ethers.ZeroAddress,
        100n * ONE_TOKEN,
        start,
        0n,
        1000n
      )
    );
  });

  it("should reject a zero amount", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp) + 60n;

    await assert.rejects(
      vesting.createVesting(
        employee.address,
        0n,
        start,
        0n,
        1000n
      )
    );
  });

  it("should reject a cliff longer than duration", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp) + 60n;

    await assert.rejects(
      vesting.createVesting(
        employee.address,
        100n * ONE_TOKEN,
        start,
        2000n,
        1000n
      )
    );
  });

  it("should reject non-owner schedule creation", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp) + 60n;

    await assert.rejects(
      vesting
        .connect(otherUser)
        .createVesting(
          employee.address,
          100n * ONE_TOKEN,
          start,
          0n,
          1000n
        )
    );
  });

  // --------------------------------------------------
  // Vesting Calculation
  // --------------------------------------------------

  it("should return zero vested tokens before the cliff", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const cliff = 1000n;

    const duration = 10_000n;

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      cliff,
      duration
    );

    const vested =
      await vesting.vestedAmount(0);

    assert.equal(
      vested,
      0n
    );
  });

  it("should calculate vested tokens linearly", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const duration = 1000n;

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      duration
    );

    // Move blockchain time forward by 500 seconds
    await ethers.provider.send(
      "evm_increaseTime",
      [500]
    );

    await ethers.provider.send(
      "evm_mine",
      []
    );

    const vested =
      await vesting.vestedAmount(0);

    // Approximately 50%
    assert.equal(
      vested >= 499n * ONE_TOKEN,
      true
    );

    assert.equal(
      vested <= 501n * ONE_TOKEN,
      true
    );
  });

  it("should fully vest after the duration", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      1000n
    );

    await ethers.provider.send(
      "evm_increaseTime",
      [1001]
    );

    await ethers.provider.send(
      "evm_mine",
      []
    );

    const vested =
      await vesting.vestedAmount(0);

    assert.equal(
      vested,
      amount
    );
  });

  // --------------------------------------------------
  // Claims
  // --------------------------------------------------

  it("should allow the beneficiary to claim vested tokens", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const duration = 1000n;

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      duration
    );

    await ethers.provider.send(
      "evm_increaseTime",
      [500]
    );

    await ethers.provider.send(
      "evm_mine",
      []
    );

    const balanceBefore =
      await token.balanceOf(
        employee.address
      );

    await vesting
      .connect(employee)
      .claim(0);

    const balanceAfter =
      await token.balanceOf(
        employee.address
      );

    assert.equal(
      balanceAfter > balanceBefore,
      true
    );
  });

  it("should reject a claim from a non-beneficiary", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    await vesting.createVesting(
      employee.address,
      1000n * ONE_TOKEN,
      start,
      0n,
      1000n
    );

    await assert.rejects(
      vesting
        .connect(otherUser)
        .claim(0)
    );
  });

  it("should reject claiming when nothing is vested", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    await vesting.createVesting(
      employee.address,
      1000n * ONE_TOKEN,
      start,
      1000n,
      2000n
    );

    await assert.rejects(
      vesting
        .connect(employee)
        .claim(0)
    );
  });

  // --------------------------------------------------
  // Revocation
  // --------------------------------------------------

  it("should allow the owner to revoke a vesting schedule", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      1000n
    );

    await vesting.revoke(0);

    const schedule =
      await vesting.schedules(0);

    assert.equal(
      schedule.revoked,
      true
    );
  });

  it("should preserve vested tokens after revocation", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      1000n
    );

    // Move halfway through the vesting period
    await ethers.provider.send(
      "evm_increaseTime",
      [500]
    );

    await ethers.provider.send(
      "evm_mine",
      []
    );

    await vesting.revoke(0);

    const schedule =
      await vesting.schedules(0);

    assert.equal(
      schedule.revoked,
      true
    );

    assert.equal(
      schedule.vestedAtRevocation > 0n,
      true
    );

    const claimable =
      await vesting.claimableAmount(0);

    assert.equal(
      claimable > 0n,
      true
    );
  });

  it("should return unvested tokens to the owner when revoked", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const amount =
      1000n * ONE_TOKEN;

    const ownerBefore =
      await token.balanceOf(
        owner.address
      );

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      1000n
    );

    await vesting.revoke(0);

    const ownerAfter =
      await token.balanceOf(
        owner.address
      );

    assert.equal(
      ownerAfter > ownerBefore - amount,
      true
    );
  });

  it("should reject revoking an already revoked schedule", async function () {
    const block =
      await ethers.provider.getBlock("latest");

    const start =
      BigInt(block.timestamp);

    const amount =
      1000n * ONE_TOKEN;

    await vesting.createVesting(
      employee.address,
      amount,
      start,
      0n,
      1000n
    );

    await vesting.revoke(0);

    await assert.rejects(
      vesting.revoke(0)
    );
  });
});