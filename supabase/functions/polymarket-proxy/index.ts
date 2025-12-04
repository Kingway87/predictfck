import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Polymarket API endpoints
const POLYMARKET_GAMMA_URL = 'https://gamma-api.polymarket.com';
const POLYMARKET_CLOB_URL = 'https://clob.polymarket.com';

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') || '100';
    const offset = url.searchParams.get('offset') || '0';
    const closed = url.searchParams.get('closed') || 'false';
    
    console.log(`[Polymarket Proxy] Fetching markets: limit=${limit}, offset=${offset}, closed=${closed}`);
    
    // Try Gamma API first (better for market data)
    const gammaUrl = `${POLYMARKET_GAMMA_URL}/markets?limit=${limit}&offset=${offset}&closed=${closed}&active=true`;
    console.log(`[Polymarket Proxy] Target URL: ${gammaUrl}`);
    
    let response = await fetch(gammaUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'ArbitrageScanner/1.0',
      },
    });

    console.log(`[Polymarket Proxy] Gamma API response status: ${response.status}`);

    // If Gamma API fails, try CLOB API as fallback
    if (!response.ok) {
      console.log(`[Polymarket Proxy] Gamma API failed, trying CLOB API fallback...`);
      
      const clobUrl = `${POLYMARKET_CLOB_URL}/markets`;
      console.log(`[Polymarket Proxy] Fallback URL: ${clobUrl}`);
      
      response = await fetch(clobUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ArbitrageScanner/1.0',
        },
      });
      
      console.log(`[Polymarket Proxy] CLOB API response status: ${response.status}`);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Polymarket Proxy] All APIs failed: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Polymarket API error: ${response.status}`,
          details: errorText,
          triedEndpoints: [gammaUrl, `${POLYMARKET_CLOB_URL}/markets`],
          timestamp: new Date().toISOString()
        }),
        {
          status: response.status,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const data = await response.json();
    const marketCount = Array.isArray(data) ? data.length : (data.markets?.length || 'unknown');
    console.log(`[Polymarket Proxy] Successfully fetched ${marketCount} markets`);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Polymarket Proxy] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'proxy_error',
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
