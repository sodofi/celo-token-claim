'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import TokenClaim from '../components/TokenClaim';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);
  const { isConnected } = useAccount();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Celo Token Claim dApp
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          A decentralized application built with Celo Composer and Composer Kit UI components. 
          Claim your CLAIM tokens with a built-in cooldown mechanism.
        </p>
      </div>
      
      <TokenClaim />
      
      {!isConnected && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Use the "Connect Wallet" button in the header to get started
          </p>
        </div>
      )}
    </div>
  );
}
