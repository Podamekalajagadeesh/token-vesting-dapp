export const TOKEN_VESTING_ADDRESS =
  "0xa7cD4581F7967D6a19dd405cC8C9B066116669d0";

export const TOKEN_VESTING_ABI = [
  "function token() view returns (address)",
  "function owner() view returns (address)",
  "function nextScheduleId() view returns (uint256)",
  "function schedules(uint256) view returns (address beneficiary, uint256 totalAmount, uint256 start, uint256 cliff, uint256 duration, uint256 claimed, uint256 vestedAtRevocation, bool revoked)",
  "function vestedAmount(uint256 scheduleId) view returns (uint256)",
  "function claimableAmount(uint256 scheduleId) view returns (uint256)",
  "function claim(uint256 scheduleId)",
  "function revoke(uint256 scheduleId)",
  "function createVesting(address beneficiary, uint256 totalAmount, uint256 start, uint256 cliffDuration, uint256 duration)",
  "event VestingCreated(uint256 indexed scheduleId, address indexed beneficiary, uint256 totalAmount, uint256 start, uint256 cliff, uint256 duration)",
  "event TokensClaimed(uint256 indexed scheduleId, address indexed beneficiary, uint256 amount)",
  "event VestingRevoked(uint256 indexed scheduleId, uint256 unvestedAmount)"
];