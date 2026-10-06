// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenVesting is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;

    struct VestingSchedule {
        address beneficiary;
        uint256 totalAmount;
        uint256 start;
        uint256 cliff;
        uint256 duration;
        uint256 claimed;
        uint256 vestedAtRevocation;
        bool revoked;
    }

    uint256 public nextScheduleId;

    mapping(uint256 => VestingSchedule) public schedules;

    event VestingCreated(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliff,
        uint256 duration
    );

    event TokensClaimed(
        uint256 indexed scheduleId,
        address indexed beneficiary,
        uint256 amount
    );

    event VestingRevoked(
        uint256 indexed scheduleId,
        uint256 unvestedAmount
    );

    constructor(address tokenAddress) Ownable(msg.sender) {
        require(tokenAddress != address(0), "Invalid token");
        token = IERC20(tokenAddress);
    }

    function createVesting(
        address beneficiary,
        uint256 totalAmount,
        uint256 start,
        uint256 cliffDuration,
        uint256 duration
    ) external onlyOwner returns (uint256 scheduleId) {
        require(beneficiary != address(0), "Invalid beneficiary");
        require(totalAmount > 0, "Amount must be greater than zero");
        require(duration > 0, "Duration must be greater than zero");
        require(cliffDuration <= duration, "Cliff exceeds duration");

        scheduleId = nextScheduleId++;

        uint256 cliff = start + cliffDuration;

        schedules[scheduleId] = VestingSchedule({
            beneficiary: beneficiary,
            totalAmount: totalAmount,
            start: start,
            cliff: cliff,
            duration: duration,
            claimed: 0,
            vestedAtRevocation: 0,
            revoked: false
        });

        token.safeTransferFrom(
            msg.sender,
            address(this),
            totalAmount
        );

        emit VestingCreated(
            scheduleId,
            beneficiary,
            totalAmount,
            start,
            cliff,
            duration
        );
    }

    function vestedAmount(
        uint256 scheduleId
    ) public view returns (uint256) {
        VestingSchedule memory schedule = schedules[scheduleId];

        if (schedule.revoked) {
            return schedule.vestedAtRevocation;
        }

        if (block.timestamp < schedule.cliff) {
            return 0;
        }

        if (block.timestamp >= schedule.start + schedule.duration) {
            return schedule.totalAmount;
        }

        uint256 elapsed = block.timestamp - schedule.start;

        return (schedule.totalAmount * elapsed) / schedule.duration;
    }

    function claim(uint256 scheduleId) external nonReentrant {
        VestingSchedule storage schedule = schedules[scheduleId];

        require(
            msg.sender == schedule.beneficiary,
            "Not beneficiary"
        );

        uint256 vested = vestedAmount(scheduleId);
        uint256 claimable = vested - schedule.claimed;

        require(claimable > 0, "Nothing to claim");

        schedule.claimed += claimable;

        token.safeTransfer(
            schedule.beneficiary,
            claimable
        );

        emit TokensClaimed(
            scheduleId,
            schedule.beneficiary,
            claimable
        );
    }

    function revoke(uint256 scheduleId) external onlyOwner {
        VestingSchedule storage schedule = schedules[scheduleId];

        require(!schedule.revoked, "Already revoked");

        uint256 vested = vestedAmount(scheduleId);
        uint256 unvested = schedule.totalAmount - vested;

        schedule.vestedAtRevocation = vested;
        schedule.revoked = true;

        if (unvested > 0) {
            token.safeTransfer(owner(), unvested);
        }

        emit VestingRevoked(
            scheduleId,
            unvested
        );
    }

    function claimableAmount(
        uint256 scheduleId
    ) external view returns (uint256) {
        VestingSchedule memory schedule = schedules[scheduleId];

        uint256 vested = vestedAmount(scheduleId);

        return vested - schedule.claimed;
    }
}