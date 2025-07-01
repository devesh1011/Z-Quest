'use client';

import { useAccount } from 'wagmi';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  const { address } = useAccount();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 border-4 border-black rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-24 border-4 border-blue-600 -rotate-6"></div>
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border-4 border-black rotate-45"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 border-4 border-blue-600 -rotate-12"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-black opacity-20"></div>
      </div>

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 border-4 border-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <span className="text-white font-bold text-2xl">Z</span>
            </div>
            <h1 className="text-5xl font-black text-black mb-6 tracking-tight">
              Zora Creator Bounty Board
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8 leading-relaxed">
              The decentralized platform where creators deploy custom tokens and supporters commission work directly on the blockchain.
            </p>
          </div>

          {/* Wallet Connection */}
          {!address ? (
            <div className="mb-12">
              <div className="transform scale-110">
                <ConnectButton />
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Connect your wallet to get started
              </p>
            </div>
          ) : (
            <div className="mb-12">
              <p className="text-blue-600 font-bold mb-6 text-lg">
                ✅ Wallet Connected! Choose your role below
              </p>
            </div>
          )}

          {/* Role Selection Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Creator Card */}
            <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                  <span className="text-white text-2xl font-bold">✨</span>
                </div>
                <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wider">Creator</h2>
                <p className="text-gray-700 font-medium">Deploy tokens and offer your creative services</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Deploy custom ERC-20 tokens
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Set your own pricing
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Receive direct payments
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Build reputation on-chain
                </div>
              </div>

              <Link
                href="/creator/dashboard"
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 block text-center"
              >
                Start Creating
              </Link>
            </div>

            {/* Supporter Card */}
            <div className="bg-white border-4 border-black rounded-2xl p-8 shadow-[8px_8px_0px_#000000] hover:shadow-[12px_12px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-black border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                  <span className="text-white text-2xl font-bold">🔍</span>
                </div>
                <h2 className="text-2xl font-black text-black mb-2 uppercase tracking-wider">Supporter</h2>
                <p className="text-gray-700 font-medium">Browse bounties and commission custom work</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  Browse creator bounties
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  Mint tokens to request work
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  Track request progress
                </div>
                <div className="flex items-center text-sm text-gray-700">
                  <span className="w-2 h-2 bg-black rounded-full mr-3"></span>
                  Receive work on IPFS
                </div>
              </div>

              <Link
                href="/supporter/browse"
                className="w-full bg-black text-white py-4 px-6 rounded-xl font-black uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200 block text-center"
              >
                Browse Bounties
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-50 py-16 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-4 uppercase tracking-wider">How It Works</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
              A simple three-step process to connect creators and supporters on the blockchain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-black text-2xl">1</span>
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">Create Bounty</h3>
              <p className="text-gray-700 font-medium">
                Creators deploy custom ERC-20 tokens on Base Sepolia with their services and pricing.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-black text-2xl">2</span>
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">Mint & Request</h3>
              <p className="text-gray-700 font-medium">
                Supporters browse bounties and mint tokens to request custom work from creators.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 border-3 border-black rounded-xl flex items-center justify-center mx-auto mb-4 shadow-[4px_4px_0px_#000000]">
                <span className="text-white font-black text-2xl">3</span>
              </div>
              <h3 className="text-xl font-black text-black mb-2 uppercase tracking-wider">Deliver & Earn</h3>
              <p className="text-gray-700 font-medium">
                Creators deliver work on IPFS and receive payments directly in their tokens.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-black mb-4 uppercase tracking-wider">Why Choose Zora Bounty?</h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto font-medium">
              Built on Base Sepolia with Zora Coins for a truly decentralized experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 bg-blue-600 border-3 border-black rounded-lg flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-xl">🔗</span>
              </div>
              <h3 className="font-black text-black mb-2 uppercase tracking-wider">Fully On-Chain</h3>
              <p className="text-sm text-gray-700 font-medium">
                All transactions and payments happen on Base Sepolia blockchain
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 bg-black border-3 border-black rounded-lg flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-xl">💾</span>
              </div>
              <h3 className="font-black text-black mb-2 uppercase tracking-wider">IPFS Storage</h3>
              <p className="text-sm text-gray-700 font-medium">
                All work is permanently stored on decentralized IPFS
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 bg-blue-600 border-3 border-black rounded-lg flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-xl">🎯</span>
              </div>
              <h3 className="font-black text-black mb-2 uppercase tracking-wider">Direct Payments</h3>
              <p className="text-sm text-gray-700 font-medium">
                No intermediaries - creators receive payments directly in tokens
              </p>
            </div>

            <div className="bg-white border-3 border-black rounded-xl p-6 shadow-[6px_6px_0px_#000000] hover:shadow-[8px_8px_0px_#000000] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all duration-200">
              <div className="w-12 h-12 bg-black border-3 border-black rounded-lg flex items-center justify-center mb-4 shadow-[3px_3px_0px_#000000]">
                <span className="text-white font-bold text-xl">⭐</span>
              </div>
              <h3 className="font-black text-black mb-2 uppercase tracking-wider">Reputation System</h3>
              <p className="text-sm text-gray-700 font-medium">
                Build trust through on-chain reputation and reviews
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-600 border-2 border-white rounded-lg flex items-center justify-center mr-3 shadow-[2px_2px_0px_#ffffff]">
              <span className="text-white font-bold text-sm">Z</span>
            </div>
            <span className="text-xl font-black uppercase tracking-wider">Zora Bounty Board</span>
          </div>
          <p className="text-gray-300 mb-4 font-medium">
            Decentralized commission platform powered by Zora Coins on Base Sepolia
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-300">
            <a href="#" className="hover:text-white transition-colors font-medium">About</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Documentation</a>
            <a href="#" className="hover:text-white transition-colors font-medium">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
