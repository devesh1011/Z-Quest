'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { deployBountyToken } from '@/lib/zoraSDK';
import { createBounty } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewBounty() {
  const { address } = useAccount();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    minimumTokensRequired: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      setError('Please connect your wallet');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Deploy bounty token
      const tokenResult = await deployBountyToken(
        formData.name,
        formData.name.substring(0, 3).toUpperCase(), // Use first 3 chars as symbol
        parseFloat(formData.basePrice),
        address
      );

      // Create bounty in database
      await createBounty({
        contract_address: tokenResult.contractAddress,
        creator_address: address,
        name: formData.name,
        base_price_eth: parseFloat(formData.basePrice),
        minimum_tokens_required: parseFloat(formData.minimumTokensRequired) || 0,
      });

      // Redirect to dashboard
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Error creating bounty:', error);
      setError('Failed to create bounty. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
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
            Please connect your wallet to create a new bounty.
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

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-black font-black uppercase tracking-wider mb-4 transition-colors"
          >
            <span className="mr-2">←</span>
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-black text-black mb-2 uppercase tracking-wider">
            Create New Bounty
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Deploy an ERC-20 token for your creative services
          </p>
        </div>

        <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000000]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-black text-black mb-3 uppercase tracking-wider">
                Bounty Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border-3 text-black border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-[2px_2px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] transition-all duration-200"
                placeholder="e.g., Digital Art Commission"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-black text-black mb-3 uppercase tracking-wider">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border-3 text-black border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-[2px_2px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] transition-all duration-200 resize-none"
                placeholder="Describe the type of work you offer..."
              />
            </div>

            <div>
              <label htmlFor="basePrice" className="block text-sm font-black text-black mb-3 uppercase tracking-wider">
                Base Price (ETH) *
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
                min="0.001"
                step="0.001"
                className="w-full px-4 py-3 border-3 text-black border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-[2px_2px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] transition-all duration-200"
                placeholder="0.01"
              />
              <p className="text-sm text-gray-600 mt-2 font-medium">
                This is the minimum price for your services
              </p>
            </div>

            <div>
              <label htmlFor="minimumTokensRequired" className="block text-sm font-black text-black mb-3 uppercase tracking-wider">
                Minimum Tokens Required to Submit Request *
              </label>
              <input
                type="number"
                id="minimumTokensRequired"
                name="minimumTokensRequired"
                value={formData.minimumTokensRequired}
                onChange={handleInputChange}
                required
                min="0"
                step="1"
                className="w-full px-4 py-3 border-3 text-black border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium shadow-[2px_2px_0px_#000000] focus:shadow-[4px_4px_0px_#000000] transition-all duration-200"
                placeholder="e.g., 10"
              />
              <p className="text-sm text-gray-600 mt-2 font-medium">
                Supporters must hold at least this many tokens to submit a request
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border-3 border-red-500 rounded-xl p-4 shadow-[4px_4px_0px_#000000]">
                <p className="text-red-800 text-sm font-black uppercase tracking-wider">{error}</p>
              </div>
            )}

            <div className="bg-blue-100 border-3 border-blue-500 rounded-xl p-6 shadow-[4px_4px_0px_#000000]">
              <h3 className="text-sm font-black text-blue-800 mb-3 uppercase tracking-wider">
                What happens next?
              </h3>
              <ul className="text-sm text-blue-700 space-y-2 font-medium">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  An ERC-20 token will be deployed on Zora network
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Supporters can mint tokens to request your work
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  You&apos;ll receive payments directly in tokens
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  All work is stored permanently on IPFS
                </li>
              </ul>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/creator/dashboard"
                className="px-6 py-3 bg-gray-200 text-black rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-[2px_2px_0px_#000000]"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Creating...
                  </>
                ) : (
                  'Create Bounty'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 