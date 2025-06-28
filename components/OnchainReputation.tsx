'use client';

import { useState, useEffect } from 'react';
import { getOnchainReputation, getReputationLevel, getCompletionRate } from '@/lib/reputationContract';

interface OnchainReputationProps {
  creatorAddress: string;
  className?: string;
}

export default function OnchainReputation({ creatorAddress, className = '' }: OnchainReputationProps) {
  const [reputation, setReputation] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        setLoading(true);
        const rep = await getOnchainReputation(creatorAddress);
        setReputation(rep);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch reputation');
      } finally {
        setLoading(false);
      }
    };

    if (creatorAddress) {
      fetchReputation();
    }
  }, [creatorAddress]);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        Error loading reputation: {error}
      </div>
    );
  }

  if (!reputation) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        No reputation data available
      </div>
    );
  }

  const reputationLevel = getReputationLevel(reputation.score);
  const completionRate = getCompletionRate(reputation.completedRequests, reputation.completedRequests + reputation.disputedRequests);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Reputation Score */}
      <div className="flex items-center space-x-2">
        <span className={`text-lg font-semibold ${reputationLevel.color}`}>
          {reputationLevel.icon} {Number(reputation.score)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${reputationLevel.bgColor} ${reputationLevel.color}`}>
          {reputationLevel.level}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-600">Average Rating</div>
          <div className="font-semibold text-lg">
            {Number(reputation.averageRating) > 0 ? Number(reputation.averageRating).toFixed(1) : 'N/A'}
            {Number(reputation.averageRating) > 0 && <span className="text-yellow-500 ml-1">★</span>}
          </div>
          <div className="text-xs text-gray-500">
            {Number(reputation.totalRatings)} ratings
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-gray-600">Completion Rate</div>
          <div className="font-semibold text-lg">{completionRate}%</div>
          <div className="text-xs text-gray-500">
            {Number(reputation.completedRequests)}/{Number(reputation.completedRequests + reputation.disputedRequests)} completed
          </div>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Completed Requests:</span>
          <span className="font-medium">{Number(reputation.completedRequests)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Disputed Requests:</span>
          <span className="font-medium">{Number(reputation.disputedRequests)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total Requests:</span>
          <span className="font-medium">{Number(reputation.completedRequests + reputation.disputedRequests)}</span>
        </div>
      </div>

      {/* Progress Bar for Reputation Score */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-gray-600">
          <span>Reputation Score</span>
          <span>{Number(reputation.score)}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              Number(reputation.score) >= 75 ? 'bg-green-500' :
              Number(reputation.score) >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ width: `${Number(reputation.score)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
} 