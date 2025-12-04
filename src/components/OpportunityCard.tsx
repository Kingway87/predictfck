import { TrendingUp, Clock, DollarSign } from 'lucide-react';

interface OpportunityCardProps {
  opportunity: {
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
  };
}

export default function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const timeUntilExpiry = () => {
    const now = new Date();
    const expiry = new Date(opportunity.expires_at);
    const diff = expiry.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    return `${hours}h`;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Politics': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      'Economics': 'text-green-400 bg-green-500/10 border-green-500/20',
      'Crypto': 'text-orange-400 bg-orange-500/10 border-orange-500/20',
      'Sports': 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      'Technology': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      'Entertainment': 'text-pink-400 bg-pink-500/10 border-pink-500/20',
      'Weather': 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    };
    return colors[category] || 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  return (
    <div className="bg-surface border border-zinc-800 rounded-2xl p-6 hover:border-brand transition-all duration-300 group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className={`px-3 py-1 rounded-pill text-xs font-medium border ${getCategoryColor(opportunity.category)}`}>
              {opportunity.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-zinc-500 uppercase tracking-wider">
              <Clock className="w-3 h-3" />
              {timeUntilExpiry()}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-brand transition-colors">{opportunity.event_name}</h3>
          <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{opportunity.event_description}</p>
        </div>
        <div className="ml-6 text-right">
          <div className="text-3xl font-bold text-green-500">
            {opportunity.profit_margin.toFixed(2)}%
          </div>
          <div className="text-xs text-zinc-500 uppercase tracking-wider">ROI</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">{opportunity.platform_a}</div>
          <div className="font-semibold text-white mb-1">{opportunity.outcome_a}</div>
          <div className="text-sm text-brand font-medium">{opportunity.price_a}%</div>
        </div>
        <div className="bg-black/50 rounded-xl p-4 border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider">{opportunity.platform_b}</div>
          <div className="font-semibold text-white mb-1">{opportunity.outcome_b}</div>
          <div className="text-sm text-brand font-medium">{opportunity.price_b}%</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">Min: ${opportunity.investment_required}</span>
        </div>
        <button className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-pill text-sm font-medium transition-all duration-300 flex items-center gap-2 transform hover:scale-105">
          <TrendingUp className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );
}
