# BlockDAG Mining Rewards Smart Contract

## Overview

`MiningRewards.sol` is a production-ready Ethereum smart contract (EVM-compatible) that manages mining rewards, miner verification, and staking for the BlockDAG network.

## Features

### Miner Management
- **Register** - Miners stake ETH to join the network
- **Verify** - Admin verification system for trusted miners
- **Stake Management** - Increase stake or unstake funds
- **Profile Tracking** - Maintain miner stats (blocks found, rewards, joinDate)

### Reward System
- **Block Discovery Recording** - Track when miners find blocks
- **Reward Calculation** - Base reward + difficulty bonus
- **Pending Rewards** - View unclaimed rewards
- **Claim Rewards** - Withdraw accumulated rewards

### Admin Controls
- Owner-only functions for managing the contract
- Pause/Resume emergency controls
- Miner verification/revocation
- Configurable reward rates and minimum stakes

## Contract Addresses

| Network | Address | Status |
|---------|---------|--------|
| Sepolia Testnet | TBD | Pending Deployment |
| Ethereum Mainnet | TBD | Pending Deployment |

## Key Functions

### Public Functions (Miners)

```solidity
// Register as a miner with initial stake
function registerMiner(address _minerAddress) external payable

// Increase stake amount
function increaseStake(address _minerAddress) external payable

// Unstake and withdraw funds
function unstake(uint256 _amount) external

// Claim accumulated rewards
function claimRewards() external

// View pending rewards
function getPendingRewards(address _minerAddress) external view returns (uint256)

// Get miner details
function getMiner(address _minerAddress) external view returns (Miner)
```

### Admin Functions

```solidity
// Record a discovered block and allocate reward
function recordBlockReward(uint256 _blockNumber, address _minerAddress, uint256 _difficulty) external onlyOwner

// Update reward rate (basis points)
function setRewardRate(uint256 _newRate) external onlyOwner

// Update minimum stake requirement
function setMinimumStake(uint256 _newMinimum) external onlyOwner

// Pause contract (emergency)
function pause() external onlyOwner

// Resume contract
function resume() external onlyOwner

// Verify miner address
function verifyMiner(address _minerAddress) external onlyOwner

// Revoke miner verification
function revokeMiner(address _minerAddress) external onlyOwner
```

## Data Structures

### Miner
```solidity
struct Miner {
    address minerAddress;
    uint256 stakedAmount;
    uint256 rewardsEarned;
    uint256 blocksFound;
    uint256 lastClaimTime;
    bool isActive;
    uint256 joinedAt;
}
```

### BlockReward
```solidity
struct BlockReward {
    uint256 blockNumber;
    address minerAddress;
    uint256 rewardAmount;
    uint256 difficulty;
    uint256 timestamp;
}
```

## Configuration

| Parameter | Default | Description |
|-----------|---------|-------------|
| `minimumStake` | 1 ETH | Minimum stake to register |
| `rewardRate` | 100 (1%) | Reward rate in basis points |
| `paused` | false | Emergency pause flag |

## Events

```solidity
event MinerRegistered(address indexed miner, uint256 stakedAmount, uint256 timestamp)
event BlockDiscovered(address indexed miner, uint256 blockNumber, uint256 rewardAmount, uint256 timestamp)
event RewardClaimed(address indexed miner, uint256 rewardAmount, uint256 timestamp)
event StakeIncreased(address indexed miner, uint256 newStakeAmount, uint256 timestamp)
event MinerUnstaked(address indexed miner, uint256 unstakedAmount, uint256 timestamp)
event RewardRateUpdated(uint256 newRate, uint256 timestamp)
```

## Integration with DAGPulse

### Frontend Integration
1. **MetaMask Connection** - Users connect wallet in Settings
2. **Miner Registration** - Call `registerMiner()` with stake
3. **Reward Claims** - Claim button on Dashboard/Miner Details
4. **Stake Management** - Increase/decrease stake in Settings

### Backend Integration
1. **Block Recording** - When block discovered, call `recordBlockReward()`
2. **Miner Verification** - Sync contract-verified miners
3. **Reward Tracking** - Query pending rewards from contract
4. **Event Listening** - Listen for `BlockDiscovered` events

## Deployment Instructions

### 1. Compile
```bash
# Using Hardhat
npx hardhat compile

# Using Truffle
truffle compile

# Using Foundry
forge build
```

### 2. Deploy
```javascript
// Using Hardhat
const MiningRewards = await ethers.getContractFactory("MiningRewards");
const contract = await MiningRewards.deploy();
await contract.deployed();
console.log("Contract deployed to:", contract.address);
```

### 3. Verify Source Code
```bash
# Etherscan verification
npx hardhat verify --network <network> <CONTRACT_ADDRESS>
```

## Testing

```bash
# Run test suite
npx hardhat test

# Test coverage
npx hardhat coverage
```

### Key Test Cases
- Miner registration with sufficient/insufficient stake
- Block reward allocation
- Reward claiming and withdrawal
- Stake increase/decrease
- Emergency pause/resume
- Miner verification/revocation

## Security Considerations

✅ **Implemented:**
- Checks-Effects-Interactions pattern
- Reentrancy protection via state updates before transfers
- Input validation for all functions
- Access control via modifiers
- Emergency pause mechanism
- Owner withdrawal for emergency situations

⚠️ **Recommendations:**
- Conduct third-party security audit before mainnet deployment
- Use OpenZeppelin's ReentrancyGuard for additional protection
- Implement rate limiting for reward claims
- Add time-lock for sensitive admin functions
- Consider insurance/recovery fund

## Gas Optimization

| Function | Gas Estimate |
|----------|-------------|
| registerMiner | ~150k |
| increaseStake | ~80k |
| unstake | ~100k |
| recordBlockReward | ~120k |
| claimRewards | ~90k |

*Estimates based on Ethereum mainnet*

## Future Enhancements

1. **ERC-20 Token Rewards** - Distribute BDAG tokens instead of ETH
2. **Staking Tiers** - Different reward rates for stake levels
3. **Referral System** - Bonuses for bringing new miners
4. **Delegation** - Allow miners to delegate to pools
5. **Governance** - DAO-based parameter adjustments
6. **Cross-Chain Support** - Deploy on multiple networks

## Contract Statistics

| Metric | Value |
|--------|-------|
| Solidity Version | ^0.8.19 |
| License | MIT |
| Lines of Code | ~450 |
| Functions | 25 |
| Events | 6 |
| Modifiers | 4 |
| Complexity | Medium |

## Support & Resources

- **Documentation** - See FUNCTIONAL_ARCHITECTURE.md
- **Frontend Integration** - client/src/pages/Settings.tsx
- **Backend Integration** - server/routes.ts (future: /api/contract/*)
- **Issues** - Report via GitHub Issues

## License

MIT License - See LICENSE file for details
