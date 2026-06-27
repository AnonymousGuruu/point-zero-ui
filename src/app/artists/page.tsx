'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Ensure this points to your firebase config
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Artist {
  id: string;
  name: string;
  role: string;
  tags: string[];
  image: string;
  location: string;
}

const ARTISTS_DATA: Artist[] = [
  { id: '1', name: 'Kendi Nicole', role: 'Vocalist & Performer', tags: ['Live Music', 'Afro-Jazz'], image: '🎤', location: 'Nairobi' },
  { id: '2', name: 'Jotham Sparks', role: 'Cinematographer', tags: ['Music Videos', 'Commercial'], image: '🎥', location: 'Mombasa' },
  { id: '3', name: 'Sauti Vision', role: 'Music Producer', tags: ['Afrobeats', 'Amapiano'], image: '🎹', location: 'Nairobi' },
  { id: '4', name: 'Malaika Ray', role: 'Fashion Photographer', tags: ['Editorial', 'Portraits'], image: '📸', location: 'Nairobi' },
];

export default function ArtistsDirectory() {
  const [filter, setFilter] = useState<string>('All');
  const [allArtists, setAllArtists] = useState<Artist[]>([]);
  
  // New state to hold the live media files
  const [mediaVault, setMediaVault] = useState<any[]>([]);

  useEffect(() => {
    const storedStr = localStorage.getItem('pz_registered_artists');
    if (storedStr) {
      const customArtists = JSON.parse(storedStr);
      setAllArtists([...customArtists, ...ARTISTS_DATA]);
    } else {
      setAllArtists(ARTISTS_DATA);
    }
  }, []);

  // Firebase Media Sync Listener
  useEffect(() => {
    // Order by timestamp descending so the newest uploads show first
    const q = query(collection(db, "artistMedia"), orderBy("timestamp", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMedia = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMediaVault(fetchedMedia);
    });

    return () => unsubscribe();
  }, []);

  const filteredArtists = filter === 'All' 
    ? allArtists 
    : allArtists.filter(a => 
        a.role.toLowerCase().includes(filter.toLowerCase()) || 
        a.tags.some((t: string) => t.toLowerCase().includes(filter.toLowerCase()))
      );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* DIRECTORY NAVBAR */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50 px-6 lg:px-12 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center font-black text-slate-950 text-lg shadow-md shadow-emerald-500/10">Ω</div>
          <span className="text-base font-black uppercase tracking-wider text-white group-hover:text-emerald-400 transition-colors">Point Zero Talent</span>
        </a>
        <div className="flex items-center gap-3">
          <a href="/signup" className="text-[11px] uppercase tracking-wider text-slate-950 font-black bg-emerald-500 hover:bg-emerald-400 px-4 py-2 rounded-xl transition-all duration-300">
            + Join Directory
          </a>
          <a href="/login" className="text-[11px] uppercase tracking-wider text-slate-400 hover:text-emerald-400 font-bold bg-slate-900 px-4 py-2 border border-slate-800/80 rounded-xl transition-all duration-300">
            Console
          </a>
        </div>
      </header>

      {/* CORE WORKSPACE SPLIT LAYOUT */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white tracking-tight uppercase">Discover Creative Talent</h1>
          <p className="text-slate-400 text-xs md:text-sm mt-2 font-medium max-w-xl">Curated global showcase node. Source premium professionals, check live aesthetic footprints, and secure execution slots.</p>
        </div>

        {/* VISUAL CONTROLS / FILTER PILLS */}
        <div className="flex flex-wrap gap-2 mb-12 pb-6 border-b border-slate-900">
          {['All', 'Vocalist', 'Dancer', 'Model', 'Cinematographer', 'Producer', 'Photographer'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl border transition-all duration-300 ${
                (filter === cat || (cat !== 'All' && filter.includes(cat)))
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-slate-950 border-transparent shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-900/40 text-slate-400 border-slate-800/80 hover:text-slate-200 hover:bg-slate-900/80'
              }`}
            >
              {cat === 'All' ? 'All Talents' : `${cat}s`}
            </button>
          ))}
        </div>

        {/* MAIN STRUCTURAL SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* PROFILE CARDS PORTAL */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredArtists.length === 0 ? (
              <div className="sm:col-span-2 p-16 bg-slate-900/20 border-2 border-dashed border-slate-900 rounded-3xl text-center font-mono text-xs text-slate-600 uppercase tracking-widest">
                No active creative nodes matched structural criteria.
              </div>
            ) : (
              filteredArtists.map((artist) => (
                <div key={artist.id} className="bg-slate-900/30 border border-slate-900 rounded-3xl overflow-hidden hover:border-slate-800/80 hover:bg-slate-900/50 transition-all duration-300 flex flex-col justify-between shadow-xl backdrop-blur-sm group">
                  <div className="p-6">
                    <div className="h-40 bg-slate-950 rounded-2xl flex items-center justify-center text-5xl mb-5 border border-slate-900 overflow-hidden relative shadow-inner">
                      {artist.image && artist.image.startsWith('data:image') ? (
                        <img src={artist.image} alt={artist.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <span className="group-hover:scale-110 transition-transform duration-300">{artist.image || '👤'}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-emerald-400 transition-colors">{artist.name}</h3>
                        <p className="text-xs font-bold text-emerald-400/90 tracking-wide mt-0.5">{artist.role}</p>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-slate-500 font-medium font-mono mt-2">📍 {artist.location}, KE</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-5">
                      {artist.tags.map((t) => (
                        <span key={t} className="text-[10px] font-medium px-2.5 py-1 bg-slate-950/80 text-slate-400 border border-slate-900 rounded-lg">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/40 border-t border-slate-900/60">
                    <a 
                      href={`/artists/${artist.id}`}
                      className="block w-full text-center py-3 bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 hover:border-transparent text-[11px] font-black uppercase tracking-wider rounded-xl transition-all duration-300"
                    >
                      View Full Portfolio
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* MEDIA VAULT VISUAL FEED CONTAINER */}
          <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 shadow-2xl backdrop-blur-sm lg:sticky lg:top-28">
            <div className="mb-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest font-mono">Media Vault Reel</h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">Aggregated raw media payloads submitted from active nodes.</p>
            </div>

            {/* Layout grids displaying photos/blocks */}
            <div className="grid grid-cols-2 gap-3">
              {/* 1. We still show uploaded profile photos if they exist in localStorage */}
              {allArtists.filter(a => a.image && a.image.startsWith('data:image')).map((artist, idx) => (
                <div key={`profile-img-${idx}`} className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-900 bg-slate-950 shadow-md">
                  <img src={artist.image} alt="Vault capture content" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end p-3">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider truncate w-full">{artist.name}</p>
                  </div>
                </div>
              ))}
              
              {/* 2. Map through live Firestore media! */}
              {mediaVault.length > 0 ? (
                mediaVault.map((media) => (
                  <div key={media.id} className="aspect-square rounded-2xl bg-slate-950/80 border border-slate-900/60 flex flex-col items-center justify-center text-center p-3 text-slate-700 font-mono text-[10px] group hover:border-emerald-500/50 hover:bg-slate-900 transition-all duration-300 relative overflow-hidden">
                    <span className="text-2xl mb-2 opacity-50 group-hover:scale-110 transition-transform">
                      {media.type === 'Video' ? '🎥' : '📸'}
                    </span>
                    <p className="mt-1 font-bold text-slate-300 truncate w-full px-1">{media.name}</p>
                    <p className="mt-1 text-emerald-500/70 text-[8px] uppercase tracking-widest font-bold">
                      {media.artistName || 'Artist'}
                    </p>
                  </div>
                ))
              ) : (
                /* 3. Fallback Wireframes if no media is live yet */
                [
                  { label: 'Live_Set.jpg', icon: '📸' },
                  { label: 'Studio_Cut.mp4', icon: '🎥' }
                ].map((placeholder, i) => (
                  <div key={`placeholder-${i}`} className="aspect-square rounded-2xl bg-slate-950/80 border border-slate-900/60 flex flex-col items-center justify-center text-center p-3 text-slate-700 font-mono text-[10px] group hover:border-slate-800 transition-colors duration-300">
                    <span className="text-xl opacity-40 group-hover:scale-110 transition-transform">{placeholder.icon}</span>
                    <p className="mt-2 font-medium text-slate-500">{placeholder.label}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}