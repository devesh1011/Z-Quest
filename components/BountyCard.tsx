'use client';

import { Bounty } from '@/types/bountyTypes';
import Link from 'next/link';
import OnchainReputation from './OnchainReputation';

interface BountyCardProps {
  bounty: Bounty;
  showCreator?: boolean;
  showActions?: boolean;
}

export function BountyCard({ bounty, showCreator = true, showActions = true }: BountyCardProps) {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => {
    return `${price} ETH`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {bounty.name}
          </h3>
          {showCreator && (
            <p className="text-sm text-gray-600">
              by {formatAddress(bounty.creator_address)}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-green-600">
            {formatPrice(bounty.base_price_eth)}
          </p>
          <p className="text-xs text-gray-500">
            Base Price
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Contract:</span>
          <span className="font-mono">{formatAddress(bounty.contract_address)}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Created:</span>
          <span>{new Date(bounty.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      {bounty.creator_address && (
        <div className="mb-4">
          <OnchainReputation 
            creatorAddress={bounty.creator_address} 
            className="p-3 bg-gray-50 rounded-md"
          />
        </div>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Link
            href={`/supporter/browse/${bounty.id}`}
            className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          <Link
            href={`/supporter/commissions/new?bounty=${bounty.id}`}
            className="flex-1 bg-green-600 text-white text-center py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
          >
            Request Work
          </Link>
        </div>
      )}
    </div>
  );
} 