'use client';

import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  time: string;
  type: 'info' | 'success' | 'warn' | 'error';
  message: string;
}

export default function DashboardPage() {
  // Component State Tracking
  const [isEngineActive, setIsEngineActive] = useState(true);
  const [threadCount, setThreadCount] = useState(3);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, time: '11:32:04', type: 'info', message: 'System Console initialized on local node.' },
    { id: 2, time: '11:32:05', type: 'success', message: 'Webpack compilation successful (Bypassed LightningCSS dependency).' },
    { id: 3, time: '11:35:12', type: 'info', message: 'Active operational pipelines synched cleanly.' },
  ]);

  // Simulate a live telemetry background stream
  useEffect(() => {
    if (!isEngineActive) return;

    const phrases = [
      { type: 'info' as const, msg: 'Polling active service configurations...' },
      { type: 'success' as const, msg: 'Data stream packet transaction verified successfully.' },
      { type: 'info' as const, msg: 'Memory buffers flushed cleanly.' },
      { type: 'warn' as const, msg: 'High request frequency detected on API local boundary.' },
    ];

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const selected = phrases[Math.floor(Math.random() * phrases.length)];
      
      setLogs(prev => [
        { id: Date.now(), time: timeStr, type: selected.type, message: selected.msg },
        ...prev.slice(0, 14) // Maintain latest 15 operations
      ]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isEngineActive]);

  // Control Actions
  const toggleEngine = () => {
    const now = new Date().toTimeString().split(' ')[0];
    if (isEngineActive) {
      setIsEngineActive(false);
      setLogs(prev => [{ id: Date.now(), time: now, type: 'warn', message: 'Automation pipelines paused by Developer Node.' }, ...prev]);
    } else {
      setIsEngineActive(true);
      setLogs(prev => [{ id: Date.now(), time: now, type: 'success', message: 'Automation engine monitoring resumed.' }, ...prev]);
    }
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 font-sans">
      
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-lg">
              Ω
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Point Zero</span>
          </div>
          
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-3 bg-slate-900 text-emerald-400 font-medium rounded-xl transition-all">
              <span className="text-lg">📊</span> Console Home
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 font-medium rounded-xl transition-all">
              <span className="text-lg">⚙️</span> Core Services
            </a>
            <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-900/50 hover:text-slate-200 font-medium rounded-xl transition-all">
              <span className="text-lg">🎛️</span> Controls
            </a>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-semibold text-white">
            PR
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">Developer Node</p>
            <p className="text-xs text-emerald-500 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span> Local Node
            </p>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* 2. TOP DASHBOARD HEADER */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">System Console</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time terminal node automation monitor.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={clearLogs}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-semibold rounded-xl transition-all">
              Clear Console Logs
            </button>
            <button 
              onClick={toggleEngine}
              className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all shadow-lg ${
                isEngineActive 
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/5' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/5'
              }`}>
              {isEngineActive ? 'Pause Processing Engine' : 'Resume Processing Engine'}
            </button>
          </div>
        </header>

        {/* 3. PERFORMANCE STAT GRID */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Engine Status</p>
            <p className={`text-2xl font-bold mt-2 ${isEngineActive ? 'text-emerald-400' : 'text-amber-500'}`}>
              {isEngineActive ? 'Active Running' : 'Paused'}
            </p>
            <div className="mt-2 text-xs text-slate-400 font-mono">
              Live automated loop state
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Threads</p>
            <div className="flex items-center justify-between mt-2">
              <p className="text-2xl font-bold text-white">{isEngineActive ? threadCount : 0}</p>
              <div className="flex gap-1">
                <button 
                  disabled={!isEngineActive || threadCount <= 1}
                  onClick={() => setThreadCount(c => c - 1)}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 text-xs disabled:opacity-30">
                  -
                </button>
                <button 
                  disabled={!isEngineActive || threadCount >= 8}
                  onClick={() => setThreadCount(c => c + 1)}
                  className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded hover:bg-slate-800 text-xs disabled:opacity-30">
                  +
                </button>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400 font-mono">Parallel processing rows</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Network Target</p>
            <p className="text-2xl font-bold text-white mt-2">Local Host</p>
            <div className="mt-2 text-xs text-blue-400 font-mono">localhost:3000</div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Server Environment</p>
            <p className="text-2xl font-bold text-white mt-2">Webpack</p>
            <div className="mt-2 text-xs text-purple-400 font-mono">Offline Module Mode</div>
          </div>
        </section>

        {/* 4. ACTIVE LIVE TELEMETRY LOGS */}
        <section className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">Console Live Telemetry</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time status updates from active processing tasks.</p>
            </div>
            <span className={`px-2.5 py-1 text-xs font-semibold border rounded-full transition-all ${
              isEngineActive 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            }`}>
              {isEngineActive ? 'Streaming' : 'Idle'}
            </span>
          </div>

          {/* Terminal Box */}
          <div className="p-6 bg-slate-950 font-mono text-sm max-h-96 overflow-y-auto space-y-2.5">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic text-center py-6">Console buffer cleared. Awaiting logs...</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 hover:bg-slate-900/40 py-1 px-2 rounded-lg transition-all">
                  <span className="text-slate-500 select-none">[{log.time}]</span>
                  <span className={`font-bold uppercase tracking-wide text-xs select-none px-1.5 py-0.5 rounded ${
                    log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.type === 'warn' ? 'bg-amber-500/10 text-amber-400' :
                    log.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-sky-500/10 text-sky-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </section>

      </main>
    </div>
  );
}