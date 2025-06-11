'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther } from 'viem';
import ClaimTokenABI from '../abis/ClaimToken.json';

// Contract address - you'll need to update this with your deployed contract address
const CLAIM_TOKEN_ADDRESS = '0xDd70978f7903205A9aA1B8CEF52F62bb1CAB95e8' as const;

export default function TokenClaim() {
  const { address, isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  // Contract read hooks
  const { data: balance } = useReadContract({
    address: CLAIM_TOKEN_ADDRESS,
    abi: ClaimTokenABI,
    functionName: 'balanceOf',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: claimAmount } = useReadContract({
    address: CLAIM_TOKEN_ADDRESS,
    abi: ClaimTokenABI,
    functionName: 'getClaimAmount',
  });

  const { data: remainingSupply } = useReadContract({
    address: CLAIM_TOKEN_ADDRESS,
    abi: ClaimTokenABI,
    functionName: 'getRemainingSupply',
  });

  const { data: canClaimData, isLoading: canClaimLoading } = useReadContract({
    address: CLAIM_TOKEN_ADDRESS,
    abi: ClaimTokenABI,
    functionName: 'canClaimTokens',
    args: [address],
    query: { enabled: !!address },
  });

  const { data: hasClaimedData, isLoading: hasClaimedLoading } = useReadContract({
    address: CLAIM_TOKEN_ADDRESS,
    abi: ClaimTokenABI,
    functionName: 'hasClaimed',
    args: [address],
    query: { enabled: !!address },
  });

  // Contract write hook
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Transaction receipt hook
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Properly handle the boolean values with defaults
  const canClaim = canClaimData === true;
  const hasClaimed = hasClaimedData === true;
  const isDataLoading = canClaimLoading || hasClaimedLoading;

  const handleClaim = async () => {
    if (!address) return;

    try {
      setIsLoading(true);
      
      writeContract({
        address: CLAIM_TOKEN_ADDRESS,
        abi: ClaimTokenABI,
        functionName: 'claimTokens',
        args: [],
      });
    } catch (err) {
      console.error('Error claiming tokens:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false);
    }
  }, [isConfirmed]);

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Token Claim Portal</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to claim your 10 CLAIM tokens</p>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-yellow-800">Please connect your wallet to continue</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Token Claim Portal</h2>
        <p className="text-gray-600">Claim your 10 CLAIM tokens - one claim per wallet address</p>
      </div>

      {/* User Identity and Balance */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {address?.slice(2, 4).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">Connected Wallet</p>
              <p className="text-sm text-gray-500">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Your CLAIM Balance:</span>
            <p className="text-lg font-bold text-green-600">
              {balance ? formatEther(balance as bigint) : '0'} CLAIM
            </p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Remaining Supply:</span>
            <p className="text-lg font-bold text-blue-600">
              {remainingSupply ? formatEther(remainingSupply as bigint) : '0'} CLAIM
            </p>
          </div>
        </div>
      </div>

      {/* Claim Status */}
      <div className={`p-4 rounded-lg border ${
        isDataLoading 
          ? 'bg-yellow-50 border-yellow-200' 
          : canClaim 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`font-medium ${
              isDataLoading 
                ? 'text-yellow-800' 
                : canClaim 
                ? 'text-green-800' 
                : 'text-red-800'
            }`}>
              Claim Status
            </h3>
            <p className={`text-sm ${
              isDataLoading 
                ? 'text-yellow-600' 
                : canClaim 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {isDataLoading
                ? 'Checking claim status...'
                : canClaim 
                ? 'You can claim 10 tokens now!' 
                : hasClaimed 
                ? 'You have already claimed your tokens'
                : 'Claim not available'
              }
            </p>
          </div>
          <div className={`w-3 h-3 rounded-full ${
            isDataLoading 
              ? 'bg-yellow-500' 
              : canClaim 
              ? 'bg-green-500' 
              : 'bg-red-500'
          }`} />
        </div>
      </div>

      {/* Claim Section */}
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-blue-800">Claim Amount</h4>
              <p className="text-2xl font-bold text-blue-600">
                {claimAmount ? formatEther(claimAmount as bigint) : '10'} CLAIM
              </p>
              <p className="text-sm text-blue-600">Fixed amount per wallet</p>
            </div>
            <div className="text-4xl">🎁</div>
          </div>
        </div>

        <button
          onClick={handleClaim}
          disabled={!canClaim || isPending || isConfirming || isLoading || isDataLoading}
          className={`w-full py-4 px-6 rounded-md font-medium text-lg transition-colors ${
            canClaim && !isPending && !isConfirming && !isLoading && !isDataLoading
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isPending || isConfirming || isLoading
            ? 'Processing...'
            : isDataLoading
            ? 'Loading...'
            : canClaim
            ? 'Claim 10 CLAIM Tokens'
            : hasClaimed
            ? 'Already Claimed'
            : 'Claim Unavailable'
          }
        </button>
      </div>

      {/* Transaction Status */}
      {hash && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Transaction Status</h4>
          {isConfirming && (
            <p className="text-blue-600 text-sm">Waiting for confirmation...</p>
          )}
          {isConfirmed && (
            <p className="text-green-600 text-sm font-medium">
              ✅ 10 CLAIM tokens claimed successfully!
            </p>
          )}
          <p className="text-xs text-blue-500 mt-2 break-all">
            Transaction Hash: {hash}
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-medium text-red-800 mb-2">Error</h4>
          <p className="text-red-600 text-sm">
            {error.message || 'An error occurred while claiming tokens'}
          </p>
        </div>
      )}

      {/* Debug Info - Remove this in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg text-xs">
          <h4 className="font-medium text-gray-800 mb-2">Debug Info</h4>
          <p>canClaimData: {String(canClaimData)}</p>
          <p>hasClaimedData: {String(hasClaimedData)}</p>
          <p>canClaim: {String(canClaim)}</p>
          <p>hasClaimed: {String(hasClaimed)}</p>
          <p>isDataLoading: {String(isDataLoading)}</p>
        </div>
      )}

      {/* Contract Info */}
      <div className="text-center text-xs text-gray-500 border-t pt-4">
        <p>Contract Address: {CLAIM_TOKEN_ADDRESS}</p>
        <p>Network: Celo Alfajores Testnet</p>
        <p className="mt-1 text-gray-400">Each wallet can claim exactly 10 CLAIM tokens once</p>
      </div>
    </div>
  );
} 