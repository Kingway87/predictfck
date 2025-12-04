function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeText(text).split(' ');
}

function calculateJaccardSimilarity(tokens1: string[], tokens2: string[]): number {
  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}



export function calculateSimilarity(question1: string, question2: string): number {
  const tokens1 = tokenize(question1);
  const tokens2 = tokenize(question2);

  const jaccardScore = calculateJaccardSimilarity(tokens1, tokens2);

  const allTokens = [...new Set([...tokens1, ...tokens2])];
  const importantTerms = allTokens.filter(token => token.length > 4);
  const termOverlap = importantTerms.filter(term =>
    tokens1.includes(term) && tokens2.includes(term)
  ).length / Math.max(importantTerms.length, 1);

  return (jaccardScore * 0.6) + (termOverlap * 0.4);
}

export interface NormalizedMarket {
  id: string;
  platform: string;
  question: string;
  description: string;
  outcomes: string[];
  prices: number[];
  expiresAt: string;
  liquidity: number;
  volume: number;
  tags: string[];
  category?: string;
  slug?: string;
  ticker?: string;
}

export interface MarketMatch {
  polymarket: NormalizedMarket;
  kalshi: NormalizedMarket;
  similarity: number;
  profitMargin: number;
}

export function findMarketMatches(
  polymarkets: NormalizedMarket[],
  kalshiMarkets: NormalizedMarket[],
  minSimilarity: number = 0.4,
  onlyArbitrage: boolean = true
): MarketMatch[] {
  const matches: MarketMatch[] = [];

  for (const polyMarket of polymarkets) {
    for (const kalshiMarket of kalshiMarkets) {
      const similarity = calculateSimilarity(polyMarket.question, kalshiMarket.question);

      if (similarity >= minSimilarity) {
        const profitMargin = calculateArbitrageProfitMargin(
          polyMarket.prices,
          kalshiMarket.prices
        );

        if (!onlyArbitrage || profitMargin > 0) {
          matches.push({
            polymarket: polyMarket,
            kalshi: kalshiMarket,
            similarity,
            profitMargin
          });
        }
      }
    }
  }

  return matches.sort((a, b) => b.similarity - a.similarity);
}

function calculateArbitrageProfitMargin(pricesA: number[], pricesB: number[]): number {
  if (pricesA.length !== 2 || pricesB.length !== 2) return 0;

  const bestCombinations = [
    { a: pricesA[0], b: pricesB[1] },
    { a: pricesA[1], b: pricesB[0] }
  ];

  let maxProfit = 0;

  for (const combo of bestCombinations) {
    const totalCost = (combo.a + combo.b) / 100;

    if (totalCost < 1) {
      const polymarketGasFee = 0.05;
      const kalshiFeeRate = 0.01;

      const investment = 1000;
      const betB = (investment * (combo.b / 100)) / totalCost;
      const kalshiFee = betB * kalshiFeeRate;
      const totalFees = polymarketGasFee + kalshiFee;

      const guaranteed = investment / totalCost;
      const netProfit = guaranteed - investment - totalFees;
      const profitMargin = (netProfit / investment) * 100;

      maxProfit = Math.max(maxProfit, profitMargin);
    }
  }

  return maxProfit;
}

export function categorizeMarket(question: string, tags: string[]): string {
  const categories = {
    'Politics': ['election', 'president', 'senate', 'congress', 'political', 'vote', 'biden', 'trump', 'democrat', 'republican'],
    'Economics': ['fed', 'rate', 'inflation', 'gdp', 'unemployment', 'economy', 'recession', 'stock', 'market'],
    'Crypto': ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'blockchain', 'defi', 'nft'],
    'Sports': ['nba', 'nfl', 'mlb', 'nhl', 'soccer', 'football', 'basketball', 'baseball', 'playoff', 'championship'],
    'Technology': ['tech', 'apple', 'google', 'microsoft', 'ai', 'openai', 'meta', 'twitter', 'tesla'],
    'Entertainment': ['movie', 'film', 'oscar', 'grammy', 'emmy', 'box office', 'album', 'actor'],
    'Weather': ['hurricane', 'temperature', 'storm', 'weather', 'climate', 'snow', 'rain']
  };

  const combinedText = `${question} ${tags.join(' ')}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => combinedText.includes(keyword))) {
      return category;
    }
  }

  return 'Other';
}
