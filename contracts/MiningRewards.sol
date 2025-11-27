// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MiningRewards
 * @dev BlockDAG Mining Rewards Smart Contract
 * Manages miner verification, reward distribution, and staking
 */

contract MiningRewards {
    // ============ State Variables ============
    
    address public owner;
    uint256 public totalRewardsDistributed;
    uint256 public minimumStake = 1 ether;
    uint256 public rewardRate = 100; // Basis points (1% = 100)
    bool public paused = false;
    
    // Miner structure
    struct Miner {
        address minerAddress;
        uint256 stakedAmount;
        uint256 rewardsEarned;
        uint256 blocksFound;
        uint256 lastClaimTime;
        bool isActive;
        uint256 joinedAt;
    }
    
    struct BlockReward {
        uint256 blockNumber;
        address minerAddress;
        uint256 rewardAmount;
        uint256 difficulty;
        uint256 timestamp;
    }
    
    // Mappings
    mapping(address => Miner) public miners;
    mapping(uint256 => BlockReward) public blockRewards;
    mapping(address => bool) public isVerifiedMiner;
    
    address[] public minerList;
    uint256 public totalMiners;
    uint256 public totalBlocksFound;
    
    // ============ Events ============
    
    event MinerRegistered(
        address indexed miner,
        uint256 stakedAmount,
        uint256 timestamp
    );
    
    event BlockDiscovered(
        address indexed miner,
        uint256 blockNumber,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event RewardClaimed(
        address indexed miner,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event StakeIncreased(
        address indexed miner,
        uint256 newStakeAmount,
        uint256 timestamp
    );
    
    event MinerUnstaked(
        address indexed miner,
        uint256 unstakedAmount,
        uint256 timestamp
    );
    
    event RewardRateUpdated(
        uint256 newRate,
        uint256 timestamp
    );
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }
    
    modifier onlyVerifiedMiner() {
        require(isVerifiedMiner[msg.sender], "Miner not verified");
        _;
    }
    
    modifier minerExists() {
        require(miners[msg.sender].isActive, "Miner not registered");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        totalMiners = 0;
        totalBlocksFound = 0;
        totalRewardsDistributed = 0;
    }
    
    // ============ Miner Registration ============
    
    /**
     * @dev Register a new miner with initial stake
     * @param _minerAddress Address of the miner
     */
    function registerMiner(address _minerAddress) external payable whenNotPaused {
        require(msg.value >= minimumStake, "Stake below minimum");
        require(!miners[_minerAddress].isActive, "Miner already registered");
        require(_minerAddress != address(0), "Invalid miner address");
        
        miners[_minerAddress] = Miner({
            minerAddress: _minerAddress,
            stakedAmount: msg.value,
            rewardsEarned: 0,
            blocksFound: 0,
            lastClaimTime: block.timestamp,
            isActive: true,
            joinedAt: block.timestamp
        });
        
        isVerifiedMiner[_minerAddress] = true;
        minerList.push(_minerAddress);
        totalMiners++;
        
        emit MinerRegistered(_minerAddress, msg.value, block.timestamp);
    }
    
    /**
     * @dev Increase stake for existing miner
     */
    function increaseStake(address _minerAddress) external payable minerExists {
        require(msg.value > 0, "Stake amount must be greater than 0");
        require(_minerAddress == msg.sender || msg.sender == owner, "Unauthorized");
        
        miners[_minerAddress].stakedAmount += msg.value;
        
        emit StakeIncreased(_minerAddress, miners[_minerAddress].stakedAmount, block.timestamp);
    }
    
    /**
     * @dev Unstake and withdraw funds
     * @param _amount Amount to unstake
     */
    function unstake(uint256 _amount) external minerExists {
        Miner storage miner = miners[msg.sender];
        require(_amount <= miner.stakedAmount, "Insufficient staked amount");
        require(_amount > 0, "Unstake amount must be greater than 0");
        
        miner.stakedAmount -= _amount;
        
        // If unstaking all, deactivate miner
        if (miner.stakedAmount == 0) {
            miner.isActive = false;
            isVerifiedMiner[msg.sender] = false;
        }
        
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Withdrawal failed");
        
        emit MinerUnstaked(msg.sender, _amount, block.timestamp);
    }
    
    // ============ Block Rewards ============
    
    /**
     * @dev Record a discovered block and allocate reward
     * @param _blockNumber Block number found
     * @param _minerAddress Miner who found it
     * @param _difficulty Block difficulty
     */
    function recordBlockReward(
        uint256 _blockNumber,
        address _minerAddress,
        uint256 _difficulty
    ) external onlyOwner whenNotPaused {
        require(isVerifiedMiner[_minerAddress], "Miner not verified");
        require(_blockNumber > 0, "Invalid block number");
        
        // Calculate reward based on difficulty and rate
        uint256 baseReward = 1 ether;
        uint256 difficultyBonus = (_difficulty * baseReward) / 100;
        uint256 totalReward = baseReward + difficultyBonus;
        
        miners[_minerAddress].blocksFound++;
        miners[_minerAddress].rewardsEarned += totalReward;
        totalBlocksFound++;
        totalRewardsDistributed += totalReward;
        
        blockRewards[_blockNumber] = BlockReward({
            blockNumber: _blockNumber,
            minerAddress: _minerAddress,
            rewardAmount: totalReward,
            difficulty: _difficulty,
            timestamp: block.timestamp
        });
        
        emit BlockDiscovered(_minerAddress, _blockNumber, totalReward, block.timestamp);
    }
    
    // ============ Reward Claims ============
    
    /**
     * @dev Claim accumulated rewards
     */
    function claimRewards() external minerExists whenNotPaused {
        Miner storage miner = miners[msg.sender];
        uint256 claimAmount = miner.rewardsEarned;
        
        require(claimAmount > 0, "No rewards to claim");
        require(address(this).balance >= claimAmount, "Insufficient contract balance");
        
        miner.rewardsEarned = 0;
        miner.lastClaimTime = block.timestamp;
        
        (bool success, ) = msg.sender.call{value: claimAmount}("");
        require(success, "Reward transfer failed");
        
        emit RewardClaimed(msg.sender, claimAmount, block.timestamp);
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get miner details
     */
    function getMiner(address _minerAddress) 
        external 
        view 
        returns (Miner memory) 
    {
        return miners[_minerAddress];
    }
    
    /**
     * @dev Get pending rewards for miner
     */
    function getPendingRewards(address _minerAddress) 
        external 
        view 
        returns (uint256) 
    {
        return miners[_minerAddress].rewardsEarned;
    }
    
    /**
     * @dev Get total staked amount across all miners
     */
    function getTotalStaked() external view returns (uint256) {
        uint256 total = 0;
        for (uint256 i = 0; i < minerList.length; i++) {
            if (miners[minerList[i]].isActive) {
                total += miners[minerList[i]].stakedAmount;
            }
        }
        return total;
    }
    
    /**
     * @dev Get active miners count
     */
    function getActiveMinerCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 0; i < minerList.length; i++) {
            if (miners[minerList[i]].isActive) {
                count++;
            }
        }
        return count;
    }
    
    /**
     * @dev Get all miners
     */
    function getAllMiners() external view returns (address[] memory) {
        return minerList;
    }
    
    /**
     * @dev Get block reward details
     */
    function getBlockReward(uint256 _blockNumber) 
        external 
        view 
        returns (BlockReward memory) 
    {
        return blockRewards[_blockNumber];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update reward rate (in basis points)
     * @param _newRate New rate in basis points
     */
    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0 && _newRate <= 10000, "Invalid reward rate");
        rewardRate = _newRate;
        emit RewardRateUpdated(_newRate, block.timestamp);
    }
    
    /**
     * @dev Update minimum stake amount
     */
    function setMinimumStake(uint256 _newMinimum) external onlyOwner {
        require(_newMinimum > 0, "Minimum stake must be greater than 0");
        minimumStake = _newMinimum;
    }
    
    /**
     * @dev Pause contract (emergency)
     */
    function pause() external onlyOwner {
        paused = true;
    }
    
    /**
     * @dev Resume contract
     */
    function resume() external onlyOwner {
        paused = false;
    }
    
    /**
     * @dev Withdraw contract balance (emergency)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Verify miner address
     */
    function verifyMiner(address _minerAddress) external onlyOwner {
        isVerifiedMiner[_minerAddress] = true;
    }
    
    /**
     * @dev Revoke miner verification
     */
    function revokeMiner(address _minerAddress) external onlyOwner {
        isVerifiedMiner[_minerAddress] = false;
        if (miners[_minerAddress].isActive) {
            miners[_minerAddress].isActive = false;
        }
    }
    
    // ============ Receive Function ============
    
    /**
     * @dev Allow contract to receive ETH
     */
    receive() external payable {}
}
