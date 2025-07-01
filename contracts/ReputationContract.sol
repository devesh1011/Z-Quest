// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ReputationContract
 * @dev On-chain reputation system for Zora Bounty Board creators
 */
contract ReputationContract is Ownable {
    struct CreatorReputation {
        uint256 score;              // 0-100 reputation score
        uint256 totalRatings;       // Total number of ratings received
        uint256 completedRequests;  // Number of completed requests
        uint256 disputedRequests;   // Number of disputed/rejected requests
        uint256 totalRatingSum;     // Sum of all ratings (for average calculation)
        uint256 ratingCount;        // Counter for ratings
        bool exists;                // Whether creator exists in the system
    }

    struct Rating {
        address supporter;
        uint8 rating;           // 1-5 stars
        string comment;
        uint256 timestamp;
        bool exists;
    }

    // Mapping from creator address to their reputation data
    mapping(address => CreatorReputation) public creatorReputations;
    
    // Mapping from creator address to their ratings
    mapping(address => mapping(uint256 => Rating)) public ratings;
    
    // Mapping to track if a supporter has already rated a creator for a specific request
    mapping(bytes32 => bool) public hasRated;

    // Events
    event ReputationUpdated(address indexed creator, uint256 newScore, uint256 completedRequests, uint256 disputedRequests);
    event RatingSubmitted(address indexed creator, address indexed supporter, uint8 rating, string comment);
    event RequestStatusUpdated(address indexed creator, string requestId, bool completed);

    // Constants
    uint256 public constant MAX_SCORE = 100;
    uint256 public constant MIN_SCORE = 0;
    uint256 public constant SCORE_INCREMENT = 5;
    uint256 public constant SCORE_DECREMENT = 10;
    uint8 public constant MAX_RATING = 5;
    uint8 public constant MIN_RATING = 1;

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Submit a rating for a creator
     * @param creator The address of the creator being rated
     * @param rating The rating (1-5 stars)
     * @param comment Optional comment about the work
     * @param requestId Unique identifier for the request to prevent double rating
     */
    function submitRating(
        address creator,
        uint8 rating,
        string memory comment,
        string memory requestId
    ) external {
        require(creator != address(0), "Invalid creator address");
        require(rating >= MIN_RATING && rating <= MAX_RATING, "Rating must be between 1 and 5");
        require(bytes(comment).length <= 500, "Comment too long");
        
        // Create unique key to prevent double rating
        bytes32 ratingKey = keccak256(abi.encodePacked(creator, msg.sender, requestId));
        require(!hasRated[ratingKey], "Already rated this request");
        
        // Mark as rated
        hasRated[ratingKey] = true;
        
        // Get current rating count for this creator
        CreatorReputation storage reputation = creatorReputations[creator];
        if (!reputation.exists) {
            reputation.score = 50; // Default starting score
            reputation.exists = true;
        }
        uint256 ratingId = reputation.ratingCount;
        
        // Store the rating
        ratings[creator][ratingId] = Rating({
            supporter: msg.sender,
            rating: rating,
            comment: comment,
            timestamp: block.timestamp,
            exists: true
        });
        
        // Increment rating counter
        reputation.ratingCount++;
        
        // Update rating statistics
        reputation.totalRatings++;
        reputation.totalRatingSum += rating;
        
        // Emit event
        emit RatingSubmitted(creator, msg.sender, rating, comment);
    }

    /**
     * @dev Update request status (can be called by anyone to update a creator's reputation)
     * @param creator The address of the creator whose reputation is being updated
     * @param requestId Unique identifier for the request
     * @param completed Whether the request was completed successfully
     */
    function updateRequestStatus(address creator, string memory requestId, bool completed) external {
        require(creator != address(0), "Invalid creator address");
        CreatorReputation storage reputation = creatorReputations[creator];
        if (!reputation.exists) {
            reputation.score = 50; // Default starting score
            reputation.exists = true;
        }
        if (completed) {
            reputation.completedRequests++;
            // Increase score, but cap at MAX_SCORE
            reputation.score = reputation.score + SCORE_INCREMENT > MAX_SCORE 
                ? MAX_SCORE 
                : reputation.score + SCORE_INCREMENT;
        } else {
            reputation.disputedRequests++;
            // Decrease score, but don't go below MIN_SCORE
            reputation.score = reputation.score > SCORE_DECREMENT 
                ? reputation.score - SCORE_DECREMENT 
                : MIN_SCORE;
        }
        // Emit event
        emit RequestStatusUpdated(creator, requestId, completed);
        emit ReputationUpdated(creator, reputation.score, reputation.completedRequests, reputation.disputedRequests);
    }

    /**
     * @dev Get creator's reputation data
     * @param creator The address of the creator
     * @return score Current reputation score (0-100)
     * @return totalRatings Total number of ratings received
     * @return completedRequests Number of completed requests
     * @return disputedRequests Number of disputed requests
     */
    function getReputation(address creator) external view returns (
        uint256 score,
        uint256 totalRatings,
        uint256 completedRequests,
        uint256 disputedRequests
    ) {
        CreatorReputation storage reputation = creatorReputations[creator];
        return (
            reputation.exists ? reputation.score : 50,
            reputation.totalRatings,
            reputation.completedRequests,
            reputation.disputedRequests
        );
    }

    /**
     * @dev Get average rating for a creator
     * @param creator The address of the creator
     * @return Average rating (0 if no ratings)
     */
    function getAverageRating(address creator) external view returns (uint256) {
        CreatorReputation storage reputation = creatorReputations[creator];
        if (reputation.totalRatings == 0) {
            return 0;
        }
        return reputation.totalRatingSum / reputation.totalRatings;
    }

    /**
     * @dev Get a specific rating by ID
     * @param creator The address of the creator
     * @param ratingId The ID of the rating
     * @return supporter Address of the supporter who gave the rating
     * @return rating The rating value (1-5)
     * @return comment The comment provided
     * @return timestamp When the rating was submitted
     */
    function getRating(address creator, uint256 ratingId) external view returns (
        address supporter,
        uint8 rating,
        string memory comment,
        uint256 timestamp
    ) {
        Rating storage ratingData = ratings[creator][ratingId];
        require(ratingData.exists, "Rating does not exist");
        return (
            ratingData.supporter,
            ratingData.rating,
            ratingData.comment,
            ratingData.timestamp
        );
    }

    /**
     * @dev Get total number of ratings for a creator
     * @param creator The address of the creator
     * @return Total number of ratings
     */
    function getRatingCount(address creator) external view returns (uint256) {
        return creatorReputations[creator].ratingCount;
    }

    /**
     * @dev Calculate completion rate for a creator
     * @param creator The address of the creator
     * @return Completion rate as percentage (0-100)
     */
    function getCompletionRate(address creator) external view returns (uint256) {
        CreatorReputation storage reputation = creatorReputations[creator];
        uint256 totalRequests = reputation.completedRequests + reputation.disputedRequests;
        if (totalRequests == 0) {
            return 0;
        }
        return (reputation.completedRequests * 100) / totalRequests;
    }

    /**
     * @dev Check if a creator exists in the system
     * @param creator The address of the creator
     * @return Whether the creator exists
     */
    function creatorExists(address creator) external view returns (bool) {
        return creatorReputations[creator].exists;
    }

    /**
     * @dev Emergency function to reset a creator's reputation (owner only)
     * @param creator The address of the creator to reset
     */
    function emergencyResetReputation(address creator) external onlyOwner {
        delete creatorReputations[creator];
    }
} 