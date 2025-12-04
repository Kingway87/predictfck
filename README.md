# 🎯 Predictfck - Cross-Platform Prediction Market Arbitrage Scanner

A real-time arbitrage opportunity scanner for prediction markets, comparing prices across **Polymarket** and **Kalshi** to identify profitable trading opportunities.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Pro-3ECF8E?logo=supabase)

## 📖 Overview

This application automatically scans prediction markets on Polymarket and Kalshi, identifies identical or similar events, and calculates arbitrage opportunities where you can profit by placing opposite bets across platforms.

**Live Demo**: [Your deployment URL]

## ✨ Features

- 🔄 **Real-time Market Scanning** - Fetches active markets from both platforms via Supabase Edge Functions
- 🤖 **Intelligent Matching** - Uses semantic similarity to match identical events across platforms
- 💰 **Arbitrage Detection** - Calculates profit margins accounting for platform fees
- 📊 **Visual Dashboard** - Clean UI displaying opportunities sorted by ROI
- 🏷️ **Category Filtering** - Filter by Politics, Economics, Crypto, Sports, etc.
- 🧮 **Built-in Calculator** - Validate arbitrage math before executing trades
- 📈 **Historical Tracking** - Stores opportunities in Supabase for analysis
- 🔐 **CORS-Free Architecture** - Server-side API calls via Edge Functions

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Supabase account** (free or Pro tier recommended)
- **GitHub account** (for deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Kingway87/predictfck.git
   cd predictfck
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

   Get these values from your [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API

4. **Set up the database**
   
   The project includes migrations. Apply them:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   supabase db push
   ```

5. **Deploy Edge Functions**
   ```bash
   supabase functions deploy kalshi-proxy
   supabase functions deploy polymarket-proxy
   ```

6. **Apply database policies**
   
   In your Supabase SQL Editor, run:
   ```sql
   CREATE POLICY "Enable insert for anon users"
   ON "public"."arbitrage_opportunities"
   FOR INSERT TO anon WITH CHECK (true);

   CREATE POLICY "Enable update for anon users"
   ON "public"."arbitrage_opportunities"
   FOR UPDATE TO anon USING (true) WITH CHECK (true);
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                     │
│  • Dashboard UI                                         │
│  • Market Scanner                                       │
│  • Arbitrage Calculator                                 │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Supabase Edge Functions                    │
│  • kalshi-proxy    → api.elections.kalshi.com          │
│  • polymarket-proxy → gamma-api.polymarket.com         │
│  • Handles CORS, auth, rate limiting                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│                  Supabase PostgreSQL                    │
│  • arbitrage_opportunities table                        │
│  • RLS policies for security                           │
│  • Automatic timestamps and indexes                    │
└─────────────────────────────────────────────────────────┘
```

## 📊 How It Works

### 1. Market Fetching
- Fetches 200+ markets from Polymarket via Gamma API
- Fetches 150+ markets from Kalshi via REST API
- Filters for active, binary (Yes/No) markets only

### 2. Semantic Matching
Uses string similarity (Jaccard + term overlap) to match markets:
```typescript
// Example match:
// Polymarket: "Will Trump win the 2024 election?"
// Kalshi:     "Trump 2024 Election Victory"
// Similarity: 85% → MATCH ✓
```

### 3. Arbitrage Calculation

For binary markets, arbitrage exists when:
```
(Price_A on Platform A) + (Price_B on Platform B) < 100¢
```

**Example:**
- Polymarket: Yes @ 72¢
- Kalshi: No @ 25¢
- **Total cost**: 97¢
- **Guaranteed payout**: 100¢
- **Profit**: 3¢ (3% ROI)

### 4. Fee Considerations
- **Polymarket**: 0% platform fee + ~$0.05 gas (Polygon)
- **Kalshi**: 1% platform fee
- **Minimum threshold**: 0.5% net profit after fees

## 🎮 Usage

### Running a Scan

1. Navigate to the **Dashboard**
2. Click **"Scan Markets"** button
3. Wait 10-30 seconds for results
4. View opportunities sorted by profit margin

### Understanding Results

Each opportunity card shows:
- **Event Name**: The prediction question
- **Platforms**: Which platforms to use (Polymarket/Kalshi)
- **Outcomes**: What to bet on each platform
- **Prices**: Current market prices (as percentages)
- **ROI**: Expected profit margin after fees
- **Investment**: Recommended minimum capital
- **Expiration**: When the market closes

### Using the Calculator

1. Scroll to the **Arbitrage Calculator** section
2. Enter prices from both platforms
3. View profit breakdown and step-by-step instructions
4. Check risk warnings before executing

## 🔧 Configuration

### API Rate Limits

**Kalshi:**
- Basic: 20 req/sec (read), 10 req/sec (write)
- Premier: 100 req/sec
- No API key required for public markets

**Polymarket:**
- No documented rate limits
- WebSocket available for real-time updates
- No authentication required for market data

### Database Schema

```sql
CREATE TABLE arbitrage_opportunities (
  id uuid PRIMARY KEY,
  event_name text NOT NULL,
  event_description text NOT NULL,
  platform_a text NOT NULL DEFAULT 'Polymarket',
  platform_b text NOT NULL DEFAULT 'Kalshi',
  outcome_a text NOT NULL,
  outcome_b text NOT NULL,
  price_a numeric NOT NULL CHECK (price_a >= 0 AND price_a <= 100),
  price_b numeric NOT NULL CHECK (price_b >= 0 AND price_b <= 100),
  profit_margin numeric NOT NULL CHECK (profit_margin >= 0),
  investment_required numeric NOT NULL CHECK (investment_required > 0),
  category text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);
```

## 📚 API Documentation

### Polymarket API
- **Base URL**: `https://gamma-api.polymarket.com`
- **Endpoint**: `/markets?limit=200&closed=false&active=true`
- **Response**: JSON array of market objects
- **Docs**: [docs.polymarket.com](https://docs.polymarket.com)

### Kalshi API
- **Base URL**: `https://api.elections.kalshi.com/trade-api/v2`
- **Endpoint**: `/markets?status=open&limit=200`
- **Response**: JSON object with markets array
- **Docs**: [docs.kalshi.com](https://docs.kalshi.com)

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Netlify

1. Push code to GitHub
2. Connect repository in Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variables

### Manual Build

```bash
npm run build
# Outputs to ./dist/
# Serve with any static hosting service
```

## 🧪 Testing

### Test API Connections

1. Click **"Test APIs"** button (bottom-right)
2. Click **"Run All Tests"**
3. Check console (F12) for detailed logs

**Expected output:**
```
✅ Polymarket API: Found 150-200 items
✅ Kalshi API: Found 100-150 items
✅ Market Matching: Found 10-30 matches
```

### Common Issues

**Issue**: "Missing Supabase configuration"
- **Fix**: Check `.env` file exists and has correct values
- **Fix**: Restart dev server after updating `.env`

**Issue**: "401 Unauthorized"
- **Fix**: Verify `VITE_SUPABASE_ANON_KEY` is correct
- **Fix**: Check Supabase project is active

**Issue**: "0 markets returned"
- **Fix**: Ensure Edge Functions are deployed
- **Fix**: Check Supabase logs for errors

**Issue**: "Database update error"
- **Fix**: Run database migrations
- **Fix**: Apply RLS policies (see Installation step 6)

## 📖 Resources

- **API Documentation**: [Cross-Platform Arbitrage Spec](./docs/cross_platform_arb_spec.md)
- **Debugging Guide**: [API Testing Guide](./API_TESTING.md)
- **Polymarket Analytics**: [polymarketanalytics.com](https://polymarketanalytics.com/polymarket-vs-kalshi)
- **EventArb Scanner**: [eventarb.com](https://eventarb.com)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Disclaimer

This software is for **educational purposes only**. 

- Prediction market trading involves **financial risk**
- **Oracle risk** exists in cross-platform arbitrage (different platforms may resolve markets differently)
- Past performance does **not guarantee** future results
- Always comply with local regulations and platform terms of service
- The authors are not responsible for any financial losses

## 📈 Performance Stats

Based on research (April 2024 - April 2025):
- **$40 million** in arbitrage profits extracted from prediction markets
- Top arbitrageur: **$2.01 million** across 4,049 transactions
- Average opportunity: **2-5% ROI** after fees
- Typical scan finds: **5-20 opportunities**

## 🔒 Security

- Environment variables stored in `.env` (not committed)
- Supabase Row Level Security (RLS) enabled
- No API keys exposed in frontend code
- CORS handled server-side via Edge Functions

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Kingway87**
- GitHub: [@Kingway87](https://github.com/Kingway87)
- Project: [predictfck](https://github.com/Kingway87/predictfck)

## 🙏 Acknowledgments

- [Polymarket](https://polymarket.com) for public API access
- [Kalshi](https://kalshi.com) for market data
- [Supabase](https://supabase.com) for backend infrastructure
- [Polymarket Analytics](https://polymarketanalytics.com) for inspiration
- Research: [Building a Prediction Market Arbitrage Bot](https://navnoorbawa.substack.com/p/building-a-prediction-market-arbitrage)

---

**⭐ Star this repo if you found it helpful!**

**📧 Questions?** Open an issue or discussion on GitHub.

