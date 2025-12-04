export interface KalshiMarket {
  ticker: string;
  event_ticker: string;
  market_type: string;
  title: string;
  subtitle: string;
  open_time: string;
  close_time: string;
  expiration_time: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  no_bid: number;
  no_ask: number;
  last_price: number;
  volume: number;
  open_interest: number;
  liquidity: number;
  strike_type?: string;
  floor_strike?: number;
  cap_strike?: number;
  category: string;
  tags: string[];
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getKalshiProxyUrl(): string {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not configured. Please check your .env file.');
  }
  return `${SUPABASE_URL}/functions/v1/kalshi-proxy`;
}

export async function fetchKalshiMarkets(): Promise<KalshiMarket[]> {
  try {
    let data;
    let usedDirectFallback = false;

    // Try proxy first if configured
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
      try {
        const proxyUrl = getKalshiProxyUrl();
        const requestUrl = `${proxyUrl}?status=open&limit=200`;

        console.log(`[Kalshi] Fetching via Supabase proxy: ${requestUrl}`);

        const response = await fetch(requestUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'apikey': SUPABASE_ANON_KEY,
          },
        });

        if (response.ok) {
          data = await response.json();
          if (data.error) {
            throw new Error(data.error);
          }
        } else {
          console.warn(`[Kalshi] Proxy request failed: ${response.status}`);
          throw new Error(`Proxy failed with status ${response.status}`);
        }
      } catch (proxyError) {
        console.warn('[Kalshi] Proxy error, attempting direct fallback:', proxyError);
        usedDirectFallback = true;
      }
    } else {
      console.warn('[Kalshi] Supabase not configured, using direct fallback');
      usedDirectFallback = true;
    }

    // Direct fallback
    if (usedDirectFallback) {
      const directUrl = 'https://api.elections.kalshi.com/trade-api/v2/markets?status=open&limit=200';
      console.log(`[Kalshi] Fetching directly: ${directUrl}`);

      const response = await fetch(directUrl);
      if (!response.ok) {
        throw new Error(`Direct fetch failed: ${response.status}`);
      }
      data = await response.json();
    }

    const markets = data.markets || [];
    console.log(`[Kalshi] Received ${markets.length} total markets`);

    const binaryMarkets = markets.filter((market: KalshiMarket) =>
      market.market_type === 'binary'
    );

    console.log(`[Kalshi] Filtered to ${binaryMarkets.length} binary markets`);

    return binaryMarkets;
  } catch (error) {
    console.error('[Kalshi] Error fetching markets:', error);
    throw error; // Re-throw to let caller handle
  }
}

export function normalizeKalshiMarket(market: KalshiMarket) {
  const yesPrice = market.yes_ask > 0 ? market.yes_ask : market.last_price;
  const noPrice = market.no_ask > 0 ? market.no_ask : (100 - market.last_price);

  return {
    id: market.ticker,
    platform: 'Kalshi',
    question: market.title,
    description: market.subtitle || market.title,
    outcomes: ['Yes', 'No'],
    prices: [yesPrice, noPrice],
    expiresAt: market.expiration_time,
    liquidity: market.liquidity || 0,
    volume: market.volume || 0,
    tags: market.tags || [],
    category: market.category || 'Other',
    ticker: market.ticker
  };
}
