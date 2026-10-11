# TokenVest — Decentralized Token Vesting & Salary Management dApp

TokenVest is a decentralized token vesting platform that enables employers and organizations to create time-based token allocations for employees and beneficiaries.

Built with Solidity, Hardhat, React, ethers.js, and MetaMask, the platform supports cliff-based vesting, linear token releases, beneficiary claims, and owner-controlled vesting revocation.

The project demonstrates full-stack Web3 development, including smart-contract development, automated testing, testnet deployment, contract verification, wallet integration, and frontend deployment.

## 🔗 Project Links

- **Live Demo:** https://tokenvest-bice.vercel.app/
- **GitHub Repository:** https://github.com/Podamekalajagadeesh/token-vesting-dapp
- **Verified TokenVesting Contract:** https://sepolia.etherscan.io/address/0xa7cD4581F7967D6a19dd405cC8C9B066116669d0#code

**Network:** Ethereum Sepolia  
**Chain ID:** `11155111`

## ✨ Features

### Employee / Beneficiary Dashboard

- Connect an Ethereum wallet using MetaMask.
- View assigned token allocations and vesting schedules.
- Track vested, claimed, and currently claimable tokens.
- Monitor vesting progress over time.
- Claim available tokens directly through the smart contract.

### Employer / Administrator Dashboard

- Create token vesting schedules for beneficiaries.
- Configure beneficiary addresses and token allocations.
- Set vesting start times, cliff periods, and vesting durations.
- Approve TVUSD token allowances for the vesting contract.
- Revoke eligible active vesting schedules.
- Monitor token balances and allowances.

## 🏗️ Smart Contract Architecture

TokenVest uses Solidity smart contracts to manage ERC-20 token allocations and enforce vesting rules on Ethereum.

### ERC-20 Token Integration

The project includes a mock ERC-20 token for demonstrating the vesting workflow.

- **Token Name:** TokenVest USD
- **Token Symbol:** TVUSD
- **MockToken Contract:** `0xde6bEd4cbD5201228421241C7045Dd8d88B8e2b4`

### Cliff Vesting

Tokens remain unavailable for claiming until the configured cliff condition is satisfied.

### Linear Vesting

After the applicable cliff period, tokens become vested progressively according to the configured vesting schedule.

### Beneficiary Claims

Only the designated beneficiary can claim tokens available under their vesting schedule.

### Vesting Revocation

The contract owner can revoke an eligible active vesting schedule.

According to the contract's intended behavior:

- Already vested tokens remain claimable by the beneficiary.
- Unvested tokens are returned to the owner.
- The revoked schedule cannot be revoked again.

### Access Control

The contract uses OpenZeppelin `Ownable` to restrict administrative operations, including vesting schedule creation and revocation, to the owner.

### Reentrancy Protection

The token-claiming function uses OpenZeppelin `ReentrancyGuard` to help protect against reentrant calls.

### Safe Token Transfers

OpenZeppelin `SafeERC20` is used for safer ERC-20 token transfer operations.

## 📜 Smart Contract Deployments

The contracts are deployed to the Ethereum Sepolia testnet.

| Contract | Address |
|---|---|
| MockToken (TVUSD) | `0xde6bEd4cbD5201228421241C7045Dd8d88B8e2b4` |
| TokenVesting | `0xa7cD4581F7967D6a19dd405cC8C9B066116669d0` |

### Contract Verification

The TokenVesting source code is reported as verified on:

- [Etherscan](https://sepolia.etherscan.io/address/0xa7cD4581F7967D6a19dd405cC8C9B066116669d0#code)
- Blockscout
- Sourcify

Contract verification allows developers to inspect the published source code associated with a deployment. It does not constitute an independent security audit.

## 🧪 Automated Testing

The project includes **16 smart-contract tests**, reported as passing.

The test suite covers:

- Token deployment
- Vesting schedule creation
- Invalid beneficiary rejection
- Zero allocation rejection
- Invalid cliff and duration configurations
- Unauthorized schedule creation
- Cliff behavior
- Linear vesting calculations
- Fully vested allocations
- Beneficiary token claims
- Unauthorized claim attempts
- Empty claim rejection
- Vesting revocation
- Preservation of vested tokens after revocation
- Return of unvested tokens to the owner
- Prevention of repeated revocation

### Run Tests

From the repository root:

```bash
npm install
npx hardhat test
```

### Compile Smart Contracts

```bash
npx hardhat compile
```

## 🛠️ Tech Stack

**Smart Contracts and Blockchain**
- Solidity `0.8.34`
- Ethereum
- Ethereum Sepolia
- ERC-20
- OpenZeppelin Contracts
- Hardhat 3
- Hardhat Toolbox

**Frontend**
- React
- Vite
- JavaScript
- ethers.js
- MetaMask

**Development and Deployment**
- Node.js
- npm
- Automated smart-contract testing
- Etherscan, Blockscout, and Sourcify verification
- Vercel

## 📁 Project Structure

```text
token-vesting-dapp/
├── contracts/
│   ├── MockToken.sol
│   └── TokenVesting.sol
├── scripts/
│   └── deploy.js
├── test/
│   └── TokenVesting.test.js
├── ignition/
│   └── modules/
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
├── hardhat.config.ts
├── package.json
├── package-lock.json
└── .gitignore
```

## ⚙️ Local Development Setup

### Prerequisites

Install the following before running the project:

- Node.js and npm
- Git
- MetaMask browser extension, if interacting through the frontend

### 1. Clone the Repository

```bash
git clone https://github.com/Podamekalajagadeesh/token-vesting-dapp.git
cd token-vesting-dapp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Compile Contracts

```bash
npx hardhat compile
```

### 4. Run the Test Suite

```bash
npx hardhat test
```

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development URL in the terminal.

### 6. Build the Frontend

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

**Environment configuration:** If the frontend requires environment variables, configure them using the variable names expected by the application. Use placeholder values in any example environment file, and never commit private keys, seed phrases, or API secrets.

## 🔄 How TokenVest Works

1. The employer or administrator connects a wallet.
2. The administrator creates a vesting schedule for a beneficiary.
3. The vesting contract manages the allocation according to the configured schedule.
4. The beneficiary connects their wallet to view vesting information.
5. Tokens become claimable as the vesting conditions are met.
6. The beneficiary claims available tokens.
7. If an eligible schedule is revoked, the contract applies its revocation rules to vested and unvested tokens.

```text
Employer / Administrator
          |
          | Create vesting schedule
          v
   TokenVesting Contract
          |
          | Time-based allocation
          v
      Beneficiary
          |
          | Check vested balance
          v
    Claim available tokens
```

## 🔐 Security Considerations

The project uses the following security-related mechanisms:

- OpenZeppelin `Ownable` for administrative access control.
- OpenZeppelin `ReentrancyGuard` for protection against reentrant calls in the claim function.
- OpenZeppelin `SafeERC20` for ERC-20 token transfers.
- Input validation for vesting schedule parameters.
- Beneficiary authorization for token claims.
- Owner-restricted administrative operations.
- Automated tests for important vesting and access-control scenarios.

**Audit status:** This project is intended for portfolio and educational purposes and has not been independently audited by a professional smart-contract security firm. It uses the Ethereum Sepolia testnet and should not be treated as a production payroll system.

Never commit private keys, seed phrases, or sensitive environment configuration to the repository.

## 📊 Project Status

| Component | Status |
|---|---|
| Mock ERC-20 token | Implemented |
| Vesting smart contract | Implemented |
| Cliff vesting | Implemented |
| Linear vesting | Implemented |
| Beneficiary claims | Implemented |
| Vesting revocation | Implemented |
| Access control | Implemented |
| Reentrancy protection | Implemented |
| Automated tests | 16 passing, as reported |
| Sepolia deployment | Deployed |
| Contract source verification | Reported verified |
| React frontend | Implemented |
| MetaMask integration | Implemented |
| Vercel deployment | Deployed |

## 🎯 Project Objectives

TokenVest was developed to demonstrate practical skills across the Web3 application lifecycle:

- Solidity smart-contract development
- ERC-20 token integration
- Vesting and access-control logic
- Automated contract testing
- Ethereum testnet deployment
- Contract source verification
- React frontend integration
- MetaMask wallet connectivity
- Full-stack dApp development

## 👨‍💻 Author

**Jagadeesh**  
Web3 Developer

Areas of focus:

- Solidity and smart contracts
- Ethereum and Web3 dApps
- React and JavaScript
- Full-stack blockchain applications

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
