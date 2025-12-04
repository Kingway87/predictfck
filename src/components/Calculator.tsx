import { useState } from 'react';
import { Calculator as CalcIcon, AlertTriangle, Copy, CheckCircle2, Info, Zap, Clock, Droplets } from 'lucide-react';

export default function Calculator() {
  const [priceA, setPriceA] = useState<string>('');
  const [priceB, setPriceB] = useState<string>('');
  const [investment, setInvestment] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<{ priceA?: string; priceB?: string; investment?: string }>({});

  const validateInputs = () => {
    const newErrors: { priceA?: string; priceB?: string; investment?: string } = {};

    const pA = parseFloat(priceA);
    const pB = parseFloat(priceB);
    const inv = parseFloat(investment);

    if (isNaN(pA) || pA <= 0 || pA >= 100) {
      newErrors.priceA = 'Price must be between 0.01 and 99.99';
    }
    if (isNaN(pB) || pB <= 0 || pB >= 100) {
      newErrors.priceB = 'Price must be between 0.01 and 99.99';
    }
    if (isNaN(inv) || inv <= 0) {
      newErrors.investment = 'Investment must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateArbitrage = () => {
    if (!validateInputs()) return;

    const pA = parseFloat(priceA) / 100;
    const pB = parseFloat(priceB) / 100;
    const inv = parseFloat(investment);

    const totalCost = pA + pB;

    if (totalCost >= 1) {
      setResult({
        isArbitrage: false,
        message: 'No arbitrage opportunity - combined prices are too high'
      });
      return;
    }

    const betA = (inv * pA) / totalCost;
    const betB = (inv * pB) / totalCost;
    const guaranteed = inv / totalCost;

    const polymarketGasFee = 0.05;
    const kalshiFeeRate = 0.01;
    const kalshiFee = betB * kalshiFeeRate;
    const totalFees = polymarketGasFee + kalshiFee;

    const netProfit = guaranteed - inv - totalFees;
    const profitMargin = (netProfit / inv) * 100;

    setResult({
      isArbitrage: true,
      betA: betA.toFixed(2),
      betB: betB.toFixed(2),
      guaranteed: guaranteed.toFixed(2),
      grossProfit: (guaranteed - inv).toFixed(2),
      fees: {
        polymarketGas: polymarketGasFee.toFixed(2),
        kalshiFee: kalshiFee.toFixed(2),
        total: totalFees.toFixed(2)
      },
      netProfit: netProfit.toFixed(2),
      profitMargin: profitMargin.toFixed(2)
    });
  };

  const quickFill = (example: { priceA: string; priceB: string; investment: string }) => {
    setPriceA(example.priceA);
    setPriceB(example.priceB);
    setInvestment(example.investment);
    setResult(null);
    setErrors({});
  };

  const copyStrategy = () => {
    if (!result || !result.isArbitrage) return;

    const strategy = `Arbitrage Strategy:
Platform A (Polymarket): Bet $${result.betA} at ${priceA}%
Platform B (Kalshi): Bet $${result.betB} at ${priceB}%
Total Investment: $${investment}
Guaranteed Return: $${result.guaranteed}
Net Profit: $${result.netProfit} (${result.profitMargin}% ROI)

Fees Breakdown:
- Polymarket Gas: $${result.fees.polymarketGas}
- Kalshi Platform Fee: $${result.fees.kalshiFee}
- Total Fees: $${result.fees.total}`;

    navigator.clipboard.writeText(strategy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-surface border border-zinc-800 rounded-2xl p-10">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand/10 rounded-xl">
          <CalcIcon className="w-7 h-7 text-brand" />
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-white">Arbitrage Calculator</h2>
          <p className="text-sm text-zinc-400 mt-1">Calculate potential returns from price discrepancies</p>
        </div>
      </div>

      <div className="flex gap-3 mb-8 flex-wrap">
        <button
          onClick={() => quickFill({ priceA: '45', priceB: '52', investment: '1000' })}
          className="px-4 py-2 bg-black/50 hover:bg-brand/10 border border-zinc-800 hover:border-brand rounded-pill text-sm transition-all duration-300 text-white"
        >
          Example 1: 3% ROI
        </button>
        <button
          onClick={() => quickFill({ priceA: '38', priceB: '58', investment: '500' })}
          className="px-4 py-2 bg-black/50 hover:bg-brand/10 border border-zinc-800 hover:border-brand rounded-pill text-sm transition-all duration-300 text-white"
        >
          Example 2: 4% ROI
        </button>
        <button
          onClick={() => quickFill({ priceA: '42', priceB: '53', investment: '2000' })}
          className="px-4 py-2 bg-black/50 hover:bg-brand/10 border border-zinc-800 hover:border-brand rounded-pill text-sm transition-all duration-300 text-white"
        >
          Example 3: 5% ROI
        </button>
      </div>

      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-white uppercase tracking-wider">
              Price on Platform A (Polymarket) %
            </label>
            <input
              type="number"
              value={priceA}
              onChange={(e) => {
                setPriceA(e.target.value);
                setResult(null);
                setErrors({});
              }}
              placeholder="e.g., 45"
              className={`w-full bg-black/50 border ${errors.priceA ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-all text-white`}
            />
            {errors.priceA && (
              <p className="text-red-500 text-sm mt-1.5">{errors.priceA}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-white uppercase tracking-wider">
              Price on Platform B (Kalshi) %
            </label>
            <input
              type="number"
              value={priceB}
              onChange={(e) => {
                setPriceB(e.target.value);
                setResult(null);
                setErrors({});
              }}
              placeholder="e.g., 52"
              className={`w-full bg-black/50 border ${errors.priceB ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-all text-white`}
            />
            {errors.priceB && (
              <p className="text-red-500 text-sm mt-1.5">{errors.priceB}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-white uppercase tracking-wider">
            Total Investment ($)
          </label>
          <input
            type="number"
            value={investment}
            onChange={(e) => {
              setInvestment(e.target.value);
              setResult(null);
              setErrors({});
            }}
            placeholder="e.g., 1000"
            className={`w-full bg-black/50 border ${errors.investment ? 'border-red-500' : 'border-zinc-700'} rounded-xl px-4 py-3 focus:outline-none focus:border-brand transition-all text-white`}
          />
          {errors.investment && (
            <p className="text-red-500 text-sm mt-1.5">{errors.investment}</p>
          )}
        </div>

        <button
          onClick={calculateArbitrage}
          className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-pill font-semibold transition-all duration-300 transform hover:scale-[1.02]"
        >
          Calculate Arbitrage
        </button>

        {result && (
          <div className={`p-6 rounded-lg border ${result.isArbitrage ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
            {result.isArbitrage ? (
              <>
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-1">Arbitrage Opportunity!</h3>
                    <p className="text-sm text-gray-400">Split your investment as follows:</p>
                  </div>
                  <button
                    onClick={copyStrategy}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Strategy'}
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-black/50 rounded-xl p-5 border border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">Bet on Platform A (Polymarket)</p>
                    <p className="text-3xl font-bold text-white">${result.betA}</p>
                    <p className="text-xs text-zinc-500 mt-2">at {priceA}% price</p>
                  </div>
                  <div className="bg-black/50 rounded-xl p-5 border border-zinc-800">
                    <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">Bet on Platform B (Kalshi)</p>
                    <p className="text-3xl font-bold text-white">${result.betB}</p>
                    <p className="text-xs text-zinc-500 mt-2">at {priceB}% price</p>
                  </div>
                </div>

                <div className="bg-black/30 rounded-xl p-5 mb-4 border border-zinc-800">
                  <h4 className="font-semibold mb-4 flex items-center gap-2 text-white">
                    <Info className="w-4 h-4 text-brand" />
                    Fee Breakdown
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Polymarket Gas Fee:</span>
                      <span className="font-medium text-white">${result.fees.polymarketGas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Kalshi Platform Fee (1%):</span>
                      <span className="font-medium text-white">${result.fees.kalshiFee}</span>
                    </div>
                    <div className="border-t border-zinc-800 pt-3 flex justify-between font-semibold">
                      <span className="text-white">Total Fees:</span>
                      <span className="text-white">${result.fees.total}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-brand/10 rounded-xl p-6 border border-green-500/20">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">Guaranteed Return</p>
                      <p className="text-2xl font-bold text-white">${result.guaranteed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">Gross Profit</p>
                      <p className="text-2xl font-bold text-green-500">${result.grossProfit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">Net Profit (After Fees)</p>
                      <p className="text-3xl font-bold text-green-500">${result.netProfit}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400 mb-2 uppercase tracking-wider">ROI</p>
                      <p className="text-3xl font-bold text-brand">{result.profitMargin}%</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                <p className="text-lg font-semibold text-red-400">{result.message}</p>
                <p className="text-sm text-gray-400 mt-2">
                  Combined prices must be less than 100% for arbitrage to exist
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-yellow-400">
            <AlertTriangle className="w-5 h-5" />
            Risk Warnings
          </h4>
          <div className="space-y-3">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Oracle Risk</p>
                <p className="text-sm text-gray-400">
                  Different platforms may resolve markets differently. Ensure both markets have identical resolution criteria.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Execution Risk</p>
                <p className="text-sm text-gray-400">
                  Prices may change between calculation and execution. Always verify current prices before placing bets.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Droplets className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm mb-1">Liquidity Risk</p>
                <p className="text-sm text-gray-400">
                  Large orders may not fill at displayed prices. Check available liquidity before executing trades.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
