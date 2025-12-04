import { useState } from 'react';
import { Terminal, Play, CheckCircle2, XCircle, Loader2, Info } from 'lucide-react';
import { runAllTests } from '../utils/apiTest';

interface TestResultData {
  success: boolean;
  count?: number;
  matches?: number;
  error?: string;
  details?: string;
}

interface AllTestResults {
  polymarket: TestResultData;
  kalshi: TestResultData;
  matching: TestResultData;
  allPassed: boolean;
  error?: string;
}

export default function APITestPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<AllTestResults | null>(null);

  async function handleRunTests() {
    setTesting(true);
    setResults(null);

    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Test execution error:', error);
      setResults({
        allPassed: false,
        polymarket: { success: false, error: 'Test failed to execute' },
        kalshi: { success: false, error: 'Test failed to execute' },
        matching: { success: false, error: 'Test failed to execute' },
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setTesting(false);
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors flex items-center gap-2"
      >
        <Terminal className="w-5 h-5" />
        <span className="text-sm font-medium">Test APIs</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl w-[420px] max-h-[600px] overflow-hidden z-50">
      <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold">API Diagnostics</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        <p className="text-sm text-gray-400">
          Test connectivity to Polymarket and Kalshi via Supabase Edge Functions (Pro Plan).
        </p>

        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-300">
              <p className="font-medium mb-1">Supabase Pro Plan Active</p>
              <p className="text-green-400/80">
                Using Supabase Edge Functions to bypass CORS and avoid browser limitations. This approach works reliably on the Pro plan.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleRunTests}
          disabled={testing}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run All Tests
            </>
          )}
        </button>

        {results && (
          <div className="space-y-3 mt-4">
            <div className={`p-3 rounded-lg border ${
              results.allPassed
                ? 'bg-green-500/10 border-green-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {results.allPassed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-400" />
                )}
                <span className={`font-semibold ${
                  results.allPassed ? 'text-green-400' : 'text-red-400'
                }`}>
                  {results.allPassed ? 'All Tests Passed' : 'Some Tests Failed'}
                </span>
              </div>
              {results.error && (
                <p className="text-xs text-red-400 mt-1">{results.error}</p>
              )}
            </div>

            <div className="space-y-2">
              <TestResult
                name="Polymarket API"
                result={results.polymarket}
              />
              <TestResult
                name="Kalshi API"
                result={results.kalshi}
              />
              <TestResult
                name="Market Matching"
                result={results.matching}
              />
            </div>

            {!results.allPassed && (
              <div className="bg-gray-800/50 rounded-lg p-3 mt-3">
                <p className="text-xs text-gray-400 mb-2">
                  <strong>Troubleshooting:</strong>
                </p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Check browser console (F12) for detailed error logs</li>
                  <li>Verify .env file has correct Supabase credentials</li>
                  <li>Make sure you restarted the dev server after updating .env</li>
                  <li>Check Supabase dashboard for function logs</li>
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500 mt-3">
              Check browser console (F12) for detailed logs
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TestResult({ name, result }: { name: string; result: TestResultData }) {
  if (!result) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{name}</span>
        {result.success ? (
          <CheckCircle2 className="w-4 h-4 text-green-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        )}
      </div>
      {result.success ? (
        <p className="text-xs text-gray-400">
          {result.count !== undefined && `Found ${result.count} items`}
          {result.matches !== undefined && `Found ${result.matches} matches`}
        </p>
      ) : (
        <div>
          <p className="text-xs text-red-400">{result.error}</p>
          {result.details && (
            <p className="text-xs text-gray-500 mt-1">{result.details}</p>
          )}
        </div>
      )}
    </div>
  );
}
