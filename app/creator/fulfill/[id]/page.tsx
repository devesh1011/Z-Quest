'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Request } from '@/types/bountyTypes';
import { getRequestById, updateRequestStatus } from '@/lib/supabase';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { updateRequestStatus as updateRequestStatusOnchain } from '@/lib/reputationContract';

export default function FulfillRequest() {
  const params = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const requestId = params.id as string;

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const data = await getRequestById(requestId);
      setRequest(data);
    } catch (error) {
      console.error('Error fetching request details:', error);
      setError('Failed to load request details');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    // Check if the connected wallet is the creator of this bounty
    if (request?.bounty?.creator_address !== address) {
      setError('You can only fulfill requests for your own bounties');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to IPFS via our API
      const uploadResponse = await fetch('/api/pin/file', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to IPFS');
      }

      const uploadResult = await uploadResponse.json();
      const cid = uploadResult.cid;

      // Update request status with the IPFS CID
      await updateRequestStatus(requestId, 'completed', cid);

      // Update reputation on-chain
      try {
        await updateRequestStatusOnchain(address, requestId, true);
        console.log('Reputation updated on-chain successfully');
      } catch (onchainError) {
        console.error('Failed to update reputation on-chain:', onchainError);
        // Don't fail the entire process if on-chain update fails
        // The user can manually update it later
      }

      // Redirect to dashboard
      router.push('/creator/dashboard');
    } catch (error) {
      console.error('Error fulfilling request:', error);
      setError('Failed to fulfill request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
          <div className="absolute top-40 right-20 w-24 h-24 border-4 border-green-600 -rotate-6"></div>
          <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="w-16 h-16 bg-green-600 border-4 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000] animate-pulse">
            <span className="text-white font-bold text-xl">⏳</span>
          </div>
          <p className="text-gray-700 font-medium">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error && !request) {
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
            <span className="text-white font-bold text-2xl">❌</span>
          </div>
          <h1 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">Error</h1>
          <p className="text-gray-700 mb-6 font-medium">{error}</p>
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!request) {
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
            <span className="text-white font-bold text-2xl">❓</span>
          </div>
          <h1 className="text-3xl font-black text-black mb-4 uppercase tracking-wider">Request Not Found</h1>
          <p className="text-gray-700 mb-6 font-medium">The request you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/creator/dashboard"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
          >
            Back to Dashboard
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
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-green-600 -rotate-6"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-green-600 -rotate-12"></div>
      </div>

      {/* Header */}
      <header className="bg-white border-b-4 border-black relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link
                href="/creator/dashboard"
                className="text-green-600 hover:text-black font-black uppercase tracking-wider"
              >
                <span className="mr-2">←</span>
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-black text-black uppercase tracking-wider">
                Fulfill Request
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
          {/* Request Details */}
          <div className="border-b-4 border-black pb-6 mb-6">
            <h2 className="text-xl font-black text-black mb-4 uppercase tracking-wider">Request Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Bounty Name</p>
                <p className="font-black text-black">{request.bounty?.name || 'Unknown Bounty'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Supporter</p>
                <p className="font-black text-black">{formatAddress(request.supporter_address)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Request Date</p>
                <p className="font-black text-black">{formatDate(request.created_at)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-700 font-medium uppercase tracking-wider">Status</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-700 font-medium mb-2 uppercase tracking-wider">Request:</p>
              <p className="text-black bg-green-50 border-2 border-green-600 p-3 rounded-xl font-medium">
                {request.prompt}
              </p>
            </div>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="file" className="block text-sm font-black text-black mb-2 uppercase tracking-wider">
                Upload Completed Work
              </label>
              <input
                type="file"
                id="file"
                onChange={handleFileChange}
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                className="w-full px-3 py-2 border-3 border-black rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 font-medium"
                required
              />
              <p className="mt-2 text-sm text-gray-700 font-medium">
                Supported formats: Images, videos, audio, PDFs, documents, and text files.
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
                disabled={!isConnected || submitting}
                className="flex-1 bg-green-600 text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Uploading...' : 'Fulfill Request'}
              </button>
              <Link
                href="/creator/dashboard"
                className="flex-1 bg-black text-white text-center py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 