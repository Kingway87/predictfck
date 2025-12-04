import { TrendingUp, Twitter, Github, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 py-16 px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-7 h-7 text-brand" />
              <span className="text-xl font-bold text-white">ArbitrageHub</span>
            </div>
            <p className="text-zinc-500 mb-6 max-w-sm leading-relaxed">
              The leading platform for identifying and executing arbitrage opportunities across prediction markets.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-zinc-500 hover:text-brand transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-brand transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-zinc-500 hover:text-brand transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Features</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Dashboard</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Calculator</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">API Docs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-white text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">About</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Blog</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Support</a></li>
              <li><a href="#" className="text-zinc-500 hover:text-white transition-colors text-sm">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-xs uppercase tracking-wider">
            © 2025 ArbitrageHub. All rights reserved.
          </p>
          <div className="flex gap-8 text-xs uppercase tracking-wider">
            <a href="#" className="text-zinc-600 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-zinc-600 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-zinc-600 hover:text-white transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
