# TokenVest

### Decentralized Token Vesting & Salary Management dApp

TokenVest is a blockchain-based token vesting platform that enables employers or organizations to create time-based token allocations for employees and beneficiaries.

The platform supports cliff periods, linear token vesting, beneficiary claims, and owner-controlled vesting revocation. It combines a Solidity smart-contract backend with a React frontend connected through MetaMask and ethers.js.

---

## 🚀 Live Demo

**Frontend:**
https://tokenvest-bice.vercel.app

> The production frontend is deployed on Vercel and connects to the Ethereum Sepolia testnet.

---

## 🔗 Smart Contracts

### Ethereum Sepolia

| Contract          | Address                                      |
| ----------------- | -------------------------------------------- |
| MockToken (TVUSD) | `0xde6bEd4cbD5201228421241C7045Dd8d88B8e2b4` |
| TokenVesting      | `0xa7cD4581F7967D6a19dd405cC8C9B066116669d0` |

### Verified Contract

**TokenVesting on Etherscan:**
https://sepolia.etherscan.io/address/0xa7cD4581F7967D6a19dd405cC8C9B066116669d0#code

The TokenVesting contract has been verified on:

* Etherscan
* Blockscout
* Sourcify

---

## ✨ Features

### Employee / Beneficiary

* Connect Ethereum wallet using MetaMask
* View assigned vesting allocation
* View vesting schedule
* Track vested tokens
* Track claimed tokens
* Track currently claimable tokens
* Claim vested tokens directly from the smart contract
* View vesting progress

### Employer / Administrator

* Create token vesting schedules
* Specify beneficiary address
* Specify token allocation
* Configure vesting start time
* Configure cliff period
* Configure vesting duration
* Approve TVUSD for the vesting contract
* Revoke active vesting schedules
* Monitor TVUSD balance and allowance

---

## 🔐 Smart Contract Features

TokenVest uses OpenZeppelin contracts and security primitives to provide safer token management.

### ERC-20 Integration

The project uses an ERC-20 compatible token called:

```text
TokenVest USD
TVUSD
```

### Cliff Vesting

Tokens remain unavailable until the configured cliff period has been reached.

### Linear Vesting

After the cliff, tokens vest progressively over the configured duration.

### Beneficiary Claims

Only the designated beneficiary can claim tokens from their vesting schedule.

### Vesting Revocation

The owner can revoke an active schedule.

When a schedule is revoked:

* Vested tokens remain claimable by the beneficiary.
* Unvested tokens are returned to the owner.
* The schedule becomes permanently revoked.

### Access Control

Schedule creation and revocation are restricted to the contract owner using OpenZeppelin `Ownable`.

### Reentrancy Protection

The claim function uses OpenZeppelin `ReentrancyGuard`.

### Safe ERC-20 Transfers

Token transfers use OpenZeppelin `SafeERC20`.

---

## 🧪 Testing

TokenVest currently has **16 automated tests**.

```text
16 tests
16 passing
0 failing
```

The test suite covers:

* Token deployment
* Vesting schedule creation
* Invalid beneficiary rejection
* Zero amount rejection
* Invalid cliff/duration configuration
* Non-owner schedule creation rejection
* Cliff behavior
* Linear vesting calculation
* Full vesting
* Beneficiary token claiming
* Unauthorized claiming
* Empty claim rejection
* Vesting revocation
* Preservation of vested tokens after revocation
* Returning unvested tokens to the owner
* Double revocation protection

Run the test suite:

```bash
npx hardhat test
```

---

## 🏗️ Tech Stack

### Blockchain

* Solidity `0.8.34`
* Ethereum
* Ethereum Sepolia
* ERC-20
* OpenZeppelin Contracts

### Smart Contract Development

* Hardhat 3
* Hardhat Toolbox
* Node.js
* Solidity testing

### Frontend

* React
* Vite
* JavaScript
* ethers.js
* MetaMask

### Deployment

* Ethereum Sepolia
* Vercel

---

## 📁 Project Structure

```text
token-vesting-dapp/
│
├── contracts/
│   ├── MockToken.sol
│   └── TokenVesting.sol
│
├── scripts/
│   └── deploy.js
│
├── test/
│   └── TokenVesting.test.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contracts/
│   │   │   ├── MockToken.js
│   │   │   └── TokenVesting.js
│   │   ├── pages/
│   │   ├── utils/
│   │   │   └── contract.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── hardhat.config.ts
├── package.json
├── package-lock.json
├── .gitignore
└── README.md
```

---

## ⚙️ Local Development

### Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd token-vesting-dapp
```

### Install smart-contract dependencies

```bash
npm install
```

### Compile contracts

```bash
npx hardhat compile
```

### Run tests

```bash
npx hardhat test
```

---

## 🌐 Frontend Development

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production frontend:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

## 🔄 How TokenVest Works

```text
                Employer / Admin
                       │
                       │ Create Vesting
                       ▼
              ┌──────────────────┐
              │  TokenVesting    │
              │   Smart Contract │
              └────────┬─────────┘
                       │
                       │ Vesting Schedule
                       ▼
                ┌──────────────┐
                │ Beneficiary  │
                └──────┬───────┘
                       │
             ┌─────────┴─────────┐
             │                   │
          Cliff              Linear Vesting
             │                   │
             └─────────┬─────────┘
                       │
                       ▼
                  Claim Tokens
                       │
                       ▼
                 Beneficiary
```

---

## 🛡️ Security Considerations

The smart contract uses:

* OpenZeppelin `Ownable`
* OpenZeppelin `ReentrancyGuard`
* OpenZeppelin `SafeERC20`
* Input validation
* Beneficiary authorization
* Owner-only administrative operations
* Automated contract tests

This project is intended as a portfolio and educational project and has **not been independently audited by a professional smart-contract security firm**.

---

## 📊 Current Project Status

| Component               | Status          |
| ----------------------- | --------------- |
| ERC-20 token            | ✅ Complete      |
| Vesting contract        | ✅ Complete      |
| Cliff vesting           | ✅ Complete      |
| Linear vesting          | ✅ Complete      |
| Token claiming          | ✅ Complete      |
| Vesting revocation      | ✅ Complete      |
| Access control          | ✅ Complete      |
| Reentrancy protection   | ✅ Complete      |
| Automated tests         | ✅ 16/16 passing |
| Sepolia deployment      | ✅ Complete      |
| Etherscan verification  | ✅ Complete      |
| Blockscout verification | ✅ Complete      |
| Sourcify verification   | ✅ Complete      |
| React frontend          | ✅ Complete      |
| MetaMask integration    | ✅ Complete      |
| Vercel deployment       | ✅ Complete      |

---

## 🎯 Project Goals

TokenVest was built to demonstrate practical Web3 development skills across the complete dApp lifecycle:

```text
Smart Contract
      ↓
Testing
      ↓
Testnet Deployment
      ↓
Contract Verification
      ↓
Frontend Integration
      ↓
Wallet Integration
      ↓
Production Deployment
```

The project demonstrates experience with both blockchain infrastructure and user-facing Web3 application development.

---

## 👨‍💻 Author

**Jagadeesh**

Web3 Developer focused on:

* Solidity
* Smart Contracts
* Ethereum
* Web3 dApps
* React
* AI + Web3

---

## 📄 License

This project is licensed under the MIT License.
