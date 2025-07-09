import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { event, data } = await req.json();

    // Handle different types of events
    switch (event) {
      case 'Transfer':
        // Handle token transfer events
        await handleTransferEvent(data);
        break;
      
      case 'Approval':
        // Handle approval events
        await handleApprovalEvent(data);
        break;
      
      default:
        console.log('Unknown event type:', event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling event:', error);
    return NextResponse.json(
      { error: 'Failed to process event' },
      { status: 500 }
    );
  }
}

async function handleTransferEvent(data: Record<string, unknown>) {
  try {
    const { from, to, tokenId, contractAddress } = data as {
      from: string;
      to: string;
      tokenId: bigint;
      contractAddress: string;
    };
    
    console.log('Transfer event:', {
      from,
      to,
      tokenId: tokenId.toString(),
      contractAddress,
    });

    // Here you could:
    // 1. Update database with new token ownership
    // 2. Trigger notifications
    // 3. Update request status if needed
    // 4. Log the transaction for audit purposes

  } catch (error) {
    console.error('Error handling transfer event:', error);
  }
}

async function handleApprovalEvent(data: Record<string, unknown>) {
  try {
    const { owner, approved, tokenId, contractAddress } = data as {
      owner: string;
      approved: string;
      tokenId: bigint;
      contractAddress: string;
    };
    
    console.log('Approval event:', {
      owner,
      approved,
      tokenId: tokenId.toString(),
      contractAddress,
    });

    // Here you could:
    // 1. Update approval status in database
    // 2. Trigger notifications
    // 3. Log the approval for audit purposes

  } catch (error) {
    console.error('Error handling approval event:', error);
  }
}

// GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Zora Bounty Board Events Handler'
  });
} 