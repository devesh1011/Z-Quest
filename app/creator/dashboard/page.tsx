'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getBountiesByCreator, getRequestsByCreator } from '@/lib/supabase';
import { Bounty, Request } from '@/types/bountyTypes';
import { StatusBadge } from '@/components/StatusBadge';
import OnchainReputation from '@/components/OnchainReputation';

export default function CreatorDashboard() {
  const { address } = useAccount();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBounties: 0,
    activeRequests: 0,
    totalEarnings: 0,
  });
  const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [removingBounty, setRemovingBounty] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      
      try {
        const [bountiesData, requestsData] = await Promise.all([
          getBountiesByCreator(address),
          getRequestsByCreator(address)
        ]);
        
        setBounties(bountiesData || []);
        setRequests(requestsData || []);
        
        // Calculate stats
        const activeRequests = requestsData?.filter(r => r.status === 'pending').length || 0;
        setStats({
          totalBounties: bountiesData?.length || 0,
          activeRequests,
          totalEarnings: 0, // We'll calculate this separately
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [address]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleManageClick = (bounty: Bounty) => {
    setSelectedBounty(bounty);
    setShowModal(true);
  };

  const handleRemoveBounty = async () => {
    if (!selectedBounty) return;
    
    try {
      setRemovingBounty(true);
      // TODO: Implement bounty removal logic
      // This would typically involve:
      // 1. Checking if there are any pending requests
      // 2. If no pending requests, allow removal
      // 3. Update the database to mark bounty as inactive/deleted
      
      // For now, just show a placeholder message
      alert('Bounty removal functionality will be implemented soon!');
      setShowModal(false);
      setSelectedBounty(null);
    } catch (error) {
      console.error('Error removing bounty:', error);
      alert('Failed to remove bounty. Please try again.');
    } finally {
      setRemovingBounty(false);
    }
  };

  const handleViewRequests = () => {
    if (!selectedBounty) return;
    setShowModal(false);
    setSelectedBounty(null);
    // Navigate to fulfill page which shows all requests
    window.location.href = '/creator/fulfill';
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBounty(null);
  };

  if (!address) {
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
            <span className="text-white font-bold text-2xl">🔒</span>
          </div>
          <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">
            Connect Your Wallet
          </h2>
          <p className="text-gray-700 font-medium">
            Please connect your wallet to access the creator dashboard.
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
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-blue-600 -rotate-6"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-blue-600 -rotate-12"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">
            Creator Dashboard
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Manage your bounties and track your earnings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center mr-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-xl">✨</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wider">Total Bounties</p>
                <p className="text-2xl font-black text-black">{stats.totalBounties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-black border-3 border-black rounded-xl flex items-center justify-center mr-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-xl">📋</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wider">Active Requests</p>
                <p className="text-2xl font-black text-black">{stats.activeRequests}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center mr-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 uppercase tracking-wider">Total Earnings</p>
                <p className="text-2xl font-black text-black">{stats.totalEarnings} ETH</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Section */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-8 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Your Reputation</h2>
          <OnchainReputation creatorAddress={address} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-8 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/creator/new-bounty"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
            >
              <span className="mr-2">✨</span>
              Create New Bounty
            </Link>
            {stats.activeRequests > 0 && (
              <Link
                href="/creator/fulfill"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="mr-2">✅</span>
                Fulfill Requests ({stats.activeRequests})
              </Link>
            )}
          </div>
        </div>

        {/* Active Requests Section */}
        {stats.activeRequests > 0 && (
          <div className="bg-white border-4 border-black rounded-2xl mb-8 shadow-[8px_8px_0px_#000000]">
            <div className="px-6 py-4 border-b-4 border-black">
              <h2 className="text-xl font-black text-black uppercase tracking-wider">Active Requests</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {requests.filter(r => r.status === 'pending').slice(0, 3).map((request) => (
                  <div
                    key={request.id}
                    className="border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-black text-black">
                            {request.bounty?.name || 'Bounty Request'}
                          </h3>
                          <StatusBadge status={request.status} />
                        </div>
                        <p className="text-gray-700 mb-3 font-medium">{request.prompt}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
                          <span>From: {formatAddress(request.supporter_address)}</span>
                          <span>Date: {new Date(request.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/creator/fulfill/${request.id}`}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                        >
                          Fulfill
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
                {requests.filter(r => r.status === 'pending').length > 3 && (
                  <div className="text-center pt-4">
                    <Link
                      href="/creator/fulfill"
                      className="text-blue-600 hover:text-blue-800 font-black uppercase tracking-wider"
                    >
                      View all {requests.filter(r => r.status === 'pending').length} requests →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Bounties Section */}
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000]">
          <div className="px-6 py-4 border-b-4 border-black">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-black uppercase tracking-wider">Your Bounties</h2>
              {bounties.length > 0 && (
                <Link
                  href="/creator/new-bounty"
                  className="text-sm text-blue-600 hover:text-blue-800 font-black uppercase tracking-wider"
                >
                  + Add New
                </Link>
              )}
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-pulse">
                  <span className="text-white font-bold text-xl">⏳</span>
                </div>
                <p className="text-gray-700 font-medium">Loading your bounties...</p>
              </div>
            ) : bounties.length > 0 ? (
              <div className="space-y-4">
                {bounties.map((bounty) => (
                  <div
                    key={bounty.id}
                    className="border-3 border-black rounded-xl p-4 shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-black text-black">
                            {bounty.name}
                          </h3>
                          <span className="px-3 py-1 text-xs font-black bg-blue-600 text-white rounded-lg uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000]">
                            Active
                          </span>
                        </div>
                        <p className="text-gray-700 mb-3 font-medium">Bounty for {bounty.name}</p>
                        <div className="flex items-center space-x-6 text-sm text-gray-600 font-medium">
                          <span>Base Price: {bounty.base_price_eth} ETH</span>
                          <span>Contract: {bounty.contract_address.slice(0, 8)}...{bounty.contract_address.slice(-6)}</span>
                          <span>Created: {new Date(bounty.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleManageClick(bounty)}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                  <span className="text-white font-bold text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">
                  No bounties yet
                </h3>
                <p className="text-gray-700 mb-6 font-medium">
                  Create your first bounty to start earning from your creative services.
                </p>
                <Link
                  href="/creator/new-bounty"
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
                >
                  <span className="mr-2">✨</span>
                  Create Your First Bounty
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Workflow Guide */}
        <div className="mt-8 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-xl font-black text-black mb-6 uppercase tracking-wider">Creator Workflow</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Create Bounty</h3>
                <p className="text-sm text-gray-700 font-medium">Deploy a custom ERC-20 token for your services</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Receive Requests</h3>
                <p className="text-sm text-gray-700 font-medium">Supporters mint tokens to request your work</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center text-sm font-black border-3 border-black shadow-[3px_3px_0px_#000000] flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Deliver & Earn</h3>
                <p className="text-sm text-gray-700 font-medium">Upload work to IPFS and receive payments</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Bounty Modal */}
      {showModal && selectedBounty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black rounded-2xl p-6 max-w-md w-full shadow-[8px_8px_0px_#000000]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-black uppercase tracking-wider">
                Manage Bounty
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black font-black text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <h4 className="text-lg font-black text-black mb-2">
                {selectedBounty.name}
              </h4>
              <p className="text-gray-700 font-medium">
                Base Price: {selectedBounty.base_price_eth} ETH
              </p>
              <p className="text-sm text-gray-600 font-medium">
                Contract: {selectedBounty.contract_address.slice(0, 8)}...{selectedBounty.contract_address.slice(-6)}
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleViewRequests}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="mr-2">📋</span>
                View Requests
              </button>
              
              <button
                onClick={handleRemoveBounty}
                disabled={removingBounty}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {removingBounty ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Removing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🗑️</span>
                    Remove Bounty
                  </>
                )}
              </button>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-black">
              <button
                onClick={closeModal}
                className="w-full px-6 py-3 bg-gray-200 text-black rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 