import React from 'react';

export default function PublicHomepage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between">
      
      {/* GLOBAL NAVBAR */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-lg">
            Ω
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Point Zero</span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-emerald-400 transition-colors">Explore Artists</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Portfolios</a>
          <a href="#" className="hover:text-emerald-400 transition-colors">Features</a>
        </div>

        <div>
          <a href="/login" className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-semibold rounded-xl transition-all">
            Sign In
          </a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-5xl mx-auto px-6 pt-20 pb-16 text-center">
        <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
          Next-Gen Talent Management
        </span>
        <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mt-6 max-w-3xl mx-auto leading-tight">
          Book Premium Artists. <br />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
            Manage Media Effortlessly.
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl mt-6 max-w-2xl mx-auto leading-relaxed">
          The all-in-one portal for creative talent to host high-fidelity portfolios, upload video showreels, and securely secure client bookings.
        </p>
        
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="/artists" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-xl shadow-emerald-500/10 text-center">
            Browse Artists
          </a>
          <a href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold rounded-xl transition-all text-center">
            Login
          </a>
        </div>
      </header>

      {/* FEATURE/PERFORMANCE HIGHLIGHT CARDS */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        
        <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">📸</div>
          <h3 className="text-xl font-bold text-white">Media Portfolios</h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Artists can upload ultra-clean photo galleries and stream production-ready video showreels directly from their personalized dashboard profile.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">🗓️</div>
          <h3 className="text-xl font-bold text-white">Seamless Bookings</h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Direct client-to-artist availability calendars, automated contracting pipelines, and booking confirmation counters that track payouts.
          </p>
        </div>

        <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl">
          <div className="text-3xl mb-4">⚡</div>
          <h3 className="text-xl font-bold text-white">Real-Time Console</h3>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            A state-driven interactive operational interface built for managers and creators to oversee uploads, analytics, and active transactions live.
          </p>
        </div>

      </section>

      {/* REASSURING FOOTER */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 w-full mt-12">
        &copy; 2026 Point Zero Platform Node. Powered by Webpack Local Engine. All rights reserved.
      </footer>

    </div>
  );
}