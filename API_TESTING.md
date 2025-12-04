# API Integration Testing Guide

## Overview

The arbitrage scanner now integrates with real APIs from Polymarket and Kalshi to detect live arbitrage opportunities across prediction markets.

## How It Works

### 1. Market Data Fetching

**Polymarket API:**
- Endpoint: `https://clob.polymarket.com/markets`
- Fetches active binary markets
- Returns market prices, liquidity, and expiration data

**Kalshi API:**
- Endpoint: `https://api.elections.kalshi.com/trade-api/v2/markets`
- Fetches active binary markets
- Returns bid/ask prices and market metadata

### 2. Market Matching Algorithm

The scanner uses semantic similarity to match markets across platforms:

- **Tokenization**: Breaks questions into words
- **Jaccard Similarity**: Calculates overlap between question terms
- **Term Weighting**: Prioritizes longer, more meaningful terms
- **Threshold**: Matches require 35%+ similarity score

### 3. Arbitrage Detection

For each matched market pair:

1. Calculate combined prices for all outcome combinations
2. Find combinations where `price_a + price_b < 100%`
3. Account for fees:
   - Polymarket: $0.05 gas fee
   - Kalshi: 1% platform fee
4. Calculate net profit margin after fees
5. Store opportunities with ROI > 0.5%

### 4. Categories

Markets are auto-categorized based on keywords:
- **Politics**: election, president, senate, congress
- **Economics**: fed, rate, inflation, gdp, unemployment
- **Crypto**: bitcoin, ethereum, crypto, blockchain
- **Sports**: nba, nfl, mlb, playoffs, championship
- **Technology**: apple, google, ai, openai, meta
- **Entertainment**: movie, oscar, grammy, box office
- **Weather**: hurricane, temperature, storm, climate

## Testing the API Integration

### Step 1: Open the Dashboard

Navigate to `/dashboard` in the application.

### Step 2: Click "Scan Markets"

The green "Scan Markets" button will:
1. Fetch all active markets from Polymarket (may take 5-10 seconds)
2. Fetch all active markets from Kalshi (may take 5-10 seconds)
3. Match markets using semantic similarity
4. Calculate arbitrage opportunities
5. Store results in the database
6. Display success message with results

### Step 3: Review Results

After scanning completes:
- View the number of opportunities found
- Filter by category (Politics, Economics, Crypto, etc.)
- Sort by highest ROI or most recent
- Click on opportunities to see details

### Step 4: Verify Data

Each opportunity card shows:
- Event name and description
- Platform names (Polymarket/Kalshi)
- Outcome being bet on each platform
- Price percentages
- Expected ROI
- Minimum investment amount
- Time until expiration

### Step 5: Use the Calculator

Scroll down to the calculator to:
- Manually verify the arbitrage math
- Test different price combinations
- See detailed fee breakdowns
- Understand risk warnings

## Expected Results

### First Scan

The first scan may take 20-30 seconds as it:
- Fetches 100+ markets from Polymarket
- Fetches 50+ markets from Kalshi
- Performs semantic matching across all pairs
- Calculates arbitrage for valid matches

### Typical Findings

You should expect:
- 10-50 market matches (depending on similarity threshold)
- 5-20 arbitrage opportunities (depending on market conditions)
- ROI ranging from 0.5% to 5%
- Various categories represented

### Edge Cases

Some scans may find:
- Zero opportunities (markets are efficient)
- Many opportunities (high volatility period)
- Errors (API rate limits or network issues)

## Troubleshooting

### No Opportunities Found

If the scan completes but finds no opportunities:
1. **Market Efficiency**: Arbitrage opportunities are rare and short-lived
2. **Fees Too High**: Many potential arbitrages are eliminated by fees
3. **API Issues**: Check browser console for API errors
4. **Similarity Threshold**: Markets may not be matching (check logs)

### Scan Errors

If you see error messages:
1. **CORS Issues**: APIs may block browser requests
2. **Rate Limits**: Too many requests in short time
3. **Network Errors**: Check internet connection
4. **API Changes**: Endpoints may have changed

### Performance Tips

For faster scans:
1. Use the "Refresh" button to reload existing data
2. Filter by specific categories
3. Check console logs for detailed progress
4. Scan during high-volume periods (before major events)

## API Response Examples

### Polymarket Market Example
```json
{
  "condition_id": "0x1234...",
  "question": "Will Bitcoin be above $50,000 on Dec 31?",
  "outcomes": ["Yes", "No"],
  "outcomePrices": ["0.45", "0.55"],
  "active": true,
  "end_date_iso": "2024-12-31T23:59:59Z"
}
```

### Kalshi Market Example
```json
{
  "ticker": "KXBTC-24DEC31-B50000",
  "title": "Will Bitcoin be above $50,000?",
  "yes_ask": 47,
  "no_ask": 53,
  "status": "active",
  "expiration_time": "2024-12-31T23:59:59Z"
}
```

## Next Steps

After successful testing:
1. Set up automated scanning (cron job or scheduled function)
2. Add WebSocket support for real-time price updates
3. Implement email notifications for high-ROI opportunities
4. Add price history charts
5. Create user watchlists and preferences

## Important Notes

- **Real Money**: These are real markets with real money at stake
- **No Guarantees**: Displayed opportunities may no longer exist by the time you act
- **Fee Accuracy**: Actual fees may vary from estimates
- **Oracle Risk**: Platforms may resolve markets differently
- **Execution Speed**: Prices change rapidly, act quickly or opportunities vanish
