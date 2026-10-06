import { useEffect, useState } from "react";
import { ethers } from "ethers";

import {
  getProvider,
  getVestingContract,
  getTokenContract,
} from "./utils/contract";

const SEPOLIA_CHAIN_ID = "11155111";

function App() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");

  // Employee dashboard
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);

  // Admin dashboard
  const [isOwner, setIsOwner] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0n);
  const [allowance, setAllowance] = useState(0n);

  const [beneficiary, setBeneficiary] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [cliffDays, setCliffDays] = useState("0");
  const [durationDays, setDurationDays] = useState("30");

  const [approving, setApproving] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  // --------------------------------------------------
  // CONNECT WALLET
  // --------------------------------------------------

  async function connectWallet() {
    try {
      setError("");

      const provider = await getProvider();

      const accounts = await provider.send(
        "eth_requestAccounts",
        []
      );

      const networkInfo = await provider.getNetwork();

      const chainId = networkInfo.chainId.toString();

      if (chainId !== SEPOLIA_CHAIN_ID) {
        throw new Error(
          "Please switch MetaMask to the Sepolia network."
        );
      }

      const walletAddress = accounts[0];

      setAccount(walletAddress);
      setNetwork(chainId);

      await loadVesting(walletAddress);
      await loadAdminData(walletAddress);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Failed to connect wallet."
      );
    }
  }

  // --------------------------------------------------
  // LOAD EMPLOYEE VESTING
  // --------------------------------------------------

  async function loadVesting(walletAddress) {
    try {
      setLoading(true);
      setError("");

      const contract = await getVestingContract();

      const nextScheduleId =
        await contract.nextScheduleId();

      let foundSchedule = null;

      for (
        let i = 0n;
        i < nextScheduleId;
        i++
      ) {
        const data =
          await contract.schedules(i);

        if (
          data.beneficiary.toLowerCase() ===
          walletAddress.toLowerCase()
        ) {
          const vested =
            await contract.vestedAmount(i);

          const claimable =
            await contract.claimableAmount(i);

          foundSchedule = {
            id: i.toString(),
            beneficiary: data.beneficiary,
            totalAmount: data.totalAmount,
            start: data.start,
            cliff: data.cliff,
            duration: data.duration,
            claimed: data.claimed,
            vestedAtRevocation:
              data.vestedAtRevocation,
            revoked: data.revoked,
            vested,
            claimable,
          };

          break;
        }
      }

      setSchedule(foundSchedule);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to load vesting data from the blockchain."
      );
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // LOAD ADMIN DATA
  // --------------------------------------------------

  async function loadAdminData(walletAddress) {
    try {
      const vestingContract =
        await getVestingContract();

      const tokenContract =
        await getTokenContract();

      const owner =
        await vestingContract.owner();

      const ownerStatus =
        owner.toLowerCase() ===
        walletAddress.toLowerCase();

      setIsOwner(ownerStatus);

      if (!ownerStatus) {
        setTokenBalance(0n);
        setAllowance(0n);
        return;
      }

      const balance =
        await tokenContract.balanceOf(
          walletAddress
        );

      const vestingAddress =
        await vestingContract.getAddress();

      const currentAllowance =
        await tokenContract.allowance(
          walletAddress,
          vestingAddress
        );

      setTokenBalance(balance);
      setAllowance(currentAllowance);
    } catch (err) {
      console.error(
        "Unable to load admin data:",
        err
      );

      setIsOwner(false);
    }
  }

  // --------------------------------------------------
  // GET VESTING CONTRACT ADDRESS
  // --------------------------------------------------

  async function getVestingContractAddress() {
    const contract =
      await getVestingContract();

    return contract.getAddress();
  }

  // --------------------------------------------------
  // CLAIM TOKENS
  // --------------------------------------------------

  async function claimTokens() {
    if (!schedule) return;

    try {
      setClaiming(true);
      setError("");

      const contract =
        await getVestingContract();

      const tx =
        await contract.claim(
          schedule.id
        );

      await tx.wait();

      await loadVesting(account);
    } catch (err) {
      console.error(err);

      if (
        err.code === "ACTION_REJECTED"
      ) {
        setError(
          "Transaction rejected in MetaMask."
        );
      } else {
        setError(
          err.reason ||
            err.shortMessage ||
            err.message ||
            "Claim transaction failed."
        );
      }
    } finally {
      setClaiming(false);
    }
  }

  // --------------------------------------------------
  // APPROVE TVUSD
  // --------------------------------------------------

  async function approveTokens() {
    try {
      setError("");

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        throw new Error(
          "Enter a valid TVUSD amount."
        );
      }

      const tokenContract =
        await getTokenContract();

      const amountWei =
        ethers.parseUnits(
          amount,
          18
        );

      const vestingAddress =
        await getVestingContractAddress();

      setApproving(true);

      const tx =
        await tokenContract.approve(
          vestingAddress,
          amountWei
        );

      await tx.wait();

      await loadAdminData(account);
    } catch (err) {
      console.error(err);

      if (
        err.code === "ACTION_REJECTED"
      ) {
        setError(
          "Transaction rejected in MetaMask."
        );
      } else {
        setError(
          err.reason ||
            err.shortMessage ||
            err.message ||
            "Token approval failed."
        );
      }
    } finally {
      setApproving(false);
    }
  }

  // --------------------------------------------------
  // CREATE VESTING
  // --------------------------------------------------

  async function createVesting() {
    try {
      setError("");

      if (
        !ethers.isAddress(
          beneficiary
        )
      ) {
        throw new Error(
          "Enter a valid beneficiary wallet address."
        );
      }

      if (
        !amount ||
        Number(amount) <= 0
      ) {
        throw new Error(
          "Enter a valid TVUSD amount."
        );
      }

      if (!startDate) {
        throw new Error(
          "Select a start date."
        );
      }

      const totalAmount =
        ethers.parseUnits(
          amount,
          18
        );

      const startTimestamp =
        Math.floor(
          new Date(
            startDate
          ).getTime() / 1000
        );

      if (
        !Number.isFinite(
          startTimestamp
        )
      ) {
        throw new Error(
          "Invalid start date."
        );
      }

      const cliffDuration =
        Number(cliffDays) *
        24 *
        60 *
        60;

      const duration =
        Number(durationDays) *
        24 *
        60 *
        60;

      if (
        !Number.isFinite(
          cliffDuration
        ) ||
        cliffDuration < 0
      ) {
        throw new Error(
          "Invalid cliff duration."
        );
      }

      if (
        !Number.isFinite(
          duration
        ) ||
        duration <= 0
      ) {
        throw new Error(
          "Duration must be greater than zero."
        );
      }

      if (
        cliffDuration > duration
      ) {
        throw new Error(
          "Cliff cannot exceed vesting duration."
        );
      }

      const tokenContract =
        await getTokenContract();

      const vestingContract =
        await getVestingContract();

      const vestingAddress =
        await vestingContract.getAddress();

      const currentAllowance =
        await tokenContract.allowance(
          account,
          vestingAddress
        );

      if (
        currentAllowance <
        totalAmount
      ) {
        throw new Error(
          "Insufficient TVUSD allowance. Approve the required amount first."
        );
      }

      setCreating(true);

      const tx =
        await vestingContract.createVesting(
          beneficiary,
          totalAmount,
          startTimestamp,
          cliffDuration,
          duration
        );

      await tx.wait();

      setBeneficiary("");
      setAmount("");
      setStartDate("");
      setCliffDays("0");
      setDurationDays("30");

      await loadAdminData(account);

      alert(
        "Vesting schedule created successfully."
      );
    } catch (err) {
      console.error(err);

      if (
        err.code === "ACTION_REJECTED"
      ) {
        setError(
          "Transaction rejected in MetaMask."
        );
      } else {
        setError(
          err.reason ||
            err.shortMessage ||
            err.message ||
            "Failed to create vesting schedule."
        );
      }
    } finally {
      setCreating(false);
    }
  }

  // --------------------------------------------------
  // WALLET / NETWORK LISTENERS
  // --------------------------------------------------

  useEffect(() => {
    if (!window.ethereum) return;

    function handleAccountsChanged(
      accounts
    ) {
      if (!accounts.length) {
        setAccount("");
        setSchedule(null);
        setIsOwner(false);
        setTokenBalance(0n);
        setAllowance(0n);
        return;
      }

      setAccount(accounts[0]);

      loadVesting(accounts[0]);
      loadAdminData(accounts[0]);
    }

    function handleChainChanged() {
      window.location.reload();
    }

    window.ethereum.on(
      "accountsChanged",
      handleAccountsChanged
    );

    window.ethereum.on(
      "chainChanged",
      handleChainChanged
    );

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );

      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, []);

  // --------------------------------------------------
  // FORMATTING
  // --------------------------------------------------

  const total =
    schedule?.totalAmount || 0n;

  const vested =
    schedule?.vested || 0n;

  const claimable =
    schedule?.claimable || 0n;

  const claimed =
    schedule?.claimed || 0n;

  const progress =
    total > 0n
      ? Math.min(
          100,
          Number(
            (vested * 10000n) /
              total
          ) / 100
        )
      : 0;

  function formatToken(amount) {
    return Number(
      ethers.formatUnits(
        amount || 0n,
        18
      )
    ).toLocaleString(
      undefined,
      {
        maximumFractionDigits: 2,
      }
    );
  }

  function formatDate(timestamp) {
    if (!timestamp) return "-";

    return new Date(
      Number(timestamp) * 1000
    ).toLocaleString();
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="app">

      {/* NAVBAR */}

      <header className="navbar">

        <div className="logo">
          Token<span>Vest</span>
        </div>

        <button
          className="connect-btn"
          onClick={connectWallet}
        >
          {account
            ? `${account.slice(
                0,
                6
              )}...${account.slice(-4)}`
            : "Connect Wallet"}
        </button>

      </header>

      <main className="container">

        {/* ------------------------------------------------ */}
        {/* DISCONNECTED */}
        {/* ------------------------------------------------ */}

        {!account ? (
          <section className="hero">

            <div>

              <p className="eyebrow">
                DECENTRALIZED TOKEN VESTING
              </p>

              <h1>
                Manage token
                <br />
                <span>
                  vesting securely.
                </span>
              </h1>

              <p className="subtitle">
                Create, track and claim
                ERC-20 token allocations
                according to transparent
                on-chain vesting schedules.
              </p>

              <button
                className="primary-btn"
                onClick={
                  connectWallet
                }
              >
                Connect Wallet
              </button>

            </div>

            <div className="hero-card">

              <div className="card-header">
                <span>
                  TokenVest
                </span>

                <span>
                  Sepolia
                </span>
              </div>

              <div className="stats">

                <div>
                  <small>
                    Network
                  </small>

                  <strong>
                    Ethereum Sepolia
                  </strong>
                </div>

                <div>
                  <small>
                    Asset
                  </small>

                  <strong>
                    TVUSD
                  </strong>
                </div>

              </div>

            </div>

          </section>

        ) : (

          <>

            {/* ------------------------------------------------ */}
            {/* EMPLOYEE DASHBOARD */}
            {/* ------------------------------------------------ */}

            <section className="hero">

              <div>

                <p className="eyebrow">
                  DECENTRALIZED TOKEN
                  VESTING
                </p>

                <h1>
                  Your token
                  <br />
                  <span>
                    vesting dashboard.
                  </span>
                </h1>

                <p className="subtitle">
                  Track your allocation,
                  monitor unlocked tokens
                  and claim your vested
                  TVUSD directly from the
                  Ethereum Sepolia
                  blockchain.
                </p>

                <div className="wallet-status">
                  Connected • Chain{" "}
                  {network}
                </div>

              </div>

              <div className="hero-card">

                <div className="card-header">

                  <span>
                    Vesting Progress
                  </span>

                  <span>
                    {progress.toFixed(
                      1
                    )}
                    %
                  </span>

                </div>

                <div className="progress">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${progress}%`,
                    }}
                  />

                </div>

                <div className="stats">

                  <div>

                    <small>
                      Allocated
                    </small>

                    <strong>
                      {formatToken(
                        total
                      )}{" "}
                      TVUSD
                    </strong>

                  </div>

                  <div>

                    <small>
                      Claimable
                    </small>

                    <strong>
                      {formatToken(
                        claimable
                      )}{" "}
                      TVUSD
                    </strong>

                  </div>

                </div>

              </div>

            </section>

            {/* ERROR */}

            {error && (
              <div className="error-box">
                {error}
              </div>
            )}

            {/* LOADING */}

            {loading ? (

              <section className="dashboard-card">

                <h2>
                  Loading vesting
                  data...
                </h2>

                <p>
                  Reading your vesting
                  schedule from
                  Ethereum Sepolia.
                </p>

              </section>

            ) : schedule ? (

              <>

                {/* EMPLOYEE STATS */}

                <section className="dashboard-grid">

                  <div className="dashboard-card">

                    <small>
                      Total Allocation
                    </small>

                    <h2>
                      {formatToken(
                        total
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                  <div className="dashboard-card">

                    <small>
                      Vested
                    </small>

                    <h2>
                      {formatToken(
                        vested
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                  <div className="dashboard-card">

                    <small>
                      Claimed
                    </small>

                    <h2>
                      {formatToken(
                        claimed
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                  <div className="dashboard-card">

                    <small>
                      Claimable
                    </small>

                    <h2>
                      {formatToken(
                        claimable
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                </section>

                {/* SCHEDULE */}

                <section className="dashboard-card schedule-card">

                  <div className="card-header">

                    <h2>
                      Vesting Schedule
                    </h2>

                    {schedule.revoked && (
                      <span className="status revoked">
                        Revoked
                      </span>
                    )}

                  </div>

                  <div className="schedule-grid">

                    <div>

                      <small>
                        Schedule ID
                      </small>

                      <strong>
                        #{schedule.id}
                      </strong>

                    </div>

                    <div>

                      <small>
                        Start
                      </small>

                      <strong>
                        {formatDate(
                          schedule.start
                        )}
                      </strong>

                    </div>

                    <div>

                      <small>
                        Cliff
                      </small>

                      <strong>
                        {formatDate(
                          schedule.cliff
                        )}
                      </strong>

                    </div>

                    <div>

                      <small>
                        Duration
                      </small>

                      <strong>
                        {Number(
                          schedule.duration
                        ) /
                          86400}{" "}
                        days
                      </strong>

                    </div>

                  </div>

                  <div className="claim-section">

                    <div>

                      <small>
                        Available to
                        claim
                      </small>

                      <h2>
                        {formatToken(
                          claimable
                        )}{" "}
                        TVUSD
                      </h2>

                    </div>

                    <button
                      className="primary-btn"
                      onClick={
                        claimTokens
                      }
                      disabled={
                        claiming ||
                        claimable ===
                          0n ||
                        schedule.revoked
                      }
                    >
                      {claiming
                        ? "Confirming..."
                        : claimable >
                          0n &&
                          !schedule.revoked
                        ? "Claim Tokens"
                        : "Nothing to Claim"}
                    </button>

                  </div>

                </section>

              </>

            ) : (

              <section className="dashboard-card">

                <h2>
                  No vesting schedule
                  found
                </h2>

                <p>
                  There is currently
                  no vesting allocation
                  assigned to this
                  wallet.
                </p>

              </section>

            )}

            {/* ------------------------------------------------ */}
            {/* ADMIN DASHBOARD */}
            {/* ------------------------------------------------ */}

            {isOwner && (

              <section className="admin-section">

                <div className="admin-header">

                  <div>

                    <p className="eyebrow">
                      EMPLOYER / ADMIN
                    </p>

                    <h2>
                      TokenVest
                      Administration
                    </h2>

                    <p>
                      Fund and create
                      on-chain token
                      vesting allocations
                      for employees and
                      contributors.
                    </p>

                  </div>

                </div>

                {/* ADMIN BALANCES */}

                <section className="dashboard-grid">

                  <div className="dashboard-card">

                    <small>
                      TVUSD Balance
                    </small>

                    <h2>
                      {formatToken(
                        tokenBalance
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                  <div className="dashboard-card">

                    <small>
                      Approved Allowance
                    </small>

                    <h2>
                      {formatToken(
                        allowance
                      )}{" "}
                      TVUSD
                    </h2>

                  </div>

                </section>

                {/* APPROVAL */}

                <section className="dashboard-card">

                  <div className="card-header">

                    <h2>
                      Fund Vesting
                      Contract
                    </h2>

                    <span className="status">
                      Admin
                    </span>

                  </div>

                  <p>
                    Approve TokenVest
                    to transfer TVUSD
                    from your wallet
                    when creating a
                    vesting schedule.
                  </p>

                  <div className="form-group">

                    <label>
                      Approval Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      placeholder="1000"
                      value={amount}
                      onChange={(e) =>
                        setAmount(
                          e.target.value
                        )
                      }
                    />

                  </div>

                  <button
                    className="primary-btn"
                    onClick={
                      approveTokens
                    }
                    disabled={
                      approving ||
                      !amount ||
                      Number(amount) <=
                        0
                    }
                  >
                    {approving
                      ? "Approving..."
                      : `Approve ${
                          amount ||
                          "0"
                        } TVUSD`}
                  </button>

                </section>

                {/* CREATE VESTING */}

                <section className="dashboard-card">

                  <div className="card-header">

                    <h2>
                      Create Vesting
                      Schedule
                    </h2>

                  </div>

                  <div className="form-grid">

                    <div className="form-group">

                      <label>
                        Beneficiary
                        Address
                      </label>

                      <input
                        type="text"
                        placeholder="0x..."
                        value={
                          beneficiary
                        }
                        onChange={(e) =>
                          setBeneficiary(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Amount
                        (TVUSD)
                      </label>

                      <input
                        type="number"
                        min="0"
                        placeholder="1000"
                        value={amount}
                        onChange={(e) =>
                          setAmount(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Start Date
                      </label>

                      <input
                        type="datetime-local"
                        value={
                          startDate
                        }
                        onChange={(e) =>
                          setStartDate(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Cliff
                        (days)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          cliffDays
                        }
                        onChange={(e) =>
                          setCliffDays(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                    <div className="form-group">

                      <label>
                        Duration
                        (days)
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          durationDays
                        }
                        onChange={(e) =>
                          setDurationDays(
                            e.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>

                  <button
                    className="primary-btn"
                    onClick={
                      createVesting
                    }
                    disabled={
                      creating
                    }
                  >
                    {creating
                      ? "Creating Vesting..."
                      : "Create Vesting Schedule"}
                  </button>

                </section>

              </section>

            )}

            {/* ------------------------------------------------ */}
            {/* FEATURES */}
            {/* ------------------------------------------------ */}

            <section className="features">

              <div className="feature-card">

                <h3>
                  🔐 Secure
                </h3>

                <p>
                  Smart-contract
                  controlled token
                  distribution with
                  access restrictions.
                </p>

              </div>

              <div className="feature-card">

                <h3>
                  ⏱ Linear Vesting
                </h3>

                <p>
                  Tokens unlock
                  progressively
                  according to the
                  configured vesting
                  schedule.
                </p>

              </div>

              <div className="feature-card">

                <h3>
                  🌐 On-chain
                </h3>

                <p>
                  Vesting schedules
                  and claims are
                  recorded
                  transparently on
                  Ethereum.
                </p>

              </div>

            </section>

          </>

        )}

      </main>

    </div>
  );
}

export default App;