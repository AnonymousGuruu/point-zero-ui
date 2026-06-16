'use client';

import React, { useState, useEffect } from 'react';

interface ClientBooking {
  id: string;
  artist: string;
  date: string;
  budget: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  preview: string;
  unread: boolean;
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'notifications' | 'messages'>('bookings');
  const [clientName, setClientName] = useState('Client Node');
  const [globalQueue, setGlobalQueue] = useState<ClientBooking[]>([]);
  const [chats] = useState<ChatMessage[]>([
    { id: 1, sender: 'Point Zero Agency', preview: 'Your contract parameters for Kendi Nicole have cleared.', unread: true },
    { id: 2, sender: 'Jotham Sparks', preview: "Sounds great. Let's lock down the call sheet for the video shoot.", unread: false }
  ]);

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem('pz_active_session') || '{}');
    if (session.name) setClientName(session.name);
    setGlobalQueue(JSON.parse(localStorage.getItem('pz_global_booking_queue') || '[]'));
  }, [activeTab]);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* SIDEBAR NAVIGATION CONTROL */}
      <aside className="w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg">Ω</div>
            <div>
              <span className="text-lg font-black tracking-wider text-white uppercase block leading-none">Client Hub</span>
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-bold font-mono">Control Panel</span>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { id: 'bookings', label: 'My Pipeline', icon: '🤝' },
              { id: 'notifications', label: 'Alert Network', icon: '🔔' },
              { id: 'messages', label: 'Studio Logs', icon: '💬' }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-xs font-bold tracking-wide uppercase rounded-xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border-l-2 border-emerald-500 pl-5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 pl-4'
                }`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800/80 pt-5 flex items-center gap-4 px-2">
          <div className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-800/60 flex items-center justify-center text-xs font-black text-emerald-400 tracking-wider shadow-inner uppercase">
            {clientName.substring(0, 2)}
          </div>
          <div className="truncate max-w-[140px]">
            <p className="text-xs font-black text-slate-200 uppercase tracking-wide truncate">{clientName}</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">Hiring Entity</p>
          </div>
        </div>
      </aside>

      {/* MAIN DATA INTERFACE VIEWPORT */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-b from-slate-900/20 via-slate-950 to-slate-950">
        <header className="mb-12 pb-6 border-b border-slate-900 flex flex-col sm:flex-row justify-between sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Client Control Panel</h1>
            <p className="text-slate-400 text-xs font-mono mt-1.5 uppercase tracking-wider">Secure Monitor // Node: {clientName}</p>
          </div>
          <a href="/artists" className="self-start sm:self-center px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md active:scale-95">
            + Hire More Artists
          </a>
        </header>

        {/* TAB 1: OUTBOUND PIPELINES AS PROGRESSIVE GRID */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-2">Outbound Engagement Pipelines</h3>
            {globalQueue.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-900 rounded-3xl p-6">
                <span className="text-3xl block mb-3 opacity-40">🕳️</span>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                  No active engagement matrices detected. Head to the directory node to initialize a deal deployment sequence.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalQueue.map((deal) => (
                  <div key={deal.id} className="p-6 bg-slate-900/40 border border-slate-900 rounded-2xl flex flex-col justify-between gap-6 group hover:border-slate-800 transition-all duration-300">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] font-mono font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/10 rounded">
                          Sync_Active
                        </span>
                        <h4 className="text-base font-bold text-white tracking-tight mt-3">Requested Pro: {deal.artist}</h4>
                        <p className="text-xs text-slate-400 font-medium font-sans mt-1">📅 Booking Term: {deal.date}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-900/60 pt-4 flex items-center justify-between font-mono">
                      <span className="px-2 py-1 bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded text-[9px] font-black uppercase tracking-wider">
                        Awaiting Agent Approval
                      </span>
                      <p className="text-base font-black text-white">{deal.budget}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SYSTEM ALERT STREAM */}
        {activeTab === 'notifications' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm max-w-3xl">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-4">Live Alert Network Stream</h3>
            <div className="p-5 bg-slate-950/60 border border-slate-900 rounded-xl flex gap-4 items-start">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm border border-emerald-500/10">⚡</div>
              <div>
                <p className="font-bold text-sm text-white">System Node Synchronized</p>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed font-medium">Your profile registration signed key credentials passed dynamic loop matrix validations flawlessly.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CHAT LOGS */}
        {activeTab === 'messages' && (
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl overflow-hidden backdrop-blur-sm max-w-3xl">
            <div className="p-5 border-b border-slate-900 bg-slate-950/40">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Direct Studio Communication Logs</h3>
            </div>
            <div className="divide-y divide-slate-900 text-xs">
              {chats.map(chat => (
                <div key={chat.id} className="p-5 flex justify-between items-center hover:bg-slate-900/40 cursor-pointer transition-all duration-300 group">
                  <div className="space-y-1 pr-6">
                    <p className="font-bold text-sm text-slate-200 group-hover:text-emerald-400 transition-colors">{chat.sender}</p>
                    <p className="text-xs text-slate-400 font-medium line-clamp-1">{chat.preview}</p>
                  </div>
                  {chat.unread ? (
                    <div className="flex-shrink-0 h-2.5 w-2.5 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-400 shadow-lg shadow-emerald-400/50"></div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}