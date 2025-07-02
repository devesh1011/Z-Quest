

// Pin JSON data to IPFS via API route
export const pinJSON = async (data: Record<string, unknown>): Promise<string> => {
  try {
    const response = await fetch('/api/pin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to pin to IPFS');
    }

    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw new Error('Failed to pin JSON to IPFS');
  }
};

// Pin file to IPFS via API route
export const pinFile = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/pin/file', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to pin file to IPFS');
    }

    const result = await response.json();
    return result.cid;
  } catch (error) {
    console.error('Error pinning file to IPFS:', error);
    throw new Error('Failed to pin file to IPFS');
  }
};

// Create bounty metadata
export const createBountyMetadata = async (
  name: string,
  description: string,
  imageUrl?: string
): Promise<string> => {
  const metadata = {
    name,
    description,
    image: imageUrl || 'ipfs://QmPlaceholderImage',
    attributes: [
      {
        trait_type: 'Type',
        value: 'Bounty Token',
      },
      {
        trait_type: 'Platform',
        value: 'Zora Creator Bounty Board',
      },
    ],
  };

  return await pinJSON(metadata);
};

// Create request metadata
export const createRequestMetadata = async (
  prompt: string,
  bountyName: string,
  supporterAddress: string
): Promise<string> => {
  const metadata = {
    name: `Request for ${bountyName}`,
    description: prompt,
    attributes: [
      {
        trait_type: 'Bounty',
        value: bountyName,
      },
      {
        trait_type: 'Supporter',
        value: supporterAddress,
      },
      {
        trait_type: 'Status',
        value: 'Pending',
      },
    ],
  };

  return await pinJSON(metadata);
};

// Get IPFS gateway URL
export const getIPFSGatewayURL = (cid: string): string => {
  return `https://gateway.pinata.cloud/ipfs/${cid}`;
};

// Validate IPFS CID format
export const isValidCID = (cid: string): boolean => {
  // Basic CID validation (Qm... for v0, bafy... for v1)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) || /^bafy[a-z2-7]{55}$/.test(cid);
}; 