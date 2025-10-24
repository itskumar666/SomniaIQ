// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./DeFiDecisionMaker.sol";

/**
 * @title AIOracle
 * @dev Oracle contract that receives AI analysis results and submits recommendations
 * Acts as a bridge between off-chain AI and on-chain execution
 */
contract AIOracle is Ownable {
    
    struct AIAnalysis {
        string sentiment; // "Bullish", "Bearish", "Neutral"
        uint8 riskLevel; // 1=Low, 2=Medium, 3=High
        string recommendation; // "Hold", "Rebalance", "Diversify"
        uint8 confidence; // 1-100
        string analysis;
        uint256 timestamp;
    }

    struct MarketData {
        uint256 ethPrice;
        uint256 btcPrice;
        uint256 sttPrice;
        uint256 usdcPrice;
        int256 marketSentimentScore; // -100 to +100
        uint256 timestamp;
    }

    // State variables
    DeFiDecisionMaker public portfolioManager;
    mapping(address => AIAnalysis) public latestAnalysis;
    mapping(address => bool) public authorizedAnalysts;
    MarketData public currentMarketData;
    
    uint256 public analysisValidityPeriod = 1 hours;
    uint256 public minConfidenceForAutoExecution = 80;

    // Events
    event AIAnalysisSubmitted(
        address indexed user,
        string sentiment,
        uint8 riskLevel,
        uint8 confidence
    );
    event RecommendationSubmitted(
        address indexed user,
        address fromToken,
        address toToken,
        uint256 amount,
        uint8 confidence
    );
    event MarketDataUpdated(
        uint256 ethPrice,
        uint256 btcPrice,
        uint256 sttPrice,
        uint256 marketSentiment
    );
    event AnalystAuthorized(address indexed analyst, bool authorized);

    modifier onlyAuthorizedAnalyst() {
        require(authorizedAnalysts[msg.sender] || msg.sender == owner(), "Not authorized analyst");
        _;
    }

    constructor(address _portfolioManager) Ownable(msg.sender) {
        portfolioManager = DeFiDecisionMaker(_portfolioManager);
        authorizedAnalysts[msg.sender] = true; // Owner is authorized by default
    }

    /**
     * @dev Authorize/deauthorize an analyst
     */
    function setAnalystAuthorization(address _analyst, bool _authorized) external onlyOwner {
        authorizedAnalysts[_analyst] = _authorized;
        emit AnalystAuthorized(_analyst, _authorized);
    }

    /**
     * @dev Submit AI analysis for a user
     */
    function submitAIAnalysis(
        address _user,
        string memory _sentiment,
        uint8 _riskLevel,
        string memory _recommendation,
        uint8 _confidence,
        string memory _analysis
    ) external onlyAuthorizedAnalyst {
        require(_riskLevel >= 1 && _riskLevel <= 3, "Invalid risk level");
        require(_confidence >= 1 && _confidence <= 100, "Invalid confidence");

        AIAnalysis memory analysis = AIAnalysis({
            sentiment: _sentiment,
            riskLevel: _riskLevel,
            recommendation: _recommendation,
            confidence: _confidence,
            analysis: _analysis,
            timestamp: block.timestamp
        });

        latestAnalysis[_user] = analysis;

        emit AIAnalysisSubmitted(_user, _sentiment, _riskLevel, _confidence);

        // Generate specific rebalancing recommendations
        _generateRebalanceRecommendations(_user, analysis);
    }

    /**
     * @dev Update market data
     */
    function updateMarketData(
        uint256 _ethPrice,
        uint256 _btcPrice,
        uint256 _sttPrice,
        uint256 _usdcPrice,
        int256 _marketSentimentScore
    ) external onlyAuthorizedAnalyst {
        require(_marketSentimentScore >= -100 && _marketSentimentScore <= 100, "Invalid sentiment score");

        currentMarketData = MarketData({
            ethPrice: _ethPrice,
            btcPrice: _btcPrice,
            sttPrice: _sttPrice,
            usdcPrice: _usdcPrice,
            marketSentimentScore: _marketSentimentScore,
            timestamp: block.timestamp
        });

        // Update prices in the main contract
        portfolioManager.updateTokenPrice(address(0x1), _ethPrice); // ETH placeholder
        portfolioManager.updateTokenPrice(address(0x2), _btcPrice); // BTC placeholder
        portfolioManager.updateTokenPrice(address(0x3), _sttPrice); // STT placeholder
        portfolioManager.updateTokenPrice(address(0x4), _usdcPrice); // USDC placeholder

        emit MarketDataUpdated(_ethPrice, _btcPrice, _sttPrice, uint256(_marketSentimentScore));
    }

    /**
     * @dev Generate rebalancing recommendations based on AI analysis
     */
    function _generateRebalanceRecommendations(address _user, AIAnalysis memory _analysis) internal {
        // Get current market sentiment
        int256 marketSentiment = currentMarketData.marketSentimentScore;
        
        // Generate recommendations based on sentiment and AI analysis
        if (keccak256(abi.encodePacked(_analysis.sentiment)) == keccak256(abi.encodePacked("Bullish")) && marketSentiment > 20) {
            // Bullish market: increase exposure to growth assets
            _submitRecommendation(
                _user,
                address(0x4), // USDC
                address(0x1), // ETH
                _calculateRecommendedAmount(_user, "USDC_TO_ETH"),
                "Bullish sentiment: Increase ETH exposure",
                _analysis.confidence
            );
            
            _submitRecommendation(
                _user,
                address(0x4), // USDC
                address(0x3), // STT
                _calculateRecommendedAmount(_user, "USDC_TO_STT"),
                "Somnia ecosystem growth potential",
                _analysis.confidence
            );
        } else if (keccak256(abi.encodePacked(_analysis.sentiment)) == keccak256(abi.encodePacked("Bearish")) && marketSentiment < -20) {
            // Bearish market: increase stablecoin allocation
            _submitRecommendation(
                _user,
                address(0x1), // ETH
                address(0x4), // USDC
                _calculateRecommendedAmount(_user, "ETH_TO_USDC"),
                "Bearish sentiment: Preserve capital",
                _analysis.confidence
            );
            
            _submitRecommendation(
                _user,
                address(0x2), // BTC
                address(0x4), // USDC
                _calculateRecommendedAmount(_user, "BTC_TO_USDC"),
                "Risk off: Move to stablecoins",
                _analysis.confidence
            );
        } else if (keccak256(abi.encodePacked(_analysis.recommendation)) == keccak256(abi.encodePacked("Rebalance"))) {
            // Neutral rebalancing based on risk level
            _submitRecommendation(
                _user,
                address(0x1), // ETH
                address(0x3), // STT
                _calculateRecommendedAmount(_user, "REBALANCE"),
                "Portfolio rebalancing for optimal allocation",
                _analysis.confidence
            );
        }
    }

    /**
     * @dev Submit a rebalancing recommendation to the main contract
     */
    function _submitRecommendation(
        address _user,
        address _fromToken,
        address _toToken,
        uint256 _amount,
        string memory _reason,
        uint8 _confidence
    ) internal {
        if (_amount > 0) {
            portfolioManager.submitAIRecommendation(
                _user,
                _fromToken,
                _toToken,
                _amount,
                _reason,
                _confidence
            );

            emit RecommendationSubmitted(_user, _fromToken, _toToken, _amount, _confidence);
        }
    }

    /**
     * @dev Calculate recommended amount for rebalancing (simplified logic)
     */
    function _calculateRecommendedAmount(address _user, string memory _strategy) internal view returns (uint256) {
        // Simplified calculation - in production, this would be more sophisticated
        // Get user's current portfolio balance from the main contract
        
        if (keccak256(abi.encodePacked(_strategy)) == keccak256(abi.encodePacked("USDC_TO_ETH"))) {
            uint256 usdcBalance = portfolioManager.getPortfolioBalance(_user, address(0x4));
            return usdcBalance / 10; // Recommend 10% of USDC balance
        } else if (keccak256(abi.encodePacked(_strategy)) == keccak256(abi.encodePacked("USDC_TO_STT"))) {
            uint256 usdcBalance = portfolioManager.getPortfolioBalance(_user, address(0x4));
            return usdcBalance / 20; // Recommend 5% of USDC balance
        } else if (keccak256(abi.encodePacked(_strategy)) == keccak256(abi.encodePacked("ETH_TO_USDC"))) {
            uint256 ethBalance = portfolioManager.getPortfolioBalance(_user, address(0x1));
            return ethBalance / 5; // Recommend 20% of ETH balance
        } else if (keccak256(abi.encodePacked(_strategy)) == keccak256(abi.encodePacked("BTC_TO_USDC"))) {
            uint256 btcBalance = portfolioManager.getPortfolioBalance(_user, address(0x2));
            return btcBalance / 8; // Recommend 12.5% of BTC balance
        } else {
            // Default rebalancing
            return 1000000; // 1 token (adjust decimals as needed)
        }
    }

    /**
     * @dev Get latest AI analysis for a user
     */
    function getLatestAnalysis(address _user) external view returns (AIAnalysis memory) {
        return latestAnalysis[_user];
    }

    /**
     * @dev Check if analysis is still valid
     */
    function isAnalysisValid(address _user) external view returns (bool) {
        return block.timestamp <= latestAnalysis[_user].timestamp + analysisValidityPeriod;
    }

    /**
     * @dev Set analysis validity period
     */
    function setAnalysisValidityPeriod(uint256 _period) external onlyOwner {
        analysisValidityPeriod = _period;
    }

    /**
     * @dev Set minimum confidence for auto-execution
     */
    function setMinConfidenceForAutoExecution(uint256 _confidence) external onlyOwner {
        require(_confidence >= 50 && _confidence <= 100, "Invalid confidence range");
        minConfidenceForAutoExecution = _confidence;
    }

    /**
     * @dev Emergency function to pause AI recommendations
     */
    function emergencyPause() external onlyOwner {
        // Implement pause functionality if needed
    }
}