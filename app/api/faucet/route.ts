import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Set these in your environment variables
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY!;
const FAUCET_RPC_URL = process.env.FAUCET_RPC_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contract = searchParams.get('contract');
  const to = searchParams.get('to');
  const amount = searchParams.get('amount');

  if (!contract || !to || !amount) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    // Connect to provider and wallet
    const provider = new ethers.JsonRpcProvider(FAUCET_RPC_URL);
    const wallet = new ethers.Wallet(FAUCET_PRIVATE_KEY, provider);

    // ERC-20 ABI (minimal)
    const erc20Abi = [
      'function transfer(address to, uint256 amount) public returns (bool)',
      'function decimals() view returns (uint8)'
    ];
    const token = new ethers.Contract(contract, erc20Abi, wallet);

    // Get decimals to parse amount
    const decimals: number = await token.decimals();
    const parsedAmount = ethers.parseUnits(amount, decimals);

    // Send tokens
    const tx = await token.transfer(to, parsedAmount);
    await tx.wait();

    return NextResponse.json({ success: true, txHash: tx.hash });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Faucet error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 