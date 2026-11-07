import { useEffect, useState } from 'react';
import api from './services/api';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/health')
      .then((response) => {
        setHealthData(response.data);
        setError(null);
      })
      .catch((err) => {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to connect to backend';
        setError(message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-8">
        <header className="mb-6 border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Glow &amp; Go
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Milestone M2 — API Integration &amp; Health Check
          </p>
        </header>

        <section aria-labelledby="status-heading">
          <h2
            id="status-heading"
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3"
          >
            Backend Connection Status
          </h2>

          {loading && (
            <div className="flex items-center space-x-2 text-amber-600 font-medium text-sm">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Checking connection via API client...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-700 text-sm">
              <p className="font-semibold">Connection failed</p>
              <p className="mt-1 text-xs">{error}</p>
            </div>
          )}

          {healthData && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 text-slate-700 space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {healthData.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">Service:</span>
                <span className="font-mono text-xs text-slate-800">
                  {healthData.service}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">Environment:</span>
                <span className="font-mono text-xs text-slate-800">
                  {healthData.environment}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">Uptime:</span>
                <span className="font-mono text-xs text-slate-800">
                  {healthData.uptime}s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-600">Timestamp:</span>
                <span className="font-mono text-xs text-slate-500">
                  {healthData.timestamp}
                </span>
              </div>
            </div>
          )}
        </section>

        <footer className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-400">
          React 19 + Tailwind CSS v4 &bull; Express API Client
        </footer>
      </div>
    </main>
  );
}
