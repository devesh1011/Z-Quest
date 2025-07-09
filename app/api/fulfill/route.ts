import { NextRequest, NextResponse } from 'next/server';
import { updateRequestStatus as updateRequestStatusDb } from '@/lib/supabase';
import { isValidCID } from '@/lib/ipfs';

export async function POST(req: NextRequest) {
  try {
    const { requestId, cid, creatorAddress, status } = await req.json();

    if (!requestId || !creatorAddress || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['completed', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "completed" or "rejected"' },
        { status: 400 }
      );
    }

    // Validate CID if status is completed
    if (status === 'completed' && (!cid || !isValidCID(cid))) {
      return NextResponse.json(
        { error: 'Valid IPFS CID required for completed requests' },
        { status: 400 }
      );
    }

    // Update request status in Supabase (off-chain tracking)
    const updatedRequest = await updateRequestStatusDb(
      requestId,
      status,
      status === 'completed' ? cid : undefined
    );

    // Update request status on-chain (reputation)
    // Only the creator can call this on-chain function, so this should be called from the client after wallet signature.
    // Here, we just return a message to the client to call updateRequestStatus on-chain.

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Request ${status} successfully. Please confirm the on-chain transaction in your wallet to update reputation.`
    });
  } catch (error) {
    console.error('Error in fulfill endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to update request status' },
      { status: 500 }
    );
  }
} 