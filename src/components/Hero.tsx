import { TrendingUp, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-8 py-32 bg-black">
      <div className="max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-pill px-6 py-2 mb-12 animate-fade-in">
          <TrendingUp className="w-4 h-4 text-brand" />
          <span className="text-sm text-brand font-medium">Algorithmic Arbitrage Detection</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-semibold mb-8 text-white leading-[1.1] tracking-tight">
          Unlock Arbitrage
          <br />
          Opportunities Across
          <br />
          <span className="text-brand">Prediction Markets</span>
        </h1>

        <p className="text-xl md:text-2xl text-zinc-400 mb-16 max-w-3xl mx-auto leading-relaxed">
          Discover low-risk arbitrage bets that profit no matter who wins.
          Automated detection across major prediction markets.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            to="/dashboard"
            className="group bg-brand hover:bg-brand-hover text-white px-10 py-4 rounded-pill font-semibold flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
            Launch App
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="bg-transparent hover:bg-zinc-900 text-white px-10 py-4 rounded-pill font-semibold border border-zinc-700 hover:border-brand transition-all duration-300"
          >
            View Live Markets
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-3 gap-12 max-w-3xl mx-auto">
          <div className="group cursor-default">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-brand transition-colors">500+</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">Markets Scanned</div>
          </div>
          <div className="group cursor-default">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-brand transition-colors">2</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">Platforms</div>
          </div>
          <div className="group cursor-default">
            <div className="text-4xl font-bold text-white mb-2 group-hover:text-brand transition-colors">24/7</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider">Live Monitoring</div>
          </div>
        </div>
      </div>
    </section>
  );
}
