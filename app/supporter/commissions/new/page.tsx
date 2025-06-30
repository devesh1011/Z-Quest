'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Bounty } from '@/types/bountyTypes';
import { getBountyById, createRequest } from '@/lib/supabase';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { Contract, BrowserProvider } from 'ethers';
import Link from 'next/link';

export default function NewCommission() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [eligible, setEligible] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [faucetLoading, setFaucetLoading] = useState(false);

  const bountyId = searchParams.get('bounty');

  useEffect(() => {
    if (bountyId) {
      fetchBountyDetails();
    } else {
      setError('No bounty specified');
      setLoading(false);
    }
  }, [bountyId]);

  useEffect(() => {
    if (bounty && address) {
      (async () => {
        try {
          const provider = (window as unknown as { ethereum: unknown }).ethereum;
          if (!provider) return;
          const ethersProvider = new BrowserProvider(provider);
          const erc20 = new Contract(bounty.contract_address, ["function balanceOf(address) view returns (uint256)"], ethersProvider);
          const balance = await erc20.balanceOf(address);
          setTokenBalance(balance.toString());
          const minRequired = BigInt(bounty.minimum_tokens_required || 0);
          setEligible(BigInt(balance.toString()) >= minRequired);
        } catch {
          setTokenBalance('0');
          setEligible(false);
        }
      })();
    }
  }, [bounty, address]);

  const fetchBountyDetails = async () => {
    try {
      const data = await getBountyById(parseInt(bountyId!));
      setBounty(data);
    } catch (error) {
      console.error('Error fetching bounty details:', error);
      setError('Failed to load bounty details');
    } finally {
      setLoading(false);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Starting request submission...');
    
    if (!isConnected || !address) {
      console.error('❌ Wallet not connected');
      setError('Please connect your wallet first');
      return;
    }

    if (!prompt.trim()) {
      console.error('❌ No prompt provided');
      setError('Please enter a prompt');
      return;
    }

    console.log('✅ Validation passed');
    console.log('📋 Bounty details:', {
      id: bounty!.id,
      name: bounty!.name,
      contract_address: bounty!.contract_address,
      base_price_eth: bounty!.base_price_eth
    });
    console.log('👤 Supporter address:', address);
    console.log('📝 Prompt:', prompt.trim());

    setSubmitting(true);
    setError('');

    try {
      // Only create request in database, skip minting tokens
      const dbResult = await createRequest({
        bounty_id: bounty!.id,
        supporter_address: address,
        prompt: prompt.trim(),
        tx_hash: '' // No mint transaction hash for now
      });

      console.log('✅ Database request created');
      console.log('📊 Database result:', dbResult);

      // Show success message
      alert('Request created successfully!');
      
      // Redirect to commissions page
      console.log('🔄 Redirecting to commissions page...');
      router.push('/supporter/commissions');
    } catch {
      setError('Failed to create request. Please try again.');
    } finally {
      console.log('🏁 Request submission completed');
      setSubmitting(false);
    }
  };

  const handleGetTokens = async () => {
    if (!bounty || !address) return;
    setFaucetLoading(true);
    setError('');
    try {
      // Call your backend faucet API (implement this endpoint to send tokens)
      const res = await fetch(`/api/faucet?contract=${bounty.contract_address}&to=${address}&amount=${bounty.minimum_tokens_required}`);
      if (!res.ok) throw new Error('Faucet request failed');
      alert('Tokens sent! Please wait a few seconds and refresh.');
      // Optionally, re-check balance after a delay
      setTimeout(() => window.location.reload(), 5000);
    } catch {
      setError('Failed to get tokens from faucet.');
    } finally {
      setFaucetLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatPrice = (price: number) => {
    return `${price} ETH`;
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

  if (error && !bounty) {
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
          <h1 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">Error</h1>
          <p className="text-gray-700 mb-6 font-medium">{error}</p>
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

  if (bounty && !eligible) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="text-center z-10">
          <h2 className="text-2xl font-black text-black mb-4 uppercase tracking-wider">Not Enough Bounty Tokens</h2>
          <p className="text-gray-700 mb-4 font-medium">
            You need at least {bounty.minimum_tokens_required} tokens to submit a request.<br/>
            Your balance: {tokenBalance}
          </p>
          <button
            onClick={handleGetTokens}
            disabled={faucetLoading}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {faucetLoading ? 'Sending...' : 'Get Bounty Tokens'}
          </button>
          {error && <p className="text-red-600 mt-2">{error}</p>}
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
                Request Work
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_#000000] p-8">
          {/* Bounty Summary */}
          <div className="border-b-4 border-black pb-6 mb-6">
            <h2 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Bounty Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Bounty Name</p>
                <p className="font-black text-black">{bounty!.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Creator</p>
                <p className="font-black text-black">{formatAddress(bounty!.creator_address)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Base Price</p>
                <p className="font-black text-black">{formatPrice(bounty!.base_price_eth)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Contract</p>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg border-2 border-black flex-1 mr-3 font-medium overflow-x-auto text-black whitespace-nowrap block" style={{ maxWidth: '100%' }}>
                    {bounty!.contract_address}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(bounty!.contract_address)}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                      title="Copy address"
                    >
                      Copy
                    </button>
                    <Link
                      href={`https://sepolia.basescan.org/address/${bounty!.contract_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-black text-white rounded-lg font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-[4px_4px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 text-sm"
                      title="View on Explorer"
                    >
                      Explorer
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Request Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="prompt" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                Describe what you want
              </label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={6}
                className="w-full px-3 text-black py-2 border-3 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 font-medium"
                placeholder="Describe the work you want the creator to do. Be as specific as possible..."
                required
              />
              <p className="mt-2 text-sm text-gray-700 font-medium">
                Be clear and specific about your requirements. The more detail you provide, the better the creator can understand your needs.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4">
                <p className="text-red-800 text-sm font-black">{error}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={!eligible || submitting}
                className="flex-1 bg-blue-600 text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Minting Tokens...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
              <Link
                href="/supporter/browse"
                className="flex-1 bg-black text-white text-center py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Cancel
              </Link>
            </div>

            {!isConnected && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-4">
                <p className="text-yellow-800 text-sm font-black">
                  Please connect your wallet to submit a request.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 