import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

// Production Kalshi API endpoint
const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';

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
    const status = url.searchParams.get('status') || 'open';
    const limit = url.searchParams.get('limit') || '200';
    
    console.log(`[Kalshi Proxy] Fetching markets: status=${status}, limit=${limit}`);
    console.log(`[Kalshi Proxy] Target URL: ${KALSHI_API_BASE}/markets?status=${status}&limit=${limit}`);
    
    const response = await fetch(`${KALSHI_API_BASE}/markets?status=${status}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'ArbitrageScanner/1.0',
      },
    });

    console.log(`[Kalshi Proxy] Response status: ${response.status}`);
    console.log(`[Kalshi Proxy] Response headers:`, Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Kalshi Proxy] API error: ${response.status} - ${errorText}`);
      
      return new Response(
        JSON.stringify({ 
          error: `Kalshi API error: ${response.status}`,
          details: errorText,
          endpoint: `${KALSHI_API_BASE}/markets`,
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
    const marketCount = data.markets?.length || 0;
    console.log(`[Kalshi Proxy] Successfully fetched ${marketCount} markets`);

    return new Response(JSON.stringify(data), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[Kalshi Proxy] Error:', error);
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
