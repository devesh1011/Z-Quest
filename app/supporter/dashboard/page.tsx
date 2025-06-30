'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { getSupporterRequests } from '@/lib/supabase';
import { Request } from '@/types/bountyTypes';
import { transferTokens } from '@/lib/zoraSDK';
import { updateRequestStatus as updateRequestStatusOnchain } from '@/lib/reputationContract';
import Link from 'next/link';

export default function SupporterDashboard() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasingPayment, setReleasingPayment] = useState<string | null>(null);
  const [respecting, setRespecting] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      loadRequests();
    }
  }, [address]);

  const loadRequests = async () => {
    if (!address) return;
    
    try {
      setLoading(true);
      const supporterRequests = await getSupporterRequests(address);
      setRequests(supporterRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const releasePayment = async (request: Request) => {
    if (!address || !request.bounty) return;
    try {
      setReleasingPayment(request.id);
      // 1. Do the on-chain transfer from the client
      const tx = await transferTokens(
        request.bounty.contract_address,
        address,
        request.bounty.creator_address,
        request.bounty.base_price_eth
      );
      // 2. Call your API to update the status in Supabase
      const response = await fetch('/api/release-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          txHash: tx.hash,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update payment status');
      }
      await loadRequests();
      alert('Payment released successfully!');
    } catch (error) {
      console.error('Error releasing payment:', error);
      alert(`Failed to release payment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setReleasingPayment(null);
    }
  };

  const handleRespect = async (request: Request) => {
    console.log('Respect++ clicked', request, address);
    if (!address || !request.bounty) return;
    try {
      setRespecting(request.id);
      // Call on-chain reputation update (completed = true)
      await updateRequestStatusOnchain(
        request.bounty.creator_address,
        request.id,
        true
      );
      alert('Respect++ sent! Reputation updated on-chain.');
      await loadRequests();
    } catch (error) {
      console.error('Error sending Respect++:', error);
      alert(`Failed to send Respect++: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRespecting(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      paid: 'bg-blue-100 text-blue-800',
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-black rounded-full uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
          <p className="text-gray-700 font-medium">Loading your requests...</p>
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">My Requests</h1>
          <p className="text-xl text-gray-700 font-medium">
            Review and manage your bounty requests
          </p>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
              <span className="text-white font-bold text-2xl">📋</span>
            </div>
            <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">No requests found</h3>
            <p className="text-gray-700 mb-6 font-medium">
              You haven&apos;t made any bounty requests yet.
            </p>
            <div className="mt-6">
              <Link
                href="/supporter/browse"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Browse Bounties
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000]">
            <ul className="divide-y-2 divide-black">
              {requests.map((request) => (
                <li key={request.id} className="">
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-lg font-black text-black truncate uppercase tracking-wider">
                            {request.bounty?.name || 'Bounty Request'}
                          </p>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(request.status)}
                            {request.bounty && (
                              <span className="text-sm text-black font-black">
                                {request.bounty.base_price_eth} ETH
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-700 font-medium">
                            <span className="font-black text-black">Prompt:</span> {request.prompt}
                          </p>
                          {request.fulfilled_cid && (
                            <p className="text-sm text-gray-700 font-medium mt-1">
                              <span className="font-black text-black">Fulfillment:</span>{' '}
                              <a
                                href={`https://gateway.pinata.cloud/ipfs/${request.fulfilled_cid}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-black underline font-black"
                              >
                                View Content
                              </a>
                            </p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            Created: {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        {request.status === 'completed' && (
                          <button
                            onClick={() => releasePayment(request)}
                            disabled={releasingPayment === request.id}
                            className="inline-flex items-center px-6 py-3 border-3 border-black text-sm font-black rounded-xl text-white bg-blue-600 hover:bg-black hover:text-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                            {releasingPayment === request.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Releasing...
                              </>
                            ) : (
                              'Release Payment'
                            )}
                          </button>
                        )}
                        {request.status === 'paid' && (
                          <button
                            onClick={() => handleRespect(request)}
                            disabled={respecting === request.id}
                            className="inline-flex items-center px-6 py-3 border-3 border-black text-sm font-black rounded-xl text-white bg-green-600 hover:bg-black hover:text-white shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
                          >
                            {respecting === request.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Respecting...
                              </>
                            ) : (
                              'Respect++'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
} 