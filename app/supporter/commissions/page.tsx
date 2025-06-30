'use client';

import { useEffect, useState } from 'react';
import { Request } from '@/types/bountyTypes';
import { getRequestsBySupporter } from '@/lib/supabase';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';

export default function Commissions() {
  const { address, isConnected } = useAccount();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      fetchRequests();
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const fetchRequests = async () => {
    try {
      const data = await getRequestsBySupporter(address!);
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

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
                className="inline-flex items-center text-blue-600 hover:text-black font-black uppercase tracking-wider transition-colors"
              >
                <span className="mr-2">←</span>
                Back to Browse
              </Link>
              <h1 className="text-3xl font-black text-black uppercase tracking-wider">
                My Commissions
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Add ConnectButton if needed */}
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!isConnected ? (
          <div className="text-center py-16 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000]">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-wider">
              Connect Your Wallet
            </h2>
            <p className="text-gray-700 mb-6 font-medium">
              Please connect your wallet to view your commissions.
            </p>
            <ConnectButton />
          </div>
        ) : loading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-spin">
              <span className="text-white font-bold text-2xl">⏳</span>
            </div>
            <p className="mt-4 text-gray-700 font-medium">Loading your commissions...</p>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-8">
            {requests.map((request) => (
              <div key={request.id} className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000] p-8">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-black text-black mb-1 uppercase tracking-wider">
                      {request.bounty?.name || 'Unknown Bounty'}
                    </h3>
                    <p className="text-sm text-gray-700 font-medium">
                      Creator: <span className="font-mono">{formatAddress(request.bounty?.creator_address || '')}</span>
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] ${getStatusColor(request.status)}`}>
                    {getStatusText(request.status)}
                  </span>
                </div>

                <div className="mb-6">
                  <h4 className="text-sm font-black text-black mb-2 uppercase tracking-wider">Your Request:</h4>
                  <p className="text-gray-700 text-base bg-gray-50 border-2 border-black rounded-xl p-4 font-medium">
                    {request.prompt}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-700 font-medium">
                  <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                  {request.fulfilled_cid && (
                    <Link
                      href={`https://gateway.pinata.cloud/ipfs/${request.fulfilled_cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                    >
                      View Result →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000]">
            <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-wider">
              No Commissions Yet
            </h2>
            <p className="text-gray-700 mb-6 font-medium">
              You haven&apos;t made any commission requests yet.
            </p>
            <Link
              href="/supporter/browse"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              Browse Bounties
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 