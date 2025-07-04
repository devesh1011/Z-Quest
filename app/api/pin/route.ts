import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// Pin JSON data to IPFS (server-side)
const pinJSON = async (data: Record<string, unknown>): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
    throw new Error('Pinata API keys not configured');
  }

  try {
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinJSONToIPFS',
      data,
      {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );

    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error pinning JSON to IPFS:', error);
    throw new Error('Failed to pin JSON to IPFS');
  }
};

export async function POST(req: NextRequest) {
  try {
    const { data } = await req.json();
    
    if (!data) {
      return NextResponse.json(
        { error: 'Data is required' },
        { status: 400 }
      );
    }

    const cid = await pinJSON(data);
    
    return NextResponse.json({ 
      success: true,
      cid,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`
    });
  } catch (error: unknown) {
    console.error('Error in pin API:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to pin to IPFS';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 