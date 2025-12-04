// Raw API response interface (before parsing)
export interface PolymarketMarketRaw {
  id: string;
  question: string;
  description?: string;
  endDate?: string;
  end_date_iso?: string;
  outcomes: string; // JSON-encoded string: "[\"Yes\", \"No\"]"
  outcomePrices: string; // JSON-encoded string: "[\"0.45\", \"0.55\"]"
  volume?: string;
  liquidity?: string;
  active: boolean;
  closed: boolean;
  archived?: boolean;
  tags?: Array<{ label: string }> | string[];
  market_slug?: string;
  slug?: string;
}

// Parsed interface for internal use
export interface PolymarketMarket {
  id: string;
  question: string;
  description?: string;
  endDate?: string;
  outcomes: string[];
  outcomePrices: string[];
  volume?: string;
  liquidity?: string;
  active: boolean;
  closed: boolean;
  archived?: boolean;
  tags?: Array<{ label: string }> | string[];
  market_slug?: string;
  slug?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function getPolymarketProxyUrl(): string {
  if (!SUPABASE_URL) {
    throw new Error('VITE_SUPABASE_URL is not configured. Please check your .env file.');
  }
  return `${SUPABASE_URL}/functions/v1/polymarket-proxy`;
}

export async function fetchPolymarketMarkets(): Promise<PolymarketMarket[]> {
  try {
    // Validate environment variables
    if (!SUPABASE_URL) {
      console.error('[Polymarket] Missing VITE_SUPABASE_URL');
      throw new Error('Missing Supabase URL configuration. Please restart the dev server after updating .env');
    }
    if (!SUPABASE_ANON_KEY) {
      console.error('[Polymarket] Missing VITE_SUPABASE_ANON_KEY');
      throw new Error('Missing Supabase anon key configuration. Please restart the dev server after updating .env');
    }

    const proxyUrl = getPolymarketProxyUrl();
    const requestUrl = `${proxyUrl}?limit=200&closed=false`;
    
    console.log(`[Polymarket] Fetching via Supabase proxy: ${requestUrl}`);
    
    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    console.log(`[Polymarket] Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Polymarket] Error response body:`, errorText);
      
      let errorMessage = `Polymarket proxy error: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error) {
          errorMessage = errorJson.error;
        }
        if (errorJson.details) {
          errorMessage += ` - ${errorJson.details}`;
        }
      } catch {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Handle error response from proxy
    if (data.error) {
      console.error('[Polymarket] Proxy returned error:', data.error);
      throw new Error(data.error);
    }
    
    // Handle both array response and object with markets property
    const rawMarkets: PolymarketMarketRaw[] = Array.isArray(data) ? data : (data.markets || []);
    console.log(`[Polymarket] Received ${rawMarkets.length} total markets (raw)`);

    // Parse JSON-encoded fields and filter
    const parsedMarkets: PolymarketMarket[] = [];
    let parseErrors = 0;

    for (const rawMarket of rawMarkets) {
      try {
        // Parse JSON-encoded strings
        const outcomes = typeof rawMarket.outcomes === 'string' 
          ? JSON.parse(rawMarket.outcomes) 
          : rawMarket.outcomes;
        
        const outcomePrices = typeof rawMarket.outcomePrices === 'string'
          ? JSON.parse(rawMarket.outcomePrices)
          : rawMarket.outcomePrices;

        // Create parsed market object
        const parsedMarket: PolymarketMarket = {
          ...rawMarket,
          outcomes,
          outcomePrices
        };

        // Apply filters
        const isActive = parsedMarket.active === true;
        const isNotClosed = parsedMarket.closed !== true;
        const isNotArchived = parsedMarket.archived !== true;
        const hasTwoOutcomes = Array.isArray(parsedMarket.outcomes) && parsedMarket.outcomes.length === 2;
        const hasPrices = Array.isArray(parsedMarket.outcomePrices) && parsedMarket.outcomePrices.length === 2;

        if (isActive && isNotClosed && isNotArchived && hasTwoOutcomes && hasPrices) {
          parsedMarkets.push(parsedMarket);
        }
      } catch (e) {
        parseErrors++;
        if (parseErrors <= 3) {
          console.warn('[Polymarket] Failed to parse market:', rawMarket.id, e);
        }
      }
    }

    if (parseErrors > 0) {
      console.warn(`[Polymarket] Failed to parse ${parseErrors} markets`);
    }

    console.log(`[Polymarket] Successfully parsed and filtered to ${parsedMarkets.length} active binary markets`);
    
    return parsedMarkets;
  } catch (error) {
    console.error('[Polymarket] Error fetching markets:', error);
    throw error; // Re-throw to let caller handle
  }
}

export function normalizePolymarketMarket(market: PolymarketMarket) {
  // Handle tags that might be objects or strings
  const tags: string[] = market.tags 
    ? market.tags.map((tag: { label: string } | string) => 
        typeof tag === 'string' ? tag : tag.label
      )
    : [];

  // Ensure outcomes and prices are arrays (defensive programming)
  const outcomes = Array.isArray(market.outcomes) ? market.outcomes : [];
  const outcomePrices = Array.isArray(market.outcomePrices) ? market.outcomePrices : [];

  return {
    id: market.id,
    platform: 'Polymarket',
    question: market.question,
    description: market.description || market.question,
    outcomes: outcomes,
    prices: outcomePrices.map(price => parseFloat(price) * 100),
    expiresAt: market.endDate || market.end_date_iso || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    liquidity: parseFloat(market.liquidity || '0'),
    volume: parseFloat(market.volume || '0'),
    tags,
    slug: market.market_slug || market.slug || ''
  };
}
