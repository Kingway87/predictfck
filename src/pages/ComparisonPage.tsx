import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Search, Filter } from 'lucide-react';
import { fetchPolymarketMarkets, normalizePolymarketMarket } from '../services/polymarket';
import { fetchKalshiMarkets, normalizeKalshiMarket } from '../services/kalshi';
import { findMarketMatches, MarketMatch } from '../services/marketMatcher';

export default function ComparisonPage() {
    const [matches, setMatches] = useState<MarketMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [minSimilarity, setMinSimilarity] = useState(0.3);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [polyMarkets, kalshiMarkets] = await Promise.all([
                fetchPolymarketMarkets(),
                fetchKalshiMarkets()
            ]);

            const normalizedPoly = polyMarkets.map(normalizePolymarketMarket);
            const normalizedKalshi = kalshiMarkets.map(normalizeKalshiMarket);

            // Find all matches, not just arbitrage
            const foundMatches = findMarketMatches(normalizedPoly, normalizedKalshi, minSimilarity, false);
            setMatches(foundMatches);
        } catch (err) {
            console.error('Failed to load markets:', err);
            setError('Failed to load market data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [minSimilarity]);

    const filteredMatches = matches.filter(match =>
        match.polymarket.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.kalshi.question.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Polymarket vs Kalshi
                    </h1>
                    <p className="text-zinc-400 text-lg">
                        Compare prices and probabilities across major prediction markets
                    </p>
                </div>

                <button
                    onClick={loadData}
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    <span className="font-medium">Refresh Data</span>
                </button>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Search markets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-brand transition-colors"
                        />
                    </div>
                    <div className="flex items-center gap-4 bg-black/50 border border-zinc-700 rounded-xl px-4 py-3">
                        <Filter className="w-5 h-5 text-zinc-500" />
                        <span className="text-zinc-400 whitespace-nowrap">Min Similarity:</span>
                        <input
                            type="range"
                            min="0.1"
                            max="0.9"
                            step="0.1"
                            value={minSimilarity}
                            onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
                            className="w-32 accent-brand"
                        />
                        <span className="text-white font-mono w-8">{minSimilarity}</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-red-400 text-center">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="w-12 h-12 text-brand animate-spin mb-4" />
                    <p className="text-zinc-400">Scanning markets across platforms...</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800">
                                <th className="text-left py-4 px-6 text-zinc-400 font-medium">Market</th>
                                <th className="text-center py-4 px-6 text-zinc-400 font-medium">Polymarket</th>
                                <th className="text-center py-4 px-6 text-zinc-400 font-medium">Kalshi</th>
                                <th className="text-center py-4 px-6 text-zinc-400 font-medium">Spread</th>
                                <th className="text-right py-4 px-6 text-zinc-400 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {filteredMatches.map((match, idx) => (
                                <tr key={idx} className="group hover:bg-zinc-900/30 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-white group-hover:text-brand transition-colors">
                                            {match.polymarket.question}
                                        </div>
                                        <div className="text-sm text-zinc-500 mt-1">
                                            Similarity: {(match.similarity * 100).toFixed(0)}%
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-green-400 font-mono">Yes: {match.polymarket.prices[0].toFixed(1)}¢</div>
                                            <div className="text-red-400 font-mono text-sm">No: {match.polymarket.prices[1].toFixed(1)}¢</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="text-green-400 font-mono">Yes: {match.kalshi.prices[0].toFixed(1)}¢</div>
                                            <div className="text-red-400 font-mono text-sm">No: {match.kalshi.prices[1].toFixed(1)}¢</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <div className={`font-mono font-bold ${match.profitMargin > 0 ? 'text-green-400' : 'text-zinc-500'}`}>
                                            {match.profitMargin > 0 ? '+' : ''}{match.profitMargin.toFixed(2)}%
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <a
                                                href={`https://polymarket.com/event/${match.polymarket.slug}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-blue-400"
                                                title="View on Polymarket"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                            <a
                                                href={`https://kalshi.com/markets/${match.kalshi.ticker}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-green-400"
                                                title="View on Kalshi"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredMatches.length === 0 && (
                        <div className="text-center py-20 text-zinc-500">
                            No matching markets found. Try adjusting the similarity threshold.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
