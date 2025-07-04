import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!PINATA_API_KEY || !PINATA_SECRET_API_KEY) {
      return NextResponse.json(
        { error: 'Pinata API keys not configured' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Create FormData for Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Add metadata
    const metadata = {
      name: file.name,
      keyvalues: {
        originalName: file.name,
        type: file.type,
      },
    };
    pinataFormData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      pinataFormData,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );

    return NextResponse.json({
      success: true,
      cid: response.data.IpfsHash,
      gatewayUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`,
    });
  } catch (error: unknown) {
    console.error('Error pinning file to IPFS:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to pin file to IPFS';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 