import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper functions for bounty operations
export const getBounties = async () => {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getBountiesByCreator = async (creatorAddress: string) => {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('creator_address', creatorAddress)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getBountyById = async (id: number) => {
  const { data, error } = await supabase
    .from('bounties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const getRequestsByBounty = async (bountyId: number) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      bounty:bounties(*)
    `)
    .eq('bounty_id', bountyId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getRequestsByCreator = async (creatorAddress: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      bounty:bounties(*)
    `)
    .eq('bounty.creator_address', creatorAddress)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getRequestsBySupporter = async (supporterAddress: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      bounty:bounties(*)
    `)
    .eq('supporter_address', supporterAddress)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const getRequestById = async (requestId: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      bounty:bounties(*)
    `)
    .eq('id', requestId)
    .single();
  
  if (error) throw error;
  return data;
};

export const getSupporterRequests = async (supporterAddress: string) => {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      bounty:bounties(*)
    `)
    .eq('supporter_address', supporterAddress)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createRequest = async (request: {
  bounty_id: number;
  supporter_address: string;
  prompt: string;
  tx_hash?: string;
}) => {
  const { data, error } = await supabase
    .from('requests')
    .insert(request)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateRequestStatus = async (
  requestId: string,
  status: 'pending' | 'completed' | 'rejected' | 'paid',
  fulfilledCid?: string
) => {
  const updateData: Record<string, unknown> = { status };
  if (fulfilledCid) updateData.fulfilled_cid = fulfilledCid;
  
  const { data, error } = await supabase
    .from('requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const createBounty = async (bounty: {
  contract_address: string;
  creator_address: string;
  name: string;
  base_price_eth: number;
  minimum_tokens_required: number;
}) => {
  const { data, error } = await supabase
    .from('bounties')
    .insert(bounty)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}; 