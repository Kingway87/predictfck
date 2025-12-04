import { fetchPolymarketMarkets, normalizePolymarketMarket } from '../services/polymarket';
import { fetchKalshiMarkets, normalizeKalshiMarket } from '../services/kalshi';
import { calculateSimilarity, findMarketMatches } from '../services/marketMatcher';

interface TestResult {
  success: boolean;
  count?: number;
  matches?: number;
  error?: string;
  details?: string;
}

export async function testPolymarketAPI(): Promise<TestResult> {
  console.log('🔍 Testing Polymarket API via Supabase Edge Function...');
  console.log('📍 Proxy: Supabase Edge Function -> https://gamma-api.polymarket.com/markets');
  
  try {
    const markets = await fetchPolymarketMarkets();
    console.log(`✅ Polymarket API working! Found ${markets.length} active markets`);

    if (markets.length > 0) {
      const sample = normalizePolymarketMarket(markets[0]);
      console.log('📊 Sample Polymarket market:', {
        id: sample.id,
        question: sample.question,
        outcomes: sample.outcomes,
        prices: sample.prices,
        liquidity: sample.liquidity,
        platform: sample.platform
      });
    }

    return { success: true, count: markets.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Polymarket API error:', errorMessage);
    
    let details = '';
    if (errorMessage.includes('Missing Supabase')) {
      details = 'Check your .env file and restart the dev server';
    } else if (errorMessage.includes('401')) {
      details = 'Authentication error. Verify your VITE_SUPABASE_ANON_KEY in .env';
    } else if (errorMessage.includes('500')) {
      details = 'Edge function error. Check Supabase dashboard logs.';
    }
    
    return { success: false, error: errorMessage, details };
  }
}

export async function testKalshiAPI(): Promise<TestResult> {
  console.log('🔍 Testing Kalshi API via Supabase Edge Function...');
  console.log('📍 Proxy: Supabase Edge Function -> https://api.elections.kalshi.com/trade-api/v2/markets');
  
  try {
    const markets = await fetchKalshiMarkets();
    console.log(`✅ Kalshi API working! Found ${markets.length} binary markets`);

    if (markets.length > 0) {
      const sample = normalizeKalshiMarket(markets[0]);
      console.log('📊 Sample Kalshi market:', {
        ticker: sample.ticker,
        question: sample.question,
        outcomes: sample.outcomes,
        prices: sample.prices,
        liquidity: sample.liquidity,
        platform: sample.platform
      });
    }

    return { success: true, count: markets.length };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Kalshi API error:', errorMessage);
    
    let details = '';
    if (errorMessage.includes('Missing Supabase')) {
      details = 'Check your .env file and restart the dev server';
    } else if (errorMessage.includes('401')) {
      details = 'Authentication error. Verify your VITE_SUPABASE_ANON_KEY in .env';
    } else if (errorMessage.includes('500') || errorMessage.includes('demo-api')) {
      details = 'Edge function error. May need redeployment.';
    }
    
    return { success: false, error: errorMessage, details };
  }
}

export async function testMarketMatching(): Promise<TestResult> {
  console.log('🔍 Testing market matching algorithm...');
  
  try {
    const [polyResult, kalshiResult] = await Promise.allSettled([
      fetchPolymarketMarkets(),
      fetchKalshiMarkets()
    ]);

    const polymarkets = polyResult.status === 'fulfilled' ? polyResult.value : [];
    const kalshiMarkets = kalshiResult.status === 'fulfilled' ? kalshiResult.value : [];

    if (polymarkets.length === 0 && kalshiMarkets.length === 0) {
      console.warn('⚠️ Cannot test matching - no market data available');
      return { 
        success: false, 
        error: 'No markets available from either platform',
        details: 'Fix the API connections first before testing matching'
      };
    }

    if (polymarkets.length === 0) {
      return { success: false, error: 'No Polymarket data - cannot match', details: 'Polymarket API is not working' };
    }

    if (kalshiMarkets.length === 0) {
      return { success: false, error: 'No Kalshi data - cannot match', details: 'Kalshi API is not working' };
    }

    const normalizedPoly = polymarkets.slice(0, 50).map(normalizePolymarketMarket);
    const normalizedKalshi = kalshiMarkets.slice(0, 50).map(normalizeKalshiMarket);

    console.log('🔗 Testing similarity calculations...');
    const testPairs = [
      { q1: normalizedPoly[0].question, q2: normalizedKalshi[0].question }
    ];

    for (const pair of testPairs) {
      const similarity = calculateSimilarity(pair.q1, pair.q2);
      console.log(`Similarity between:\n  "${pair.q1}"\n  "${pair.q2}"\n  Score: ${(similarity * 100).toFixed(1)}%`);
    }

    const matches = findMarketMatches(normalizedPoly, normalizedKalshi, 0.35);
    console.log(`✅ Market matching working! Found ${matches.length} matches`);

    if (matches.length > 0) {
      console.log('📊 Top match:', {
        polymarket: matches[0].polymarket.question,
        kalshi: matches[0].kalshi.question,
        similarity: `${(matches[0].similarity * 100).toFixed(1)}%`,
        profitMargin: `${matches[0].profitMargin.toFixed(2)}%`
      });
    }

    return { success: true, matches: matches.length };
  } catch (error) {
    console.error('❌ Market matching error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function runAllTests() {
  console.log('🚀 Starting API Integration Tests...\n');
  console.log('=' .repeat(60));
  console.log('ℹ️  Using Supabase Edge Functions (Pro Plan)');
  console.log('=' .repeat(60));
  console.log('');

  const polyTest = await testPolymarketAPI();
  console.log('');
  console.log('-'.repeat(60));

  const kalshiTest = await testKalshiAPI();
  console.log('');
  console.log('-'.repeat(60));

  const matchingTest = await testMarketMatching();
  console.log('');
  console.log('='.repeat(60));

  console.log('📋 Test Summary:');
  console.log(`  Polymarket API: ${polyTest.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!polyTest.success && polyTest.details) {
    console.log(`    └─ ${polyTest.details}`);
  }
  
  console.log(`  Kalshi API: ${kalshiTest.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!kalshiTest.success && kalshiTest.details) {
    console.log(`    └─ ${kalshiTest.details}`);
  }
  
  console.log(`  Market Matching: ${matchingTest.success ? '✅ PASS' : '❌ FAIL'}`);
  if (!matchingTest.success && matchingTest.details) {
    console.log(`    └─ ${matchingTest.details}`);
  }

  const allPassed = polyTest.success && kalshiTest.success && matchingTest.success;
  console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed - see details above'}`);

  return {
    polymarket: polyTest,
    kalshi: kalshiTest,
    matching: matchingTest,
    allPassed
  };
}
