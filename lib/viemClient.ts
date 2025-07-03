import { createPublicClient, http, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';

// Public client for reading from blockchain
export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.ALCHEMY_BASE_KEY || 
    'https://sepolia.base.org'
  ),
});

// Wallet client for transactions
export const createWalletClientInstance = () => {
  if (typeof window !== 'undefined' && (window as unknown as { ethereum: unknown }).ethereum) {
    return createWalletClient({
      chain: baseSepolia,
      transport: custom((window as unknown as { ethereum: unknown }).ethereum),
    });
  }
  return null;
};

// Helper function to get token balance
export const getTokenBalance = async (contractAddress: string, userAddress: string) => {
  try {
    const balance = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          type: 'function',
          name: 'balanceOf',
          inputs: [{ type: 'address', name: 'owner' }],
          outputs: [{ type: 'uint256' }],
          stateMutability: 'view',
        },
      ],
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    });
    return balance;
  } catch (error) {
    console.error('Error getting token balance:', error);
    return BigInt(0);
  }
};

// Helper function to get token owner
export const getTokenOwner = async (contractAddress: string, tokenId: bigint) => {
  try {
    const owner = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi: [
        {
          type: 'function',
          name: 'ownerOf',
          inputs: [{ type: 'uint256', name: 'tokenId' }],
          outputs: [{ type: 'address' }],
          stateMutability: 'view',
        },
      ],
      functionName: 'ownerOf',
      args: [tokenId],
    });
    return owner;
  } catch (error) {
    console.error('Error getting token owner:', error);
    return null;
  }
}; 