'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3D Canvas component to bypass server-side rendering errors safely
const ModelViewer = dynamic(() => import('@/components/ModelViewer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] md:h-[450px] bg-slate-900/10 border border-slate-900 rounded-2xl flex items-center justify-center text-xs font-mono text-slate-500 animate-pulse">
      Initializing 3D Pipeline Matrix...
    </div>
  )
});

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

      {/* HERO & 3D INTERACTIVE HEADER BLOCK */}
      <header className="max-w-6xl mx-auto px-6 pt-16 pb-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        
        {/* TEXT CALLOUTS */}
        <div className="text-left">
          <span className="px-3 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full uppercase tracking-wider">
            Next-Gen Talent Management
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mt-6 leading-tight">
            Book Premium Artists. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 text-transparent bg-clip-text">
              Manage Media Effortlessly.
            </span>
          </h1>
          <p className="text-slate-400 text-base md:text-lg mt-6 leading-relaxed max-w-xl">
            The all-in-one portal for creative talent to host high-fidelity portfolios, upload video showreels, and securely lock down client bookings.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <a href="/artists" className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl transition-all shadow-xl shadow-emerald-500/10 text-center text-sm uppercase tracking-wider">
              Browse Artists
            </a>
            <a href="/login" className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white font-semibold rounded-xl transition-all text-center text-sm uppercase tracking-wider">
              Login
            </a>
          </div>
        </div>

        {/* 3D ANIMATION VIEWPORT WINDOW CONTAINER */}
        <div className="w-full relative h-[350px] md:h-[450px] rounded-3xl bg-slate-900/30 border border-slate-900 overflow-hidden shadow-2xl shadow-emerald-500/5">
          <div className="absolute top-4 left-4 z-10 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-md text-[10px] font-mono text-emerald-400 tracking-wider uppercase">
            Interactive Canvas Node
          </div>
          <ModelViewer />
        </div>

      </header>

      {/* FEATURE HIGHLIGHT CARDS */}
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

      {/* FOOTER */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 w-full mt-12">
        &copy; 2026 Point Zero Platform Node. Powered by Webpack Local Engine. All rights reserved.
      </footer>

    </div>
  );
}