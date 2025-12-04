import { Shield, Zap, Network, Calculator } from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Low-Risk Betting',
    description: 'Place hedged bets across multiple platforms that guarantee profit regardless of the outcome. Minimize your risk while maximizing returns.'
  },
  {
    icon: Zap,
    title: 'Automated Detection',
    description: 'Our algorithms continuously scan prediction markets to identify profitable arbitrage opportunities in real-time, saving you countless hours.'
  },
  {
    icon: Network,
    title: 'Multi-Platform Support',
    description: 'Connect with leading prediction markets including Kalshi, Polymarket, PredictIt, and more. Access opportunities across the entire ecosystem.'
  },
  {
    icon: Calculator,
    title: 'Smart Position Sizing',
    description: 'Built-in calculators automatically determine optimal bet sizes and projected profits, accounting for platform fees and market conditions.'
  }
];

export default function Features() {
  return (
    <section className="py-32 px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-semibold mb-6 text-white">
            Everything You Need to Profit
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Professional tools for serious arbitrage traders
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-surface border border-black rounded-2xl p-10 hover:border-brand transition-all duration-300"
            >
              <div className="bg-brand/10 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand/20 transition-colors">
                <feature.icon className="w-8 h-8 text-brand" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{feature.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-lg">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
