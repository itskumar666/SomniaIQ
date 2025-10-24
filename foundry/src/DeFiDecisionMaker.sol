// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title DeFiDecisionMaker
 * @dev AI-driven portfolio management contract for Somnia network
 * Handles automated rebalancing based on AI recommendations
 */
contract DeFiDecisionMaker is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Supported tokens on Somnia network
    struct TokenInfo {
        address tokenAddress;
        string symbol;
        uint8 decimals;
        bool isActive;
        uint256 lastPrice; // Price in USD with 18 decimals
    }

    struct Portfolio {
        address owner;
        mapping(address => uint256) balances;
        uint256 totalValue; // Total portfolio value in USD
        uint256 lastRebalance;
        bool autoRebalanceEnabled;
        uint8 riskTolerance; // 1=Conservative, 2=Moderate, 3=Aggressive
    }

    struct RebalanceRecommendation {
        address fromToken;
        address toToken;
        uint256 amount;
        string reason;
        uint256 timestamp;
        uint8 confidenceScore; // 1-100
        bool executed;
    }

    // State variables
    mapping(address => TokenInfo) public supportedTokens;
    mapping(address => Portfolio) public portfolios;
    mapping(address => RebalanceRecommendation[]) public userRecommendations;
    
    address[] public tokenList;
    address public aiOracleAddress;
    uint256 public rebalanceFee = 25; // 0.25% in basis points
    uint256 public constant MAX_FEE = 100; // 1% max fee
    
    // Events
    event PortfolioCreated(address indexed user, uint8 riskTolerance);
    event TokenAdded(address indexed token, string symbol);
    event RebalanceExecuted(
        address indexed user,
        address indexed fromToken,
        address indexed toToken,
        uint256 amount,
        uint256 fee
    );
    event AIRecommendationReceived(
        address indexed user,
        address fromToken,
        address toToken,
        uint256 amount,
        uint8 confidence
    );
    event AutoRebalanceToggled(address indexed user, bool enabled);

    // Modifiers
    modifier onlyAIOracle() {
        require(msg.sender == aiOracleAddress, "Only AI Oracle can call this");
        _;
    }

    modifier hasPortfolio() {
        require(portfolios[msg.sender].owner == msg.sender, "Portfolio not found");
        _;
    }

    constructor(address _aiOracle) Ownable(msg.sender) {
        aiOracleAddress = _aiOracle;
    }

    /**
     * @dev Add a new supported token
     */
    function addSupportedToken(
        address _token,
        string memory _symbol,
        uint8 _decimals
    ) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!supportedTokens[_token].isActive, "Token already supported");

        supportedTokens[_token] = TokenInfo({
            tokenAddress: _token,
            symbol: _symbol,
            decimals: _decimals,
            isActive: true,
            lastPrice: 0
        });

        tokenList.push(_token);
        emit TokenAdded(_token, _symbol);
    }

    /**
     * @dev Create a new portfolio
     */
    function createPortfolio(uint8 _riskTolerance) external {
        require(_riskTolerance >= 1 && _riskTolerance <= 3, "Invalid risk tolerance");
        require(portfolios[msg.sender].owner == address(0), "Portfolio already exists");

        Portfolio storage portfolio = portfolios[msg.sender];
        portfolio.owner = msg.sender;
        portfolio.totalValue = 0;
        portfolio.lastRebalance = block.timestamp;
        portfolio.autoRebalanceEnabled = false;
        portfolio.riskTolerance = _riskTolerance;

        emit PortfolioCreated(msg.sender, _riskTolerance);
    }

    /**
     * @dev Deposit tokens into portfolio
     */
    function depositToken(address _token, uint256 _amount) external hasPortfolio nonReentrant {
        require(supportedTokens[_token].isActive, "Token not supported");
        require(_amount > 0, "Amount must be greater than 0");

        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        portfolios[msg.sender].balances[_token] += _amount;

        _updatePortfolioValue(msg.sender);
    }

    /**
     * @dev Withdraw tokens from portfolio
     */
    function withdrawToken(address _token, uint256 _amount) external hasPortfolio nonReentrant {
        require(portfolios[msg.sender].balances[_token] >= _amount, "Insufficient balance");

        portfolios[msg.sender].balances[_token] -= _amount;
        IERC20(_token).safeTransfer(msg.sender, _amount);

        _updatePortfolioValue(msg.sender);
    }

    /**
     * @dev AI Oracle submits rebalancing recommendation
     */
    function submitAIRecommendation(
        address _user,
        address _fromToken,
        address _toToken,
        uint256 _amount,
        string memory _reason,
        uint8 _confidence
    ) external onlyAIOracle {
        require(portfolios[_user].owner == _user, "User portfolio not found");
        require(supportedTokens[_fromToken].isActive && supportedTokens[_toToken].isActive, "Invalid tokens");
        require(_confidence >= 50 && _confidence <= 100, "Invalid confidence score");

        RebalanceRecommendation memory recommendation = RebalanceRecommendation({
            fromToken: _fromToken,
            toToken: _toToken,
            amount: _amount,
            reason: _reason,
            timestamp: block.timestamp,
            confidenceScore: _confidence,
            executed: false
        });

        userRecommendations[_user].push(recommendation);

        emit AIRecommendationReceived(_user, _fromToken, _toToken, _amount, _confidence);

        // Auto-execute if enabled and confidence is high
        if (portfolios[_user].autoRebalanceEnabled && _confidence >= 80) {
            _executeRebalance(_user, userRecommendations[_user].length - 1);
        }
    }

    /**
     * @dev Execute a rebalancing recommendation
     */
    function executeRebalance(uint256 _recommendationIndex) external hasPortfolio nonReentrant {
        _executeRebalance(msg.sender, _recommendationIndex);
    }

    /**
     * @dev Internal function to execute rebalancing
     */
    function _executeRebalance(address _user, uint256 _recommendationIndex) internal {
        require(_recommendationIndex < userRecommendations[_user].length, "Invalid recommendation index");
        
        RebalanceRecommendation storage rec = userRecommendations[_user][_recommendationIndex];
        require(!rec.executed, "Recommendation already executed");
        require(block.timestamp <= rec.timestamp + 1 hours, "Recommendation expired");

        Portfolio storage portfolio = portfolios[_user];
        require(portfolio.balances[rec.fromToken] >= rec.amount, "Insufficient balance");

        // Calculate fee
        uint256 feeAmount = (rec.amount * rebalanceFee) / 10000;
        uint256 swapAmount = rec.amount - feeAmount;

        // Simple 1:1 swap for demo (in production, integrate with DEX)
        portfolio.balances[rec.fromToken] -= rec.amount;
        portfolio.balances[rec.toToken] += swapAmount;

        // Mark as executed
        rec.executed = true;
        portfolio.lastRebalance = block.timestamp;

        emit RebalanceExecuted(_user, rec.fromToken, rec.toToken, swapAmount, feeAmount);
        _updatePortfolioValue(_user);
    }

    /**
     * @dev Toggle auto-rebalancing
     */
    function setAutoRebalance(bool _enabled) external hasPortfolio {
        portfolios[msg.sender].autoRebalanceEnabled = _enabled;
        emit AutoRebalanceToggled(msg.sender, _enabled);
    }

    /**
     * @dev Update token price (called by price oracle)
     */
    function updateTokenPrice(address _token, uint256 _price) external onlyOwner {
        require(supportedTokens[_token].isActive, "Token not supported");
        supportedTokens[_token].lastPrice = _price;
    }

    /**
     * @dev Get user's portfolio balance for a token
     */
    function getPortfolioBalance(address _user, address _token) external view returns (uint256) {
        return portfolios[_user].balances[_token];
    }

    /**
     * @dev Get user's recommendations
     */
    function getUserRecommendations(address _user) external view returns (RebalanceRecommendation[] memory) {
        return userRecommendations[_user];
    }

    /**
     * @dev Get supported tokens
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return tokenList;
    }

    /**
     * @dev Internal function to update portfolio value
     */
    function _updatePortfolioValue(address _user) internal {
        uint256 totalValue = 0;
        Portfolio storage portfolio = portfolios[_user];

        for (uint i = 0; i < tokenList.length; i++) {
            address token = tokenList[i];
            uint256 balance = portfolio.balances[token];
            uint256 price = supportedTokens[token].lastPrice;
            
            if (balance > 0 && price > 0) {
                totalValue += (balance * price) / (10 ** supportedTokens[token].decimals);
            }
        }

        portfolio.totalValue = totalValue;
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address _token) external onlyOwner {
        IERC20 token = IERC20(_token);
        token.safeTransfer(owner(), token.balanceOf(address(this)));
    }

    /**
     * @dev Set rebalance fee (owner only)
     */
    function setRebalanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee too high");
        rebalanceFee = _fee;
    }

    /**
     * @dev Set AI Oracle address (owner only)
     */
    function setAIOracle(address _aiOracle) external onlyOwner {
        require(_aiOracle != address(0), "Invalid address");
        aiOracleAddress = _aiOracle;
    }
}