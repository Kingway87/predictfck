import { useState, useEffect } from 'react';
import { Filter, RefreshCw, TrendingUp, Scan, AlertCircle, CheckCircle2 } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import Calculator from '../components/Calculator';
import APITestPanel from '../components/APITestPanel';
import { supabase } from '../lib/supabase';
import { scanForArbitrageOpportunities } from '../services/scanner';

interface Opportunity {
  id: string;
  event_name: string;
  event_description: string;
  platform_a: string;
  platform_b: string;
  outcome_a: string;
  outcome_b: string;
  price_a: number;
  price_b: number;
  profit_margin: number;
  investment_required: number;
  category: string;
  expires_at: string;
  is_active: boolean;
}

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'profit' | 'recent'>('profit');

  const categories = ['all', 'Politics', 'Economics', 'Crypto', 'Sports', 'Technology', 'Entertainment', 'Weather'];

  useEffect(() => {
    console.log('[Dashboard] Fetching opportunities on mount...');
    fetchOpportunities();
  }, [selectedCategory, sortBy]);

  async function fetchOpportunities() {
    console.log('[Dashboard] fetchOpportunities called');
    setLoading(true);
    try {
      let query = supabase
        .from('arbitrage_opportunities')
        .select('*')
        .eq('is_active', true);

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      if (sortBy === 'profit') {
        query = query.order('profit_margin', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      console.log('[Dashboard] Executing Supabase query...');
      const { data, error } = await query;

      if (error) {
        console.error('[Dashboard] Supabase error:', error);
        throw error;
      }
      
      console.log('[Dashboard] Fetched opportunities:', data?.length || 0, 'items');
      console.log('[Dashboard] Sample data:', data?.[0]);
      setOpportunities(data || []);
    } catch (error) {
      console.error('[Dashboard] Error fetching opportunities:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScanMarkets() {
    console.log('[Dashboard] Starting market scan...');
    setScanning(true);
    setScanResult(null);

    try {
      const result = await scanForArbitrageOpportunities();
      console.log('[Dashboard] Scan result:', result);

      if (result.errors.length > 0) {
        console.error('[Dashboard] Scan had errors:', result.errors);
        setScanResult({
          message: `Scan completed with errors. Added ${result.opportunitiesAdded} opportunities. Errors: ${result.errors.join(', ')}`,
          type: 'error'
        });
      } else {
        console.log(`[Dashboard] Scan successful: found ${result.opportunitiesFound}, added ${result.opportunitiesAdded}`);
        setScanResult({
          message: `Scan complete! Found ${result.opportunitiesFound} matches, added ${result.opportunitiesAdded} new opportunities.`,
          type: 'success'
        });
      }

      await fetchOpportunities();
    } catch (error) {
      console.error('[Dashboard] Scan error:', error);
      setScanResult({
        message: `Scan failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setScanning(false);
      setTimeout(() => setScanResult(null), 10000);
    }
  }

  return (
    <div className="min-h-screen py-8 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Live Arbitrage Opportunities</h1>
              <p className="text-gray-400">
                Real-time detection across Polymarket and Kalshi
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleScanMarkets}
                disabled={scanning}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <Scan className={`w-4 h-4 ${scanning ? 'animate-pulse' : ''}`} />
                {scanning ? 'Scanning...' : 'Scan Markets'}
              </button>
              <button
                onClick={fetchOpportunities}
                disabled={loading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {scanResult && (
            <div className={`mb-6 p-4 rounded-lg border flex items-start gap-3 ${
              scanResult.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}>
              {scanResult.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm">{scanResult.message}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Filter:</span>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Sort:</span>
              <button
                onClick={() => setSortBy('profit')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'profit'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Highest ROI
              </button>
              <button
                onClick={() => setSortBy('recent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  sortBy === 'recent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Most Recent
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
            <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
              <TrendingUp className="w-8 h-8 text-blue-400 mb-3" />
              <div className="text-3xl font-bold mb-1">{opportunities.length}</div>
              <div className="text-sm text-gray-400">Active Opportunities</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {opportunities.length > 0
                  ? Math.max(...opportunities.map(o => o.profit_margin)).toFixed(2)
                  : '0.00'}%
              </div>
              <div className="text-sm text-gray-400">Highest ROI Available</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {opportunities.length > 0
                  ? (opportunities.reduce((sum, o) => sum + o.profit_margin, 0) / opportunities.length).toFixed(2)
                  : '0.00'}%
              </div>
              <div className="text-sm text-gray-400">Average ROI</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 bg-gray-900/50 border border-gray-800 rounded-xl">
            <Scan className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-2 text-lg font-medium">No arbitrage opportunities yet</p>
            <p className="text-sm text-gray-500 mb-4">
              Click the "Scan Markets" button above to find arbitrage opportunities
            </p>
            <button
              onClick={handleScanMarkets}
              disabled={scanning}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              <Scan className={`w-5 h-5 ${scanning ? 'animate-pulse' : ''}`} />
              {scanning ? 'Scanning Markets...' : 'Start First Scan'}
            </button>
          </div>
        ) : (
          <div className="grid gap-6 mb-12">
            {opportunities.map((opportunity) => (
              <OpportunityCard key={opportunity.id} opportunity={opportunity} />
            ))}
          </div>
        )}

        <div id="calculator" className="scroll-mt-24">
          <Calculator />
        </div>
      </div>

      <APITestPanel />
    </div>
  );
}
