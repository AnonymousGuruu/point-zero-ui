'use client';

import React, { useState } from 'react';

export default function ArtistProfilePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [notes, setNotes] = useState('');

  const handleBookingTrigger = () => {
    const activeSession = sessionStorage.getItem('pz_active_session');
    
    // REDIRECT INTRUDER BACK TO PORTAL CONTAINER IF SECURE COOKIE TICKET KEY IS EMPTY
    if (!activeSession) {
      sessionStorage.setItem('pz_redirect_back_target', window.location.pathname);
      window.location.href = '/login?alert=auth_required';
      return;
    }

    setIsBookingOpen(true);
    setBookingConfirmed(false);
  };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    
    // Dispatch a virtual pipeline notice to populate the global account state databases
    const activeSession = JSON.parse(sessionStorage.getItem('pz_active_session') || '{}');
    const targetDeal = {
      id: `DEAL-${Math.floor(100 + Math.random() * 900)}`,
      artist: 'Kendi Nicole',
      client: activeSession.name || 'External Client Node',
      date: bookingDate,
      notes: notes,
      status: 'Pending Review',
      budget: 'Ksh 85,000'
    };

    // Push into a global shared state channel queue
    const currentQueue = JSON.parse(localStorage.getItem('pz_global_booking_queue') || '[]');
    localStorage.setItem('pz_global_booking_queue', JSON.stringify([targetDeal, ...currentQueue]));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* SUB-NAV COMPONENT */}
      <nav className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-40 px-6 lg:px-12 py-4 flex items-center justify-between">
        <a href="/artists" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-emerald-400 flex items-center gap-2 transition-colors group">
          <span className="group-hover:-translate-x-1 transition-transform">⬅</span> Back to Discovery Grid
        </a>
        <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/10 px-3 py-1 rounded-lg">
          Secure Node Active
        </span>
      </nav>

      {/* RICH PROFILE BANNER HEADER */}
      <header className="border-b border-slate-900 bg-gradient-to-b from-slate-900/30 to-transparent py-16 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-24 w-24 bg-slate-900 rounded-3xl flex items-center justify-center text-5xl border border-slate-800/80 shadow-2xl relative shadow-emerald-500/[0.02]">
              🎤
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">Kendi Nicole</h1>
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10 font-mono text-[9px] font-black tracking-widest text-emerald-400 uppercase">Verified Pro</span>
              </div>
              <p className="text-emerald-400 text-xs md:text-sm font-bold tracking-wide mt-1">Vocalist & Performer ➔ Nairobi, Kenya</p>
              <p className="text-slate-400 text-xs md:text-sm mt-3 max-w-2xl font-medium leading-relaxed">
                Specializing in live jazz infusions, neo-soul sets, and high-fidelity multi-track studio collaborations across digital networks.
              </p>
            </div>
          </div>
          
          <button
            onClick={handleBookingTrigger}
            className="w-full lg:w-auto px-7 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-emerald-500/10 active:scale-95 text-center"
          >
            ⚡ Request Secure Booking
          </button>
        </div>
      </header>

      {/* DETAILED CONTENT AREA GRID */}
      <main className="max-w-6xl mx-auto px-6 lg:px-12 py-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* MEDIA REEL AND VISUAL METRICS */}
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 backdrop-blur-sm">
            <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono mb-4">🎥 Featured Studio Showreel</h3>
            
            <div className="aspect-video bg-slate-950 border border-slate-900/60 rounded-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-slate-800 transition-colors relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/[0.01] to-transparent pointer-events-none"></div>
              <button className="h-16 w-16 rounded-full bg-slate-900 hover:bg-emerald-500 border border-slate-800 hover:border-transparent text-emerald-400 hover:text-slate-950 flex items-center justify-center text-xl font-bold mb-3 shadow-xl transition-all duration-300 group-hover:scale-105 active:scale-95 pl-1">
                ▶
              </button>
              <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">Live Session Track // Point Zero Studios</p>
              <p className="text-[10px] text-slate-500 mt-1 font-medium font-sans">Audio payload matrix sync cleared.</p>
            </div>
          </div>
        </section>

        {/* SIDE TERMS PANEL PANEL */}
        <section className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-900 p-6 rounded-3xl backdrop-blur-sm">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono mb-5 pb-3 border-b border-slate-900">Engagement Parameters</h4>
            
            <div className="space-y-4 text-xs font-medium">
              <div className="flex justify-between items-center py-2 border-b border-slate-900/40">
                <span className="text-slate-400">Baseline Fee</span>
                <span className="font-mono text-emerald-400 font-black uppercase tracking-wider bg-emerald-500/5 px-2 py-0.5 border border-emerald-500/10 rounded">Negotiable</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-900/40">
                <span className="text-slate-400">Location Base</span>
                <span className="font-sans text-slate-200 font-bold">Nairobi, KE</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-400">Escrow Routing</span>
                <span className="font-mono text-amber-400 font-bold">Required // Node P2</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* DYNAMIC FORM INGESTION MODAL OVERLAY */}
      {isBookingOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-900/80 w-full max-w-md p-6 md:p-8 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-to-bl from-emerald-500/[0.02] to-transparent pointer-events-none"></div>
            
            <button 
              onClick={() => setIsBookingOpen(false)} 
              className="absolute top-5 right-5 h-8 w-8 bg-slate-950 border border-slate-900 hover:border-slate-800 rounded-xl text-slate-400 hover:text-white flex items-center justify-center text-xs transition-colors"
            >
              ✕
            </button>

            {!bookingConfirmed ? (
              <form onSubmit={submitBooking} className="space-y-6 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Initialize Deal Allocation</h3>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">Submit target operational metrics to establish automated transaction routing.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Target Event Term Date</label>
                  <input 
                    type="date" 
                    required 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-900/80 focus:border-emerald-500/80 rounded-xl text-xs text-slate-100 font-mono tracking-wide focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">Operational Guidelines</label>
                  <textarea 
                    rows={4} 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    placeholder="Specify project parameters, structural needs, or specific execution guidelines..." 
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-900/80 focus:border-emerald-500/80 rounded-xl text-xs text-slate-100 placeholder-slate-600 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500/20 transition-all resize-none leading-relaxed" 
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-emerald-500/5 active:scale-95"
                >
                  Submit Ingestion Pipeline
                </button>
              </form>
            ) : (
              <div className="text-center py-6 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 flex items-center justify-center text-2xl font-bold mx-auto mb-5 shadow-inner">
                  ✓
                </div>
                <h3 className="text-lg font-black text-white uppercase tracking-tight">Pipeline Stream Dispatched</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto font-medium leading-relaxed">
                  Your engagement request parameters successfully triggered automated routing into administrative review queues.
                </p>
                <button 
                  onClick={() => setIsBookingOpen(false)} 
                  className="mt-8 px-6 py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[10px] font-black uppercase tracking-wider rounded-xl text-slate-400 hover:text-slate-200 transition-all"
                >
                  Close Operational Window
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}