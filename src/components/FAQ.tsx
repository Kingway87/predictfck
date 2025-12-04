import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How does arbitrage betting work?',
    answer: 'Arbitrage betting involves placing bets on all possible outcomes of an event across different platforms where the combined odds guarantee a profit. Our platform automatically identifies these opportunities by comparing prices across multiple prediction markets.'
  },
  {
    question: 'What prediction markets do you support?',
    answer: 'We currently support major platforms including Kalshi, Polymarket, PredictIt, Manifold Markets, and others. We continuously add new platforms as they emerge in the prediction market space.'
  },
  {
    question: 'Is this really risk-free?',
    answer: 'While we identify low-risk opportunities, all trading carries some level of risk. Factors like market volatility, platform limits, execution timing, and fees can affect outcomes. Our tools help minimize these risks through careful calculation and analysis.'
  },
  {
    question: 'How much can I expect to profit?',
    answer: 'Profit margins typically range from 1-10% per opportunity, depending on market conditions. Your actual returns depend on your capital allocation, execution speed, and the opportunities you choose to pursue.'
  },
  {
    question: 'Do I need accounts on all platforms?',
    answer: 'Yes, you will need verified accounts on the prediction market platforms where you want to place bets. Our platform helps identify opportunities, but execution happens on the individual market platforms.'
  },
  {
    question: 'How do I get support?',
    answer: 'Free tier users have access to community support through our Discord server. Pro users receive priority email support with typical response times under 4 hours during business days.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-400">
            Everything you need to know about arbitrage betting
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-800/50 transition-colors"
              >
                <span className="text-lg font-semibold pr-8">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
