export type Database = {
  public: {
    Tables: {
      bounties: {
        Row: {
          id: number;
          contract_address: string;
          creator_address: string;
          name: string;
          base_price_eth: number;
          created_at: string;
        };
        Insert: {
          id?: number;
          contract_address: string;
          creator_address: string;
          name: string;
          base_price_eth: number;
          created_at?: string;
        };
        Update: {
          id?: number;
          contract_address?: string;
          creator_address?: string;
          name?: string;
          base_price_eth?: number;
          created_at?: string;
        };
      };
      requests: {
        Row: {
          id: string;
          bounty_id: number;
          supporter_address: string;
          prompt: string;
          status: 'pending' | 'completed' | 'rejected' | 'paid';
          created_at: string;
          fulfilled_cid?: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bounty_id: number;
          supporter_address: string;
          prompt: string;
          status?: 'pending' | 'completed' | 'rejected' | 'paid';
          created_at?: string;
          fulfilled_cid?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bounty_id?: number;
          supporter_address?: string;
          prompt?: string;
          status?: 'pending' | 'completed' | 'rejected' | 'paid';
          created_at?: string;
          fulfilled_cid?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {};
  };
}; 