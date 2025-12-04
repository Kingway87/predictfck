import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, LayoutDashboard, Calculator, RefreshCw } from 'lucide-react';

export default function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-8 h-[65px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <TrendingUp className="w-7 h-7 text-brand group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold text-white">ArbitrageHub</span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-pill transition-all duration-300 ${isActive('/dashboard')
              ? 'bg-brand text-white'
              : 'text-white hover:text-brand'
              }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/comparison"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-pill transition-all duration-300 ${isActive('/comparison')
              ? 'bg-brand text-white'
              : 'text-white hover:text-brand'
              }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="font-medium">Comparison</span>
          </Link>

          <a
            href="/dashboard#calculator"
            className="flex items-center gap-2 px-6 py-2.5 rounded-pill border border-zinc-700 text-white hover:border-brand transition-all duration-300"
          >
            <Calculator className="w-4 h-4" />
            <span className="font-medium">Calculator</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
