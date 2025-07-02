import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';

// Reputation Contract ABI
const REPUTATION_CONTRACT_ABI = [
  {
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'supporter', type: 'address' },
      { name: 'rating', type: 'uint8' },
      { name: 'comment', type: 'string' }
    ],
    name: 'submitRating',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getReputation',
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'totalRatings', type: 'uint256' },
      { name: 'completedRequests', type: 'uint256' },
      { name: 'disputedRequests', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'creator', type: 'address' }],
    name: 'getAverageRating',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'creator', type: 'address' },
      { name: 'requestId', type: 'string' },
      { name: 'completed', type: 'bool' }
    ],
    name: 'updateRequestStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Create Viem client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.ALCHEMY_BASE_KEY || 'https://sepolia.base.org'),
});

// Create wallet client from window.ethereum
const createWalletClientInstance = () => {
  if (typeof window !== 'undefined' && (window as unknown as { ethereum: unknown }).ethereum) {
    return createWalletClient({
      chain: baseSepolia,
      transport: custom((window as unknown as { ethereum: unknown }).ethereum),
    });
  }
  return null;
};

// Reputation Contract Address (you'll deploy this)
const REPUTATION_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS as `0x${string}`;

export interface OnchainReputation {
  score: bigint;
  totalRatings: bigint;
  completedRequests: bigint;
  disputedRequests: bigint;
  averageRating: bigint;
}

export interface ReputationRating {
  creator: string;
  supporter: string;
  rating: number; // 1-5 stars
  comment: string;
  timestamp: number;
}

// Get creator's on-chain reputation
export const getOnchainReputation = async (creatorAddress: string): Promise<OnchainReputation> => {
  try {
    console.log('Fetching on-chain reputation for:', creatorAddress, 'using contract:', REPUTATION_CONTRACT_ADDRESS);
    const [reputation, averageRating] = await Promise.all([
      publicClient.readContract({
        address: REPUTATION_CONTRACT_ADDRESS,
        abi: REPUTATION_CONTRACT_ABI,
        functionName: 'getReputation',
        args: [creatorAddress as `0x${string}`],
      }),
      publicClient.readContract({
        address: REPUTATION_CONTRACT_ADDRESS,
        abi: REPUTATION_CONTRACT_ABI,
        functionName: 'getAverageRating',
        args: [creatorAddress as `0x${string}`],
      }),
    ]);

    return {
      score: reputation[0],
      totalRatings: reputation[1],
      completedRequests: reputation[2],
      disputedRequests: reputation[3],
      averageRating,
    };
  } catch (error) {
    console.error('Error getting on-chain reputation:', error, 'for creator:', creatorAddress, 'using contract:', REPUTATION_CONTRACT_ADDRESS);
    // Return default values if contract not deployed
    return {
      score: BigInt(50),
      totalRatings: BigInt(0),
      completedRequests: BigInt(0),
      disputedRequests: BigInt(0),
      averageRating: BigInt(0),
    };
  }
};

// Submit a rating for a creator
export const submitRating = async (
  creatorAddress: string,
  rating: number,
  comment: string
): Promise<{ hash: string }> => {
  try {
    const walletClient = createWalletClientInstance();
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const accounts = await walletClient.getAddresses();
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const supporterAddress = accounts[0];

    const hash = await walletClient.writeContract({
      address: REPUTATION_CONTRACT_ADDRESS,
      abi: REPUTATION_CONTRACT_ABI,
      functionName: 'submitRating',
      args: [
        creatorAddress as `0x${string}`,
        supporterAddress,
        rating as number,
        comment,
      ],
      account: supporterAddress,
    });

    return { hash };
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw new Error(`Failed to submit rating: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Update request status (called by creator when fulfilling/rejecting)
export const updateRequestStatus = async (
  creatorAddress: string,
  requestId: string,
  completed: boolean
): Promise<{ hash: string }> => {
  try {
    const walletClient = createWalletClientInstance();
    if (!walletClient) {
      throw new Error('Wallet not connected');
    }

    const accounts = await walletClient.getAddresses();
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    const hash = await walletClient.writeContract({
      address: REPUTATION_CONTRACT_ADDRESS,
      abi: REPUTATION_CONTRACT_ABI,
      functionName: 'updateRequestStatus',
      args: [
        creatorAddress as `0x${string}`,
        requestId,
        completed,
      ],
      account: accounts[0],
    });

    return { hash };
  } catch (error) {
    console.error('Error updating request status:', error);
    throw new Error(`Failed to update request status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get reputation level based on score
export const getReputationLevel = (score: bigint) => {
  const scoreNum = Number(score);
  
  if (scoreNum >= 90) return { level: 'Elite', color: 'text-purple-600', icon: '👑', bgColor: 'bg-purple-100' };
  if (scoreNum >= 75) return { level: 'Excellent', color: 'text-green-600', icon: '⭐', bgColor: 'bg-green-100' };
  if (scoreNum >= 60) return { level: 'Good', color: 'text-blue-600', icon: '👍', bgColor: 'bg-blue-100' };
  if (scoreNum >= 40) return { level: 'Average', color: 'text-yellow-600', icon: '⚖️', bgColor: 'bg-yellow-100' };
  if (scoreNum >= 20) return { level: 'Poor', color: 'text-orange-600', icon: '⚠️', bgColor: 'bg-orange-100' };
  return { level: 'Very Poor', color: 'text-red-600', icon: '🚫', bgColor: 'bg-red-100' };
};

// Calculate completion rate
export const getCompletionRate = (completed: bigint, total: bigint): number => {
  if (total === BigInt(0)) return 0;
  return Number((completed * BigInt(100)) / total);
}; 