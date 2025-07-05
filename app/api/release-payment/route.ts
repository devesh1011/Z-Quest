import { NextRequest, NextResponse } from 'next/server';
import { getRequestById, updateRequestStatus as updateRequestStatusDb } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { requestId, txHash } = await req.json();

    if (!requestId || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the request to verify it's completed
    const request = await getRequestById(requestId);
    if (!request) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    if (request.status !== 'completed') {
      return NextResponse.json(
        { error: 'Request must be completed before payment can be released' },
        { status: 400 }
      );
    }

    // Update request status to indicate payment released
    await updateRequestStatusDb(requestId, 'paid');

    return NextResponse.json({
      success: true,
      message: 'Payment released successfully',
      transactionHash: txHash,
      request: request
    });
  } catch (error) {
    console.error('Error in release payment endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to release payment' },
      { status: 500 }
    );
  }
} 