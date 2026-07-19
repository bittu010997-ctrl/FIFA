"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { StadiumState, Gate } from '@/lib/data/stadium';
import { useTheme } from '@/components/ThemeProvider';

// SVG Icons
const RefreshIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export default function StaffDashboard() {
  const [stadiumState, setStadiumState] = useState<StadiumState | null>(null);
  const [insight, setInsight] = useState<string>("Loading AI insight...");
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchStadiumData = async () => {
    try {
      const res = await fetch('/api/stadium');
      if (res.ok) {
        const data = await res.json();
        setStadiumState(data);
      }
    } catch (err) {
      console.error("Failed to fetch stadium data", err);
    }
  };

  const fetchAiInsight = async (currentState: StadiumState) => {
    setIsInsightLoading(true);
    try {
      const message = `Generate a short one-paragraph operational recommendation for stadium staff based on this live stadium snapshot: ${JSON.stringify(currentState)}. Be authoritative and direct. Keep it concise.`;
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, language: 'English' })
      });
      const data = await res.json();
      if (res.ok && data.reply) {
        setInsight(data.reply);
      } else {
        setInsight("Error generating insight.");
      }
    } catch {
      setInsight("Network error while fetching insight.");
    } finally {
      setIsInsightLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStadiumData();

    // Auto-refresh every 5 seconds to simulate live telemetry
    const intervalId = setInterval(fetchStadiumData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Fetch AI insight once on mount after we have initial data
  useEffect(() => {
    if (stadiumState && insight === "Loading AI insight..." && !isInsightLoading) {
      fetchAiInsight(stadiumState);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stadiumState]);

  if (!stadiumState) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
        <p className="animate-pulse text-lg tracking-wide text-slate-500 dark:text-slate-400 font-mono">Initializing Command Center...</p>
      </div>
    );
  }

  // Compute summary stats
  const totalFans = stadiumState.gates.reduce((acc, gate) => acc + (gate.crowdLevel * 150), 0); // Rough estimation formula
  const congestedGates = stadiumState.gates.filter(g => g.status === 'congested').length;
  const activeAlerts = congestedGates; // Mapped for demo purposes

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-slate-300 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 -ml-2 rounded-full text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-4 focus:ring-emerald-500" aria-label="Return to Home">
            <HomeIcon />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3 font-mono">
              Operations Dashboard
            </h1>
            <p className="text-slate-500 text-sm font-mono mt-0.5">Live Telemetry & AI Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors outline-none focus:ring-4 focus:ring-emerald-500"
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div className="flex items-center gap-3 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900/50 px-4 py-2 rounded-full uppercase tracking-wider shadow-sm font-mono">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Live Sync (5s)
          </div>
        </div>
      </header>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-mono">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <h2 className="text-slate-500 dark:text-slate-400 font-bold text-xs mb-3 uppercase tracking-widest">Estimated Fans</h2>
          <div className="text-4xl font-bold text-slate-800 dark:text-white">{totalFans.toLocaleString()}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <h2 className="text-slate-500 dark:text-slate-400 font-bold text-xs mb-3 uppercase tracking-widest">Gates Over Capacity</h2>
          <div className="text-4xl font-bold text-amber-600 dark:text-amber-400">{congestedGates}</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm flex flex-col justify-between transition-colors">
          <h2 className="text-slate-500 dark:text-slate-400 font-bold text-xs mb-3 uppercase tracking-widest">Active Alerts</h2>
          <div className={`text-4xl font-bold ${activeAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {activeAlerts}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Column: Gates Table */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-colors">
              <h2 className="text-sm font-bold text-slate-800 dark:text-white font-mono uppercase tracking-widest">Live Gate Status</h2>
            </div>
            <div className="overflow-x-auto p-0">
              <table className="w-full text-left border-collapse font-mono text-sm" role="grid" aria-label="Gate Status Grid">
                <thead>
                  <tr className="text-slate-500 dark:text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/20">
                    <th className="py-3 px-5 font-bold">Gate ID</th>
                    <th className="py-3 px-5 font-bold">Crowd Level</th>
                    <th className="py-3 px-5 font-bold">Status</th>
                    <th className="py-3 px-5 font-bold">Accessibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {stadiumState.gates.map((gate: Gate) => {
                    let statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/10 dark:border-emerald-500/20";
                    let barColor = "bg-emerald-500";
                    let statusLabel = "Low";
                    
                    if (gate.status === "moderate") {
                      statusColor = "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-400/10 dark:border-amber-500/20";
                      barColor = "bg-amber-500";
                      statusLabel = "Moderate";
                    }
                    if (gate.status === "congested") {
                      statusColor = "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-400/10 dark:border-rose-500/20";
                      barColor = "bg-rose-500";
                      statusLabel = "Congested";
                    }

                    return (
                      <tr key={gate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-4 px-5 font-bold text-slate-800 dark:text-slate-200">{gate.name}</td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <span className="w-10 text-right font-bold text-slate-600 dark:text-slate-300">{gate.crowdLevel}%</span>
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${barColor}`}
                                style={{ width: `${gate.crowdLevel}%`, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`px-2 py-1 text-[11px] font-bold rounded border ${statusColor} uppercase tracking-wider inline-flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${barColor}`}></span>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          {gate.wheelchairAccessible ? (
                            <span className="text-slate-600 dark:text-slate-400 flex items-center gap-2 font-medium" aria-label="Wheelchair Accessible">
                              <span className="text-lg" aria-hidden="true">♿</span> Yes
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-600 pl-8 font-medium">No</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div className="xl:col-span-1">
          <div className="bg-indigo-50 dark:bg-gradient-to-b dark:from-indigo-950 dark:to-slate-900 border-l-4 border-l-indigo-500 border border-y-indigo-100 border-r-indigo-100 dark:border-y-indigo-500/20 dark:border-r-indigo-500/20 rounded-xl shadow-sm h-full flex flex-col overflow-hidden relative transition-colors">
            
            <div className="p-5 border-b border-indigo-100 dark:border-indigo-500/20 flex items-center justify-between z-10 transition-colors">
              <h2 className="text-sm font-bold text-indigo-900 dark:text-white flex items-center gap-2 font-mono uppercase tracking-widest">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-600 dark:text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09l2.846.813-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
                AI Copilot Insight
              </h2>
              <button 
                onClick={() => fetchAiInsight(stadiumState)} 
                disabled={isInsightLoading}
                aria-label="Refresh AI Insight"
                className="p-1.5 text-indigo-600 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-white hover:bg-indigo-200 dark:hover:bg-indigo-500/30 rounded-full transition-colors disabled:opacity-50 outline-none focus:ring-4 focus:ring-indigo-500"
              >
                <RefreshIcon />
              </button>
            </div>
            
            <div className="p-6 flex-1 flex flex-col justify-center relative z-10 font-mono text-sm">
              {isInsightLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-indigo-600 dark:text-indigo-300">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-xs uppercase tracking-widest font-bold">Analyzing Telemetry...</p>
                </div>
              ) : (
                <p className="text-indigo-900 dark:text-indigo-100 leading-relaxed font-medium">
                  {insight}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
