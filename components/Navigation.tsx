'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Navigation() {
  const { address } = useAccount();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isCreatorRoute = pathname?.startsWith('/creator');
  const isSupporterRoute = pathname?.startsWith('/supporter');

  const creatorNavItems = [
    { href: '/creator/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/creator/new-bounty', label: 'Create Bounty', icon: '✨' },
    { href: '/creator/fulfill', label: 'Fulfill Requests', icon: '✅' },
  ];

  const supporterNavItems = [
    { href: '/supporter/browse', label: 'Browse Bounties', icon: '🔍' },
    { href: '/supporter/dashboard', label: 'My Requests', icon: '📋' },
    { href: '/supporter/commissions', label: 'My Commissions', icon: '💼' },
  ];

  const currentNavItems = isCreatorRoute ? creatorNavItems : supporterNavItems;

  return (
    <nav className="backdrop-blur-md bg-white/60 border-b border-gray-200/60 shadow-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Z-Quest</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Role Switcher */}
            <div className="flex items-center space-x-1 bg-white/30 backdrop-blur-md border border-gray-200/60 rounded-lg p-1">
              <Link
                href="/creator/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCreatorRoute
                    ? 'bg-white/70 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Creator
              </Link>
              <Link
                href="/supporter/browse"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSupporterRoute
                    ? 'bg-white/70 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Supporter
              </Link>
            </div>

            {/* Navigation Items */}
            {address && (
              <div className="flex items-center space-x-6">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-blue-600 bg-white/70'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Wallet Connection */}
            <ConnectButton />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-white/40"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200/60 py-4 bg-white/60 backdrop-blur-md rounded-b-2xl">
            {/* Role Switcher */}
            <div className="flex items-center space-x-1 bg-white/30 backdrop-blur-md border border-gray-200/60 rounded-lg p-1 mb-4">
              <Link
                href="/creator/dashboard"
                className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isCreatorRoute
                    ? 'bg-white/70 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Creator
              </Link>
              <Link
                href="/supporter/browse"
                className={`flex-1 text-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isSupporterRoute
                    ? 'bg-white/70 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Supporter
              </Link>
            </div>

            {/* Navigation Items */}
            {address && (
              <div className="space-y-2">
                {currentNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      pathname === item.href
                        ? 'text-blue-600 bg-white/70'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/40'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Mobile Wallet Connection */}
            <div className="mt-4">
              <ConnectButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}