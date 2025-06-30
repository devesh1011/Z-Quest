'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bounty } from '@/types/bountyTypes';
import { getBountyById } from '@/lib/supabase';
import Link from 'next/link';
import OnchainReputation from '@/components/OnchainReputation';

export default function BountyDetails() {
  const params = useParams();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchBountyDetails();
    }
  }, [params.id]);

  const fetchBountyDetails = async () => {
    try {
      const bountyId = parseInt(params.id as string);
      const data = await getBountyById(bountyId);
      setBounty(data);
    } catch (error) {
      console.error('Error fetching bounty details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-blue-600 -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-pulse">
            <span className="text-white font-bold text-xl">⏳</span>
          </div>
          <p className="text-gray-700 font-medium">Loading bounty details...</p>
        </div>
      </div>
    );
  }

  if (!bounty) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-blue-600 -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        </div>
        
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-blue-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_#000000]">
            <span className="text-white font-bold text-2xl">❌</span>
          </div>
          <h1 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">Bounty Not Found</h1>
          <p className="text-gray-700 mb-6 font-medium">The bounty you&apos;re looking for does not exist.</p>
          <Link
            href="/supporter/browse"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-blue-600 -rotate-6"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-blue-600 -rotate-12"></div>
      </div>

      {/* Header */}
      <header className="bg-white border-b-4 border-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/supporter/browse"
                className="text-gray-700 hover:text-black font-medium flex items-center"
              >
                <span className="mr-2">←</span>
                Back to Browse
              </Link>
              <h1 className="text-2xl font-black text-black uppercase tracking-wider">
                Bounty Details
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000] p-8">
          {/* Bounty Header */}
          <div className="border-b-4 border-black pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">
                  {bounty.name}
                </h1>
                <p className="text-gray-700 font-medium">
                  Created by {formatAddress(bounty.creator_address)}
                </p>
              </div>
              <div className="text-right">
                <div className="w-20 h-20 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000000]">
                  <span className="text-white font-black text-2xl">{bounty.base_price_eth}</span>
                </div>
                <p className="text-sm text-gray-700 font-medium mt-2">Base Price (ETH)</p>
              </div>
            </div>
          </div>

          {/* Bounty Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000]">
              <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Bounty Information</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-gray-700 font-medium block mb-2 uppercase tracking-wider">Contract Address:</span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg border-2 border-black flex-1 mr-3 font-medium overflow-x-auto whitespace-nowrap block" style={{ maxWidth: '100%' }}>
                      {bounty.contract_address}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(bounty.contract_address)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                      title="Copy address"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium uppercase tracking-wider">Created:</span>
                  <span className="font-black text-black">{new Date(bounty.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000]">
              <h3 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Creator Reputation</h3>
              <OnchainReputation 
                creatorAddress={bounty.creator_address} 
                className=""
              />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t-4 border-black pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/supporter/commissions/new?bounty=${bounty.id}`}
                className="flex-1 bg-blue-600 text-white text-center py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Request Work
              </Link>
              <Link
                href={`https://sepolia.basescan.org/address/${bounty.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black text-white text-center py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                title={`View ${bounty.contract_address} on Base Sepolia Explorer`}
              >
                View on Explorer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 