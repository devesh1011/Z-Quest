import { createPublicClient, http, parseEther, createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { createBountyMetadata } from './ipfs';

// Zora Coins SDK imports
import { 
  createCoin,
  getOnchainCoinDetails,
  validateMetadataURIContent,
  setApiKey
} from '@zoralabs/coins-sdk';
import { erc20Abi } from 'viem';

// Set Zora API key if available
if (process.env.ZORA_API_KEY) {
  setApiKey(process.env.ZORA_API_KEY);
}

// Types for our bounty system
export interface BountyToken {
  contractAddress: string;
  name: string;
  symbol: string;
  basePrice: bigint;
  creator: string;
  metadataUri: string;
}

export interface MintRequest {
  contractAddress: string;
  supporter: string;
  amount: bigint;
  bountyId: number;
  prompt: string;
}

export interface FulfillRequest {
  requestId: string;
  cid: string;
  creatorAddress: string;
  bountyId: number;
}

// Create Viem client
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(process.env.ALCHEMY_BASE_KEY || 'https://sepolia.base.org'),
});

// Create wallet client from window.ethereum
const createWalletClientInstance = async () => {
  if (typeof window !== 'undefined' && (window as unknown as { ethereum: unknown }).ethereum) {
    const walletClient = createWalletClient({
      chain: baseSepolia,
      transport: custom((window as unknown as { ethereum: unknown }).ethereum),
    });
    
    // Get the connected account
    const accounts = await walletClient.getAddresses();
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please connect your wallet.');
    }
    
    return { walletClient, account: accounts[0] };
  }
  return null;
};

// Deploy a new bounty token contract (Zora Coin)
export const deployBountyToken = async (
  name: string,
  symbol: string,
  basePrice: number,
  creator: string
): Promise<BountyToken> => {
  try {
    // Create metadata for the bounty using our IPFS function
    const metadataUri = await createBountyMetadata(
      `${name} Bounty`,
      `Bounty token for ${name} commissions`,
      undefined
    );

    // Get the wallet client and account
    const walletInstance = await createWalletClientInstance();
    if (!walletInstance) {
      throw new Error('Wallet not connected');
    }

    const { walletClient, account } = walletInstance;

    // Create the coin using Zora Coins SDK
    const result = await createCoin(
      {
        name: `${name} Bounty`,
        symbol: symbol.toUpperCase(),
        uri: `ipfs://${metadataUri}`,
        payoutRecipient: creator as `0x${string}`,
        platformReferrer: creator as `0x${string}`,
      },
      walletClient,
      publicClient,
      { account }
    );

    return {
      contractAddress: result.address || '0x0000000000000000000000000000000000000000',
      name: `${name} Bounty`,
      symbol: symbol.toUpperCase(),
      basePrice: parseEther(basePrice.toString()),
      creator,
      metadataUri: `ipfs://${metadataUri}`,
    };
  } catch (error) {
    console.error('Error deploying bounty token:', error);
    throw new Error(`Failed to deploy bounty token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Custom ERC-20 ABI with mint function
const erc20WithMintAbi = [
  ...erc20Abi,
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mint',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'payable',
    type: 'function'
  }
] as const;

// Mint tokens from a bounty contract
export const mintBountyTokens = async (
  contractAddress: string,
  supporter: string,
  amount: number = 1,
  bountyId: number,
  prompt: string
): Promise<{ hash: string; requestId: string }> => {
  console.log('🚀 Starting mintBountyTokens...');
  console.log('📋 Parameters:', {
    contractAddress,
    supporter,
    amount,
    bountyId,
    prompt: prompt.substring(0, 50) + '...'
  });

  try {
    console.log('🔗 Getting wallet client...');
    // Get the wallet client and account
    const walletInstance = await createWalletClientInstance();
    if (!walletInstance) {
      console.error('❌ Wallet not connected');
      throw new Error('Wallet not connected');
    }
    const { walletClient, account } = walletInstance;
    console.log('✅ Wallet connected:', account);

    // Convert amount (ETH) to wei (BigInt)
    const amountWei = parseEther(amount.toString());
    console.log('💰 Amount in ETH:', amount);
    console.log('💰 Amount in Wei:', amountWei.toString());

    console.log('📝 Preparing contract call...');
    console.log('📍 Contract address:', contractAddress);
    console.log('🎯 Function: mint');
    console.log('👤 To address:', supporter);
    console.log('💸 Value to send:', amountWei.toString());

    // Call the mint function on the ERC-20 contract
    // This assumes the contract has a mint function that accepts ETH payment
    console.log('⏳ Sending transaction...');
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: erc20WithMintAbi,
      functionName: 'mint',
      args: [supporter as `0x${string}`, amountWei],
      account,
      value: amountWei, // Pay the mint price in ETH
    });

    console.log('✅ Transaction sent successfully!');
    console.log('🔗 Transaction hash:', txHash);

    const requestId = `${bountyId}-${supporter}-${Date.now()}`;
    console.log('🆔 Request ID:', requestId);

    return {
      hash: txHash,
      requestId,
    };
  } catch (error) {
    console.error('❌ Error in mintBountyTokens:');
    console.error('🔍 Error details:', error);
    console.error('📄 Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('🔗 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    // Log additional context
    console.error('📋 Context at error:');
    console.error('  - Contract address:', contractAddress);
    console.error('  - Supporter:', supporter);
    console.error('  - Amount:', amount);
    console.error('  - Bounty ID:', bountyId);
    
    throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Fulfill a request by updating the contract metadata
export const fulfillRequest = async (
  contractAddress: string,
  requestId: string,
  fulfillmentCid: string,
  creator: string
): Promise<{ hash: string }> => {
  try {
    // Get the wallet client and account
    const walletInstance = await createWalletClientInstance();
    if (!walletInstance) {
      throw new Error('Wallet not connected');
    }

    const { walletClient, account } = walletInstance;

    // Create a transaction to update the request status
    const result = await createCoin(
      {
        name: 'Updated Bounty',
        symbol: 'BOUNTY',
        uri: `ipfs://${fulfillmentCid}`,
        payoutRecipient: creator as `0x${string}`,
        platformReferrer: creator as `0x${string}`,
      },
      walletClient,
      publicClient,
      { account }
    );

    return {
      hash: result.hash || '0x0000000000000000000000000000000000000000000000000000000000000000',
    };
  } catch (error) {
    console.error('Error fulfilling request:', error);
    throw new Error(`Failed to fulfill request: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get bounty token details
export const getBountyTokenDetails = async (
  contractAddress: string,
  user?: string
): Promise<{
  name: string;
  symbol: string;
  totalSupply: bigint;
  userBalance?: bigint;
  owner: string;
}> => {
  try {
    // Get on-chain coin details using Zora Coins SDK
    const coinDetails = await getOnchainCoinDetails({
      coin: contractAddress as `0x${string}`,
      user: user as `0x${string}`,
      publicClient,
    });

    return {
      name: 'Bounty Token', // Default name since SDK doesn't provide it
      symbol: 'BOUNTY', // Default symbol since SDK doesn't provide it
      totalSupply: BigInt(0), // Would need to query contract directly
      userBalance: coinDetails.balance,
      owner: coinDetails.owners?.[0] || '0x0000000000000000000000000000000000000000',
    };
  } catch (error) {
    console.error('Error getting bounty token details:', error);
    throw new Error(`Failed to get token details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Get all bounty tokens for a creator
export const getCreatorBounties = async (): Promise<BountyToken[]> => {
  try {
    // This would require indexing or querying events from the blockchain
    // For now, we'll return an empty array and rely on the database
    // In a full implementation, you'd query the blockchain for deployed contracts
    return [];
  } catch (error) {
    console.error('Error getting creator bounties:', error);
    throw new Error(`Failed to get creator bounties: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Validate that a user has sufficient tokens for a request
export const validateTokenBalance = async (
  contractAddress: string,
  user: string,
  requiredAmount: number
): Promise<boolean> => {
  try {
    const coinDetails = await getOnchainCoinDetails({
      coin: contractAddress as `0x${string}`,
      user: user as `0x${string}`,
      publicClient,
    });
    return (coinDetails.balance || BigInt(0)) >= BigInt(requiredAmount);
  } catch (error) {
    console.error('Error validating token balance:', error);
    return false;
  }
};

// Get transaction status
export const getTransactionStatus = async (txHash: string): Promise<'pending' | 'confirmed' | 'failed'> => {
  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    return receipt.status === 'success' ? 'confirmed' : 'failed';
  } catch (error) {
    return 'pending';
  }
};

// Validate bounty metadata
export const validateBountyMetadata = async (prompt: string) => {
  try {
    const metadata = {
      name: 'Bounty Request',
      description: prompt,
      image: 'ipfs://placeholder.png',
    };

    const metadataUri = await createBountyMetadata(
      metadata.name,
      metadata.description,
      metadata.image
    );

    // Convert to ValidMetadataURI format
    const validUri = `ipfs://${metadataUri}` as const;
    return await validateMetadataURIContent(validUri);
  } catch (error) {
    console.error('Error validating bounty metadata:', error);
    throw new Error(`Failed to validate metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Transfer tokens from supporter to creator
export const transferTokens = async (
  contractAddress: string,
  fromAddress: string,
  toAddress: string,
  amount: number
): Promise<{ hash: string }> => {
  try {
    // Get the wallet client and account
    const walletInstance = await createWalletClientInstance();
    if (!walletInstance) {
      throw new Error('Wallet not connected');
    }
    const { walletClient, account } = walletInstance;

    // Convert amount (ETH) to wei (BigInt)
    const amountWei = parseEther(amount.toString());

    // Send the ERC-20 transfer transaction
    const txHash = await walletClient.writeContract({
      address: contractAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: 'transfer',
      args: [toAddress as `0x${string}`, amountWei],
      account,
    });

    return { hash: txHash };
  } catch {
    console.error('Error transferring tokens:', error);
    throw new Error(`Failed to transfer tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 