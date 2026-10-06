import { ethers } from "ethers";

import {
  TOKEN_VESTING_ADDRESS,
  TOKEN_VESTING_ABI,
} from "../contracts/TokenVesting";

import {
  MOCK_TOKEN_ADDRESS,
  MOCK_TOKEN_ABI,
} from "../contracts/MockToken";

export async function getProvider() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  return new ethers.BrowserProvider(window.ethereum);
}

export async function getSigner() {
  const provider = await getProvider();

  await provider.send("eth_requestAccounts", []);

  return provider.getSigner();
}

export async function getVestingContract() {
  const signer = await getSigner();

  return new ethers.Contract(
    TOKEN_VESTING_ADDRESS,
    TOKEN_VESTING_ABI,
    signer
  );
}

export async function getTokenContract() {
  const signer = await getSigner();

  return new ethers.Contract(
    MOCK_TOKEN_ADDRESS,
    MOCK_TOKEN_ABI,
    signer
  );
}