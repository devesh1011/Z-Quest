'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getRequestsByCreator } from '@/lib/supabase';
import { Request } from '@/types/bountyTypes';
import { StatusBadge } from '@/components/StatusBadge';
import { updateRequestStatus as updateRequestStatusOnchain } from '@/lib/reputationContract';

export default function FulfillRequests() {
  const { address } = useAccount();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');

  useEffect(() => {
    const fetchRequests = async () => {
      if (!address) return;
      
      try {
        const data = await getRequestsByCreator(address);
        setRequests(data || []);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [address]);

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-green-600 -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-20 h-20 bg-green-600 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_#000000]">
            <span className="text-white font-bold text-2xl">🔒</span>
          </div>
          <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">
            Connect Your Wallet
          </h2>
          <p className="text-gray-700 font-medium">
            Please connect your wallet to access the fulfill requests page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-green-600 -rotate-6"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-green-600 -rotate-12"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">
                Fulfill Requests
              </h1>
              <p className="text-xl text-gray-700 font-medium">
                Manage and fulfill commission requests from supporters
              </p>
            </div>
            <Link
              href="/creator/dashboard"
              className="text-green-600 hover:text-black font-black uppercase tracking-wider"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-8 shadow-[8px_8px_0px_#000000]">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Requests', count: requests.length },
              { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
              { key: 'completed', label: 'Completed', count: requests.filter(r => r.status === 'completed').length },
              { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as unknown as 'all' | 'pending' | 'completed' | 'rejected')}
                className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] transition-all duration-200
                  ${filter === tab.key
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-black hover:bg-green-50'}
                `}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000]">
          <div className="px-6 py-4 border-b-4 border-black">
            <h2 className="text-xl font-black text-black uppercase tracking-wider">
              {filter === 'all' ? 'All Requests' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Requests`}
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-pulse">
                  <span className="text-white font-bold text-xl">⏳</span>
                </div>
                <p className="text-gray-700 font-medium">Loading requests...</p>
              </div>
            ) : filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border-3 border-black rounded-xl p-6 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h3 className="text-lg font-black text-black">
                            {request.bounty?.name || 'Bounty Request'}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-4 mb-4 border-2 border-green-600">
                          <h4 className="font-black text-black mb-2 uppercase tracking-wider">Request Details:</h4>
                          <p className="text-gray-700 font-medium">{request.prompt}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 font-medium">
                          <div>
                            <span className="font-black text-black">From:</span> {formatAddress(request.supporter_address)}
                          </div>
                          <div>
                            <span className="font-black text-black">Date:</span> {new Date(request.created_at).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-black text-black">Bounty:</span> {request.bounty?.name}
                          </div>
                        </div>

                        {request.fulfilled_cid && (
                          <div className="mt-4 p-3 bg-green-100 border-2 border-green-600 rounded-xl">
                            <div className="flex items-center space-x-2">
                              <span className="text-green-600">✅</span>
                              <span className="text-green-800 font-black">Work Delivered</span>
                            </div>
                            <a
                              href={`https://gateway.pinata.cloud/ipfs/${request.fulfilled_cid}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:text-black text-sm mt-1 inline-block font-black"
                            >
                              View delivered work →
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {request.status === 'pending' && (
                          <>
                            <Link
                              href={`/creator/fulfill/${request.id}`}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm text-center"
                            >
                              Fulfill Request
                            </Link>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to reject this request?')) {
                                  try {
                                    const response = await fetch('/api/fulfill', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        requestId: request.id,
                                        creatorAddress: address,
                                        status: 'rejected' as const,
                                      }),
                                    });
                                    if (response.ok) {
                                      // Update reputation on-chain
                                      try {
                                        await updateRequestStatusOnchain(address, request.id, false);
                                        console.log('Reputation updated on-chain successfully');
                                      } catch (onchainError) {
                                        console.error('Failed to update reputation on-chain:', onchainError);
                                        // Don't fail the entire process if on-chain update fails
                                      }
                                      // Refresh the page to update the list
                                      window.location.reload();
                                    }
                                  } catch (error) {
                                    console.error('Error rejecting request:', error);
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-white text-black rounded-xl font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:bg-green-50 hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'completed' && (
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-black">
                            Completed
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="px-3 py-1 bg-white text-black border-2 border-black rounded-full text-sm font-black">
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-green-100 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                  <span className="text-2xl">📋</span>
                </div>
                <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">
                  No {filter === 'all' ? '' : filter} requests found
                </h3>
                <p className="text-gray-700 mb-6 font-medium">
                  {filter === 'pending' 
                    ? 'You have no pending requests to fulfill.'
                    : filter === 'completed'
                    ? 'You have not completed any requests yet.'
                    : filter === 'rejected'
                    ? 'You have not rejected any requests.'
                    : 'You have not received any requests yet.'
                  }
                </p>
                <Link
                  href="/creator/dashboard"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-xl font-black text-black mb-6 uppercase tracking-wider">How to Fulfill Requests</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Review Request</h3>
                <p className="text-sm text-gray-700 font-medium">Read the supporter&apos;s requirements and understand what they need</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Create Work</h3>
                <p className="text-sm text-gray-700 font-medium">Complete the requested work according to specifications</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Upload & Deliver</h3>
                <p className="text-sm text-gray-700 font-medium">Upload work to IPFS and mark request as fulfilled</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 