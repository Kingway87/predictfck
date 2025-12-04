import { supabase } from '../lib/supabase';
import { fetchPolymarketMarkets, normalizePolymarketMarket, PolymarketMarket } from './polymarket';
import { fetchKalshiMarkets, normalizeKalshiMarket, KalshiMarket } from './kalshi';
import { findMarketMatches, categorizeMarket } from './marketMatcher';

export interface ScanResult {
  opportunitiesFound: number;
  opportunitiesAdded: number;
  errors: string[];
  timestamp: Date;
  polymarketCount?: number;
  kalshiCount?: number;
}

export async function scanForArbitrageOpportunities(): Promise<ScanResult> {
  const result: ScanResult = {
    opportunitiesFound: 0,
    opportunitiesAdded: 0,
    errors: [],
    timestamp: new Date(),
    polymarketCount: 0,
    kalshiCount: 0
  };

  try {
    console.log('🔍 Starting arbitrage market scan...');
    console.log('📡 Fetching markets from both platforms in parallel...');

    // Fetch both platforms in parallel with individual error handling
    const [polyResult, kalshiResult] = await Promise.allSettled([
      fetchPolymarketMarkets(),
      fetchKalshiMarkets()
    ]);

    let polymarketMarkets: PolymarketMarket[] = [];
    let kalshiMarkets: KalshiMarket[] = [];

    // Handle Polymarket result
    if (polyResult.status === 'fulfilled') {
      polymarketMarkets = polyResult.value;
      result.polymarketCount = polymarketMarkets.length;
      console.log(`✅ Polymarket: Found ${polymarketMarkets.length} active binary markets`);
    } else {
      const errorMsg = `Polymarket fetch failed: ${polyResult.reason instanceof Error ? polyResult.reason.message : String(polyResult.reason)}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    // Handle Kalshi result
    if (kalshiResult.status === 'fulfilled') {
      kalshiMarkets = kalshiResult.value;
      result.kalshiCount = kalshiMarkets.length;
      console.log(`✅ Kalshi: Found ${kalshiMarkets.length} active binary markets`);
    } else {
      const errorMsg = `Kalshi fetch failed: ${kalshiResult.reason instanceof Error ? kalshiResult.reason.message : String(kalshiResult.reason)}`;
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
    }

    // Check if we have enough data to proceed
    if (polymarketMarkets.length === 0 && kalshiMarkets.length === 0) {
      const errorMsg = 'No markets fetched from either platform. Cannot scan for arbitrage.';
      console.error(`❌ ${errorMsg}`);
      result.errors.push(errorMsg);
      return result;
    }

    if (polymarketMarkets.length === 0) {
      console.warn('⚠️ No Polymarket markets available. Cannot find cross-platform arbitrage.');
      result.errors.push('No Polymarket markets available');
      return result;
    }

    if (kalshiMarkets.length === 0) {
      console.warn('⚠️ No Kalshi markets available. Cannot find cross-platform arbitrage.');
      result.errors.push('No Kalshi markets available');
      return result;
    }

    // Normalize markets
    console.log('🔄 Normalizing market data...');
    const normalizedPolymarkets = polymarketMarkets.map(normalizePolymarketMarket);
    const normalizedKalshi = kalshiMarkets.map(normalizeKalshiMarket);

    // Find matches
    console.log('🔗 Finding market matches using semantic similarity...');
    const matches = findMarketMatches(normalizedPolymarkets, normalizedKalshi, 0.35);
    console.log(`📊 Found ${matches.length} potential arbitrage opportunities`);

    result.opportunitiesFound = matches.length;

    if (matches.length === 0) {
      console.log('ℹ️ No matching markets found. This is normal - markets may not overlap.');
      return result;
    }

    // Deactivate old opportunities
    console.log('🗑️ Deactivating previous opportunities...');
    const { error: deactivateError } = await supabase
      .from('arbitrage_opportunities')
      .update({ is_active: false })
      .eq('is_active', true);

    if (deactivateError) {
      console.error('⚠️ Error deactivating old opportunities:', deactivateError);
      result.errors.push(`Database update error: ${deactivateError.message}`);
    }

    // Insert new opportunities
    console.log('💾 Saving new opportunities...');
    for (const match of matches) {
      // Skip opportunities with very low profit margins
      if (match.profitMargin < 0.5) {
        continue;
      }

      const category = categorizeMarket(
        match.polymarket.question,
        [...match.polymarket.tags, ...match.kalshi.tags]
      );

      const bestPriceCombo = determineBestPriceCombination(
        match.polymarket.prices,
        match.kalshi.prices
      );

      const opportunity = {
        event_name: match.polymarket.question.substring(0, 200),
        event_description: match.polymarket.description.substring(0, 500),
        platform_a: 'Polymarket',
        platform_b: 'Kalshi',
        outcome_a: match.polymarket.outcomes[bestPriceCombo.polyIndex],
        outcome_b: match.kalshi.outcomes[bestPriceCombo.kalshiIndex],
        price_a: Math.round(match.polymarket.prices[bestPriceCombo.polyIndex] * 100) / 100,
        price_b: Math.round(match.kalshi.prices[bestPriceCombo.kalshiIndex] * 100) / 100,
        profit_margin: Math.round(match.profitMargin * 100) / 100,
        investment_required: calculateMinimumInvestment(match.profitMargin),
        category,
        expires_at: new Date(match.polymarket.expiresAt).toISOString(),
        is_active: true
      };

      const { error } = await supabase
        .from('arbitrage_opportunities')
        .insert([opportunity]);

      if (error) {
        console.error('❌ Error inserting opportunity:', error);
        const errorDetails = error.message + (error.details ? ` (${error.details})` : '') + (error.hint ? ` [Hint: ${error.hint}]` : '');
        result.errors.push(`Failed to insert "${match.polymarket.question.substring(0, 30)}...": ${errorDetails}`);
      } else {
        result.opportunitiesAdded++;
      }
    }

    console.log(`✅ Scan complete: ${result.opportunitiesAdded} opportunities added to database`);
    return result;

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error during scan';
    console.error('💥 Fatal scan error:', error);
    result.errors.push(errorMsg);
    return result;
  }
}

function determineBestPriceCombination(pricesA: number[], pricesB: number[]) {
  const combinations = [
    { polyIndex: 0, kalshiIndex: 1, total: pricesA[0] + pricesB[1] },
    { polyIndex: 1, kalshiIndex: 0, total: pricesA[1] + pricesB[0] }
  ];

  return combinations.sort((a, b) => a.total - b.total)[0];
}

function calculateMinimumInvestment(profitMargin: number): number {
  if (profitMargin >= 5) return 100;
  if (profitMargin >= 3) return 250;
  if (profitMargin >= 2) return 500;
  if (profitMargin >= 1) return 1000;
  return 2000;
}
