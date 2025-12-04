# Cross-Platform Arbitrage: Complete Technical Specification

## Core Concept

**Cross-platform arbitrage** exploits price differences between different prediction market platforms (Kalshi, Polymarket, Robinhood, Interactive Brokers) for the **exact same event**.

The goal is to buy low on one platform and sell high on another, earning a profit without taking on significant risk.

---

## How It Works

### Key Principle

Find markets on different platforms that have the **exact same outcomes** but **different prices**.

### Example from Real Markets

**Electoral College margin of victory market:**

- **Kalshi**: No @ 82¢ (for 35-64 margin)
- **Polymarket**: Yes @ 15¢ (for 35-64 margin)
- **Arbitrage opportunity**: 3% profit (97¢ total cost for guaranteed 100¢ payout)

> ⚠️ **Critical Requirement:** "Ensure your bets are exactly the same on both markets!"

Markets must have:
- ✅ Same event
- ✅ Same outcome definitions
- ✅ Same resolution criteria

---

## When Arbitrage Exists vs. Doesn't Exist

### ✅ Arbitrage EXISTS

1. **Identical markets, different prices**
   - Most straightforward case
   - Example: "Will Biden win?" - Yes @ 60¢ on Platform A, No @ 35¢ on Platform B

2. **Slightly different naming but same bets**
   - Markets named differently but actual positions are identical
   - Example: "Biden Victory" vs "Democratic Win" (when Biden is nominee)

### ❌ Arbitrage DOESN'T Exist

**Markets with the same name but different margins/ranges:**

Example:
- Kalshi has "GOP wins 33-62 seats"
- Polymarket has "GOP wins 35-65 seats"

❌ This is **NOT true arbitrage** because:
- You don't have all bases covered
- You could lose on both sides if result is between 33-35 or 62-65

---

## Binary Markets: The Math

For binary markets (Yes/No), the formula is simple:

```
If (Yes price on Platform A) + (No price on Platform B) < 100¢ → ARBITRAGE EXISTS
```

### Examples:

**NO Arbitrage:**
```
Yes @ 72¢ + No @ 35¢ = 107¢
Sum > 100¢ → No arbitrage opportunity
```

**YES Arbitrage (3% profit):**
```
Yes @ 72¢ + No @ 25¢ = 97¢
Sum < 100¢ → 3% arbitrage opportunity!
```

### Why This Works

If you own both positions for a total cost of 97¢:

- **If Yes wins**: Earn 100¢ from Yes position, lose 25¢ on No = **net 75¢** profit on 97¢ investment = **+3¢**
- **If No wins**: Earn 100¢ from No position, lose 72¢ on Yes = **net 28¢** profit on 97¢ investment = **+3¢**

**Either way, you profit 3¢!** (3% ROI)

---

## Multi-Outcome Markets

For markets with more than 2 outcomes:

```
If SUM(cheapest price for each outcome across all platforms) < 100¢ → ARBITRAGE
```

### Example: Presidential Election with 3 candidates

| Candidate | Kalshi | Polymarket | Best Price |
|-----------|--------|------------|------------|
| Biden     | 45¢    | 40¢        | **40¢** ✅  |
| Trump     | 50¢    | 48¢        | **48¢** ✅  |
| Other     | 8¢     | 15¢        | **8¢** ✅   |

**Total Cost**: 40¢ + 48¢ + 8¢ = **96¢**
**Guaranteed Payout**: 100¢
**Profit**: 4¢ (4% ROI)

---

## Contract Parameters

### Contract Length
- **Optional field**
- Allows calculation of **annualized ROI**
- Example: 3% profit over 30 days = ~36% annualized

### Principal Amount
- **Must be greater than zero**
- Represents how much you're willing to invest
- Affects position sizing and total profit

---

## Tools Available

### 1. EventArb.com
Real-time arbitrage finder across:
- Kalshi
- Polymarket
- Robinhood
- Interactive Brokers

### 2. Manual Calculators
Input prices from different platforms to check for opportunities

### 3. Automated Bots
For real-time monitoring and execution (see Technical Implementation section)

---

## Supported Platforms

| Platform | Type | Settlement | Fees |
|----------|------|------------|------|
| **Kalshi** | CFTC-regulated | USD | 1% platform fee |
| **Polymarket** | Crypto-based | USDC on Polygon | 0% platform fee (gas only) |
| **Robinhood** | Event contracts | USD | Commission-free |
| **Interactive Brokers** | Traditional broker | USD | Varies by account |

---

## Cross-Platform vs. Single-Platform Arbitrage

### Single-Platform (Orderbook) Arbitrage

- Exploits `sum of prices ≠ 1.0` within one market
- Buy/sell all outcomes on **same platform**
- Lower execution risk (atomic transactions)
- Example: Yes @ 48¢ + No @ 48¢ = 96¢ on Polymarket

### Cross-Platform Arbitrage

- Exploits **price differences between platforms**
- Buy on one platform, sell on another
- Higher execution risk (non-atomic)
- **Requires accounts on multiple platforms**
- **Must ensure exact same event/outcome**
- Higher profit margins due to platform isolation

---

## Market Statistics

Source: [Building a Prediction Market Arbitrage Bot](https://navnoorbawa.substack.com/p/building-a-prediction-market-arbitrage)

### Profit Data (April 2024 - April 2025)

- **$40 million** in arbitrage profits extracted from Polymarket
- Research analyzed **86 million bets** across **17,218 conditions**
- Top arbitrageur: **$2.01 million** across 4,049 transactions
- Extreme case: One trader converted **$0.02 into $58,983.36** exploiting severe mispricing

### Volume Distribution (Sept 11-17, 2025)

- **Kalshi**: 62% of prediction market volume
  - $500+ million weekly volume
  - $189M average open interest
- **Polymarket**: 37% during same period

---

## Platform Architecture

### Polymarket

**Infrastructure:**
- Hybrid-decentralized Central Limit Order Book (CLOB)
- Built on **Polygon** (Chain ID 137)
- **Off-chain matching**, **on-chain settlement**
- WebSocket API for real-time monitoring

**Costs:**
- **0% platform fee** (current)
- Gas costs: 30-100 gwei on Polygon
- Standard CLOB order: ~150,000 gas limit

**Settlement:**
- UMA's Optimistic Oracle with token-holder governance
- 2-hour challenge period
- Can be disputed with UMA tokens

### Kalshi

**Infrastructure:**
- REST API with tiered rate limits
- **Basic tier**: 20 requests/second (read), 10 requests/second (write)
- **Premier tier**: up to 100 requests/second
- Traditional orderbook system

**Settlement:**
- CFTC-regulated settlement mechanisms
- Legally binding contracts
- No blockchain involved

---

## Key Technical Challenges

### 1. Non-Atomic Execution Risk

**Problem:**
- One position may fill while hedge fails
- Creates directional exposure (you're now gambling, not arbitraging)

**Solution:**
- 5-second timeout with automatic cancellation
- 75% of matched orders execute within 950 blocks (~1 hour on Polygon)
- Use limit orders, not market orders
- Monitor fill rates before committing large capital

### 2. Oracle Risk (CRITICAL for Cross-Platform)

**Problem:**
- Different platforms may resolve the same market differently
- Platforms use different oracle systems

**Examples:**

**Polymarket:**
- UMA's Optimistic Oracle with token-holder governance
- March 2025 incident: Whale with 25% UMA voting power manipulated $7M market resolution
- Disputes resolved by UMA token vote

**Kalshi:**
- CFTC-regulated settlement
- Uses verified data sources
- Legally binding resolution

**Mitigation:**
- ⚠️ **Avoid cross-platform positions unless spread exceeds 15 cents**
- This 15¢ buffer accounts for potential oracle divergence
- Monitor historical resolution discrepancies
- Avoid subjective markets (stick to objective, verifiable outcomes)

### 3. Gas Optimization (Polymarket Only)

**Problem:**
- Polygon gas fees compress net returns on small arbitrages
- Gas prices spike during high activity

**Optimization:**
- **Minimum threshold**: 2% net ROI after gas costs
- Batch orders when possible
- Monitor gas prices before executing
- Use gas price APIs to predict optimal execution times

### 4. Execution Speed

**Observations:**
- Mispricings cluster during **volatility events**:
  - Polling releases
  - Debate nights
  - Economic data releases
  - Breaking news
- Price discovery lags real-world information by **minutes to hours**
- Strategy requires **execution frequency over position size**

**Recommendations:**
- Automated monitoring during high-volatility periods
- Position limits to avoid market impact
- Faster execution = higher profit capture

---

## Detection Algorithms

### Single-Condition Arbitrage (Same Platform)

```python
def detect_single_platform_arb(yes_price, no_price, min_profit=0.05):
    """
    Detect arbitrage on a single platform
    
    Args:
        yes_price: Price of Yes outcome (in dollars, 0-1)
        no_price: Price of No outcome (in dollars, 0-1)
        min_profit: Minimum profit threshold (default 5 cents)
    
    Returns:
        dict with arbitrage opportunity details or None
    """
    total_cost = yes_price + no_price
    
    if total_cost < 1.00:
        # Buy both positions
        profit = 1.00 - total_cost
        if profit >= min_profit:
            return {
                'type': 'buy_both',
                'yes_price': yes_price,
                'no_price': no_price,
                'total_cost': total_cost,
                'profit': profit,
                'roi': profit / total_cost
            }
    
    elif total_cost > 1.00:
        # Sell both positions (requires ability to short)
        profit = total_cost - 1.00
        if profit >= min_profit:
            return {
                'type': 'sell_both',
                'yes_price': yes_price,
                'no_price': no_price,
                'total_cost': total_cost,
                'profit': profit,
                'roi': profit / (2.00 - total_cost)
            }
    
    return None
```

### Cross-Platform Arbitrage

```python
def detect_cross_platform_arb(platform_a_price, platform_b_price, 
                               min_profit=0.05, oracle_buffer=0.15):
    """
    Detect arbitrage across two platforms
    
    Args:
        platform_a_price: Price on first platform (0-1)
        platform_b_price: Price on second platform (0-1)
        min_profit: Minimum profit threshold
        oracle_buffer: Buffer for oracle risk (default 15 cents)
    
    Returns:
        dict with arbitrage opportunity details or None
    """
    # Buy low, sell high principle
    buy_price = min(platform_a_price, platform_b_price)
    sell_price = max(platform_a_price, platform_b_price)
    
    # For opposite outcomes (e.g., Yes on A, No on B)
    total_cost = platform_a_price + (1.00 - platform_b_price)
    
    if total_cost < 1.00:
        profit = 1.00 - total_cost
        
        # Apply oracle risk buffer
        if profit >= (min_profit + oracle_buffer):
            return {
                'buy_platform': 'A' if platform_a_price < platform_b_price else 'B',
                'sell_platform': 'B' if platform_a_price < platform_b_price else 'A',
                'buy_price': buy_price,
                'sell_price': sell_price,
                'total_cost': total_cost,
                'gross_profit': profit,
                'net_profit': profit - oracle_buffer,
                'roi': (profit - oracle_buffer) / total_cost,
                'oracle_risk': 'HIGH' if profit < 0.20 else 'MEDIUM'
            }
    
    return None
```

### Multi-Outcome Arbitrage

```python
def detect_multi_outcome_arb(outcomes_prices, min_profit=0.05):
    """
    Detect arbitrage in multi-outcome markets
    
    Args:
        outcomes_prices: dict of {outcome: {platform: price}}
        Example: {
            'Biden': {'Kalshi': 0.45, 'Polymarket': 0.40},
            'Trump': {'Kalshi': 0.50, 'Polymarket': 0.48},
            'Other': {'Kalshi': 0.08, 'Polymarket': 0.15}
        }
    
    Returns:
        dict with arbitrage opportunity or None
    """
    positions = {}
    total_cost = 0
    
    # Find cheapest price for each outcome
    for outcome, prices in outcomes_prices.items():
        cheapest_platform = min(prices.items(), key=lambda x: x[1])
        positions[outcome] = {
            'platform': cheapest_platform[0],
            'price': cheapest_platform[1]
        }
        total_cost += cheapest_platform[1]
    
    if total_cost < 1.00:
        profit = 1.00 - total_cost
        if profit >= min_profit:
            return {
                'positions': positions,
                'total_cost': total_cost,
                'profit': profit,
                'roi': profit / total_cost
            }
    
    return None
```

---

## Infrastructure Requirements

### Real-Time Data Pipeline

1. **WebSocket connections** to both platforms
   - Polymarket: `wss://ws-subscriptions-clob.polymarket.com`
   - Kalshi: REST API polling (no WebSocket)

2. **Token bucket algorithm** for rate limiting
   - Prevent API throttling
   - Respect platform limits

3. **Async order execution** with timeout protection
   - Non-blocking operations
   - 5-second timeout per order
   - Automatic rollback on failure

4. **Position tracking** across platforms
   - Real-time P&L calculation
   - Risk exposure monitoring
   - Portfolio balancing

5. **Gas price monitoring** and optimization (Polymarket)
   - Use gas price oracles
   - Dynamic fee adjustment
   - Batch transactions when profitable

6. **Alert system** for opportunities
   - Push notifications
   - SMS/Email alerts
   - Discord/Telegram bots

### Python Libraries Used

```python
# Polymarket
from py_clob_client import ClobClient

# Blockchain interaction (Polygon)
from web3 import Web3

# Async operations
import asyncio
import aiohttp

# WebSocket for real-time data
import websockets

# Precise financial calculations
from decimal import Decimal

# Rate limiting
from asyncio import Semaphore
```

---

## Implementation Checklist

### Phase 1: Data Collection
- [ ] Set up Polymarket API connection
- [ ] Set up Kalshi API connection
- [ ] Implement real-time price monitoring
- [ ] Store historical price data

### Phase 2: Market Matching
- [ ] Implement fuzzy string matching for market titles
- [ ] Verify outcome definitions match
- [ ] Check resolution criteria alignment
- [ ] Build market pair database

### Phase 3: Arbitrage Detection
- [ ] Implement binary market arbitrage detection
- [ ] Implement multi-outcome arbitrage detection
- [ ] Add gas cost calculations (Polymarket)
- [ ] Add platform fee calculations
- [ ] Set minimum profit thresholds

### Phase 4: Risk Management
- [ ] Add oracle divergence buffer (15¢)
- [ ] Implement position size limits
- [ ] Add timeout protection
- [ ] Build automatic rollback system
- [ ] Monitor execution success rates

### Phase 5: Execution
- [ ] Integrate order placement APIs
- [ ] Implement atomic execution logic
- [ ] Add slippage protection
- [ ] Build transaction monitoring
- [ ] Implement profit tracking

### Phase 6: Monitoring & Alerts
- [ ] Build dashboard for opportunities
- [ ] Set up alert system
- [ ] Track historical performance
- [ ] Monitor API health
- [ ] Log all transactions

---

## Best Practices

### ✅ DO:
- Start with small position sizes
- Use limit orders, not market orders
- Monitor execution rates before scaling
- Set strict profit thresholds (min 2% after fees)
- Keep detailed logs of all trades
- Test thoroughly on small amounts first

### ❌ DON'T:
- Arbitrage markets with ambiguous resolution criteria
- Ignore oracle risk (always include 15¢ buffer for cross-platform)
- Use market orders (causes slippage)
- Trade during low liquidity periods
- Exceed platform rate limits
- Arbitrage politically charged or controversial markets (higher oracle risk)

---

## Resources

- **EventArb.com**: Real-time arbitrage scanner
- **Polymarket API Docs**: https://docs.polymarket.com
- **Kalshi API Docs**: https://docs.kalshi.com
- **Building a Prediction Market Arbitrage Bot**: https://navnoorbawa.substack.com/p/building-a-prediction-market-arbitrage
- **UMA Oracle**: https://docs.umaproject.org
- **Polygon Gas Tracker**: https://polygonscan.com/gastracker

---

## Disclaimer

This document is for educational purposes only. Prediction market trading involves financial risk. Past performance does not guarantee future results. Oracle risk is significant in cross-platform arbitrage. Always comply with local regulations and platform terms of service.

---

**Last Updated**: December 2025  
**Version**: 1.0  
**Author**: AI Arbitrage Scanner Team


