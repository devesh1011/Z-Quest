'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { getBounties } from '@/lib/supabase';
import { Bounty } from '@/types/bountyTypes';
import { Contract, BrowserProvider } from 'ethers';

export default function BrowseBounties() {
  const { address } = useAccount();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [eligibility, setEligibility] = useState<Record<number, boolean>>({});
  const [balances, setBalances] = useState<Record<number, string>>({});
  const [decimalsMap, setDecimalsMap] = useState<Record<number, number>>({});

  useEffect(() => {
    const fetchBounties = async () => {
      try {
        const data = await getBounties();
        setBounties(data || []);
      } catch (error) {
        console.error('Error fetching bounties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBounties();
  }, []);

  useEffect(() => {
    if (!address || bounties.length === 0) return;
    const checkAllBalances = async () => {
      const newEligibility: Record<number, boolean> = {};
      const newBalances: Record<number, string> = {};
      const newDecimals: Record<number, number> = {};
      for (const bounty of bounties) {
        try {
          const provider = (window as unknown as { ethereum?: unknown }).ethereum;
          if (!provider) continue;
          const ethersProvider = new BrowserProvider(provider);
          const erc20 = new Contract(bounty.contract_address, [
            "function balanceOf(address) view returns (uint256)",
            "function decimals() view returns (uint8)"
          ], ethersProvider);
          const [balance, decimals] = await Promise.all([
            erc20.balanceOf(address),
            erc20.decimals()
          ]);
          newBalances[bounty.id] = balance.toString();
          newDecimals[bounty.id] = decimals;
          const minRequired = BigInt(bounty.minimum_tokens_required || 0);
          newEligibility[bounty.id] = BigInt(balance.toString()) >= minRequired;
        } catch {
          newBalances[bounty.id] = '0';
          newDecimals[bounty.id] = 18;
          newEligibility[bounty.id] = false;
        }
      }
      setEligibility(newEligibility);
      setBalances(newBalances);
      setDecimalsMap(newDecimals);
    };
    checkAllBalances();
  }, [address, bounties]);

  function formatTokenAmount(balance: string, decimals: number | bigint) {
    if (!balance) return '0';
    const value = BigInt(balance);
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    if (fraction === 0n) return whole.toString();
    // Always cast decimals to number for padStart
    const fractionStr = fraction.toString().padStart(Number(decimals), '0').slice(0, 4);
    return `${whole.toString()}.${fractionStr}`;
  }

  const filteredBounties = bounties.filter(bounty =>
    bounty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bounty.creator_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">
            Browse Bounties
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Discover creators and commission custom work with their tokens
          </p>
        </div>

        {/* Search and Stats */}
        <div className="bg-white border-4 border-black rounded-2xl p-6 mb-8 shadow-[8px_8px_0px_#000000]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search bounties or creators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-3 border-black text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-600 font-bold">🔍</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-700 font-medium">
              {filteredBounties.length} of {bounties.length} bounties
            </div>
          </div>
        </div>

        {/* Bounties Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-pulse">
              <span className="text-white font-bold text-xl">⏳</span>
            </div>
            <p className="text-gray-700 font-medium">Loading bounties...</p>
          </div>
        ) : filteredBounties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBounties.map((bounty) => (
              <div
                key={bounty.id}
                className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wider">
                        {bounty.name}
                      </h3>
                      <p className="text-sm text-gray-700 font-medium mb-3">
                        Bounty for {bounty.name} services
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_#000000]">
                      <span className="text-white font-bold text-sm">Z</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">Base Price:</span>
                      <span className="font-black text-black">{bounty.base_price_eth} ETH</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">Creator:</span>
                      <span className="font-mono font-black text-black">{formatAddress(bounty.creator_address)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 font-medium">Created:</span>
                      <span className="text-black font-medium">{new Date(bounty.created_at).toLocaleDateString()}</span>
                    </div>
                    {address && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">Your Token Balance:</span>
                        <span className="font-black text-black">{formatTokenAmount(balances[bounty.id] || '0', decimalsMap[bounty.id] || 18)}</span>
                      </div>
                    )}
                    {address && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">Minimum Required:</span>
                        <span className="font-black text-black">{bounty.minimum_tokens_required || 0}</span>
                      </div>
                    )}
                    {address && (
                      eligibility[bounty.id] ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 font-black rounded-full border-2 border-green-600 text-xs">Eligible to Request</span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-red-100 text-red-800 font-black rounded-full border-2 border-red-600 text-xs">Not Eligible</span>
                      )
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      href={`/supporter/browse/${bounty.id}`}
                      className="flex-1 text-center px-4 py-2 bg-white text-black rounded-lg font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/supporter/commissions/new?bountyId=${bounty.id}`}
                      className="flex-1 text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                    >
                      Request Work
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
              <span className="text-white font-bold text-2xl">🔍</span>
            </div>
            <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">
              {searchTerm ? 'No bounties found' : 'No bounties available'}
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              {searchTerm 
                ? 'Try adjusting your search terms or browse all bounties.'
                : 'Be the first to create a bounty and start earning!'
              }
            </p>
            {!searchTerm && (
              <Link
                href="/creator/new-bounty"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                <span className="mr-2">✨</span>
                Create First Bounty
              </Link>
            )}
          </div>
        )}

        {/* How It Works for Supporters */}
        {/* <div className="mt-12 bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-3xl font-black text-black mb-8 text-center uppercase tracking-wider">
            How to Commission Work
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wider">Browse Bounties</h3>
              <p className="text-gray-700 font-medium">
                Explore available creator bounties and find the perfect match for your project.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wider">Mint Tokens</h3>
              <p className="text-gray-700 font-medium">
                Mint the creator's tokens to request work. Each token represents a commission request.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-bold text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-black text-black mb-2 uppercase tracking-wider">Receive Work</h3>
              <p className="text-gray-700 font-medium">
                Track progress and receive your completed work stored permanently on IPFS.
              </p>
            </div>
          </div>
        </div> */}

        {/* Benefits Section */}
        {/* <div className="mt-8 bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_#000000]">
          <h2 className="text-xl font-black text-black mb-6 uppercase tracking-wider">Why Commission on Zora Bounty?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-sm">🔗</span>
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">On-Chain Guarantee</h3>
                <p className="text-sm text-gray-700 font-medium">All transactions are secured on Base Sepolia blockchain</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-black border-3 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-sm">💾</span>
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Permanent Storage</h3>
                <p className="text-sm text-gray-700 font-medium">All work is stored permanently on decentralized IPFS</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-sm">⭐</span>
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Creator Reputation</h3>
                <p className="text-sm text-gray-700 font-medium">Choose creators based on their on-chain reputation</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-black border-3 border-black rounded-xl flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-sm">🎯</span>
              </div>
              <div>
                <h3 className="font-black text-black uppercase tracking-wider">Direct Support</h3>
                <p className="text-sm text-gray-700 font-medium">Support creators directly with no intermediaries</p>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
} 