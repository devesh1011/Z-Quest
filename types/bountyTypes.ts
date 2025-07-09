export interface Bounty {
  id: number;
  contract_address: string;
  creator_address: string;
  name: string;
  base_price_eth: number;
  created_at: string;
  minimum_tokens_required?: number;
}

export interface Request {
  id: string;
  bounty_id: number;
  supporter_address: string;
  prompt: string;
  status: 'pending' | 'completed' | 'rejected' | 'paid';
  created_at: string;
  fulfilled_cid?: string;
  tx_hash?: string;
  bounty?: Bounty;
}

export interface Creator {
  address: string;
}

export interface User {
  address: string;
  is_creator: boolean;
  is_supporter: boolean;
}

export interface BountyMetadata {
  name: string;
  description: string;
  image: string;
  attributes: {
    trait_type: string;
    value: string;
  }[];
}

export interface MintRequest {
  contract: string;
  supporter: string;
  amount: number;
}

export interface FulfillRequest {
  request_id: string;
  cid: string;
  creator_address: string;
} 