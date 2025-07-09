# Zora Creator Bounty Board

A decentralized commission platform where creators deploy ERC-20 bounty tokens using Zora Coin SDK. Supporters mint these tokens to request custom work, with fulfillment status tracked off-chain via Supabase. Creators deliver content by storing IPFS CIDs in Supabase, maintaining full ownership while eliminating intermediaries.

## 🚀 Features

- **ERC-20 Bounty Tokens**: Creator-specific tokens representing commission types
- **Hybrid State Management**: On-chain minting + off-chain fulfillment tracking
- **IPFS Content Delivery**: Permanent storage of custom creative work
- **Creator Reputation**: On-demand scoring via Supabase functions
- **Real-time Updates**: Supabase Realtime for instant status changes
- **Wallet Integration**: RainbowKit + Wagmi for seamless wallet connections

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Blockchain**: Zora Network + Viem + Wagmi
- **Database**: Supabase (PostgreSQL)
- **Storage**: IPFS (Pinata)
- **Wallet**: RainbowKit

## 📁 Project Structure

```
zora-bounty-board/
├── app/
│   ├── layout.tsx                  # Root layout with wallet provider
│   ├── page.tsx                    # Homepage
│   ├── (creator)/
│   │   ├── dashboard/page.tsx      # Creator requests view
│   │   ├── new-bounty/page.tsx     # Token creation UI
│   │   └── fulfill/[id]/page.tsx   # Content fulfillment
│   ├── (supporter)/
│   │   ├── browse/page.tsx         # Active bounties
│   │   └── commissions/page.tsx    # User's minted bounties
│   └── api/
│       ├── mint/route.ts           # Mint endpoint
│       ├── fulfill/route.ts        # CID storage
│       └── events/route.ts         # Viem webhook handler
├── lib/
│   ├── zoraSDK.ts                  # Zora Coin SDK wrapper
│   ├── supabase.ts                 # Supabase client
│   ├── viemClient.ts               # Viem + event listeners
│   └── ipfs.ts                     # IPFS pinning (Pinata)
├── components/
│   ├── BountyCard.tsx              # Bounty display
│   ├── StatusBadge.tsx             # Request state indicator
│   └── WalletProvider.tsx          # wagmi context
├── types/
│   ├── bountyTypes.ts              # TS interfaces
│   └── supabase.ts                 # Database types
├── supabase/
│   └── migrations/                 # Database schema
└── package.json
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Pinata account (for IPFS)
- Zora network access

### 1. Clone and Install

```bash
git clone <repository-url>
cd zora-bounty-board
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Zora (Testnet)
ZORA_NETWORK=zora-testnet

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# IPFS (Pinata)
PINATA_API_KEY=your-key
PINATA_SECRET_API_KEY=your-secret

# Viem (Testnet)
ALCHEMY_ZORA_KEY=your-alchemy-zora-testnet-key
```

### 3. Database Setup

1. Create a new Supabase project
2. Run the migration:

```bash
# If you have Supabase CLI installed
supabase db push

# Or manually run the SQL from supabase/migrations/001_initial_schema.sql
```

### 4. Generate Types

```bash
# Generate Supabase types (if using CLI)
supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

### 5. Start Development

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Configuration

### Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key from Settings > API
3. Enable Row Level Security (RLS) on all tables
4. Set up authentication if needed

### Pinata Setup

1. Create an account at [pinata.cloud](https://pinata.cloud)
2. Generate API keys from your dashboard
3. Add keys to your environment variables

### Zora Network

The application is configured for Zora testnet by default. This uses ETH as the currency (not ZORA tokens, which are only available on Base mainnet). For production, you can switch to mainnet by changing the `ZORA_NETWORK` environment variable to `zora-mainnet`.

## 📖 Usage

### For Creators

1. **Connect Wallet**: Use the connect button to link your wallet
2. **Create Bounty**: Navigate to "Create Bounty" to deploy an ERC-20 token
3. **Manage Requests**: View and fulfill incoming requests in your dashboard
4. **Deliver Work**: Upload completed work to IPFS and mark as fulfilled

### For Supporters

1. **Browse Bounties**: View available creator services
2. **Request Tokens**: Purchase tokens to request work
3. **Submit Requests**: Provide detailed prompts for custom work
4. **Track Progress**: Monitor request status and receive completed work

## 🔄 Workflow

### Bounty Creation
1. Creator deploys ERC-20 token on Zora network
2. Token metadata stored on IPFS
3. Bounty record created in Supabase
4. Bounty appears in public marketplace

### Request Process
1. Supporter mints tokens from creator's contract
2. Request created in Supabase with prompt
3. Creator notified of new request
4. Creator fulfills or rejects request

### Fulfillment
1. Creator uploads work to IPFS
2. IPFS CID stored in request record
3. Request status updated to "completed"
4. Creator reputation updated

## 🛡️ Security

- **Row Level Security**: Database access controlled by user authentication
- **Input Validation**: All user inputs validated on both client and server
- **IPFS Validation**: CID format validated before storage
- **Wallet Verification**: All transactions require wallet signature

## 🧪 Testing

```bash
# Run tests
npm test

# Run type checking
npm run type-check

# Run linting
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and type definitions
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions in GitHub Discussions

## 🔮 Roadmap

- [ ] Multi-chain support
- [ ] Advanced reputation system
- [ ] Dispute resolution mechanism
- [ ] Mobile app
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard

---

Built with ❤️ for the decentralized creator economy
