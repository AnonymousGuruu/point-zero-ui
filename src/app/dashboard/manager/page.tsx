'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Contract {
  id: string;
  artist: string;
  service: string;
  budget: string;
  status: 'Active' | 'Pending Review' | 'Completed';
}

interface InboundBooking {
  id?: string;
  client?: string;
  artist?: string;
  date?: string;
  notes?: string;
  budget?: string;
}

export default function ManagerDashboard() {
  const [currentTab, setCurrentTab] = useState<'contracts' | 'bookings' | 'payments' | 'applications' | 'signed_artists'>('contracts');
  const [contracts, setContracts] = useState<Contract[]>([
    { id: 'CON-902', artist: 'Kendi Nicole', service: 'Live Performance Set', budget: 'Ksh 75,000', status: 'Active' },
    { id: 'CON-884', artist: 'Jotham Sparks', service: 'Music Video Shoot', budget: 'Ksh 120,000', status: 'Pending Review' },
    { id: 'CON-711', artist: 'Sauti Vision', service: 'Audio Mastering', budget: 'Ksh 45,000', status: 'Completed' },
  ]);
  const [inboundBookings, setInboundBookings] = useState<InboundBooking[]>([]);

  // Mock list of independent artists waiting to be signed by the manager
  const [newApplicants, setNewApplicants] = useState([
    { id: 'ART-01', name: 'Maji Mazuri Band', style: 'Afro-Fusion Live Act' },
    { id: 'ART-02', name: 'DJ Stevo Ke', style: 'Electronic & Reggae Mixes' },
  ]);

  // List of officially signed Point Zero family members
  const [officialArtists, setOfficialArtists] = useState([
    { id: 'PZ-001', name: 'Kendi Nicole', status: 'Official Member' },
    { id: 'PZ-002', name: 'Jotham Sparks', status: 'Official Member' },
  ]);

  useEffect(() => {
    const queue = localStorage.getItem('pz_global_booking_queue');
    if (queue) setInboundBookings(JSON.parse(queue));
  }, [currentTab]);

  const handleApproveBooking = (index: number) => {
    const target = inboundBookings[index];
    if (!target) return;
    
    const newContract: Contract = {
      id: `CON-${Math.floor(100 + Math.random() * 900)}`,
      artist: target.artist || 'Unknown Artist',
      service: target.notes || 'Performance Booking',
      budget: target.budget || 'Ksh 85,000',
      status: 'Active'
    };

    setContracts((prev) => [newContract, ...prev]);
    const updatedQueue = inboundBookings.filter((_, i) => i !== index);
    setInboundBookings(updatedQueue);
    localStorage.setItem('pz_global_booking_queue', JSON.stringify(updatedQueue));
  };

  // Turn a regular applicant into an official signed Point Zero artist
  const handleSignArtist = (id: string) => {
    const luckyArtist = newApplicants.find(a => a.id === id);
    if (!luckyArtist) return;

    setOfficialArtists(prev => [...prev, { id: `PZ-0${officialArtists.length + 1}`, name: luckyArtist.name, status: 'Official Member' }]);
    setNewApplicants(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden">
      
      {/* GLOBAL BACKGROUND IMAGE LAYER WITH PERFORMANCE SIZES PROPERTY */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10">
        <Image 
          src="/bg-pattern.jpeg" 
          alt="Dashboard Background" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-68 bg-slate-900/40 backdrop-blur-md border-r border-slate-800/60 p-6 flex flex-col justify-between hidden md:flex z-10 relative">
        <div>
          <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="h-9 w-9 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
              <Image 
                src="/bg-pattern.jpeg" 
                alt="Point Zero Logo" 
                fill 
                sizes="36px"
                className="object-cover"
              />
            </div>
            <div>
              <span className="text-lg font-black tracking-wider text-white uppercase block leading-none">Point Zero</span>
              <span className="text-[10px] tracking-widest text-emerald-400 uppercase font-bold font-mono">Boss Page</span>
            </div>
          </div>
          
          <nav className="space-y-1.5">
            {[
              { id: 'contracts', label: 'Active Jobs & Work', icon: '📜' },
              { id: 'bookings', label: 'New Client Requests', icon: '🤝', count: inboundBookings.length },
              { id: 'payments', label: 'Money Saved Safely', icon: '💳' },
              { id: 'applications', label: 'New Sign-Up Requests', icon: '✨', count: newApplicants.length },
              { id: 'signed_artists', label: 'Our Signed Artists', icon: '🎤', count: officialArtists.length }
            ].map((tab) => (
              <button 
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)} 
                className={`w-full flex items-center justify-between px-4 py-3.5 font-bold text-xs tracking-wide uppercase rounded-xl transition-all duration-300 relative group ${
                  currentTab === tab.id 
                    ? 'bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border-l-2 border-emerald-500 pl-5' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 pl-4'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-base opacity-80 group-hover:scale-110 transition-transform">{tab.icon}</span>
                  {tab.label}
                </div>
                {tab.count ? (
                  <span className="px-2 py-0.5 text-[10px] bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 rounded-md font-black shadow-sm">
                    {tab.count}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800/80 pt-5 flex items-center gap-4 px-2">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 flex items-center justify-center text-xs font-black text-emerald-400 tracking-wider shadow-inner">
            BOSS
          </div>
          <div>
            <p className="text-xs font-black text-slate-200 uppercase tracking-wide">Main Office</p>
            <p className="text-[10px] text-slate-500 font-mono tracking-wider">computer_room_1</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-b from-slate-900/10 via-slate-950/40 to-slate-950/80 backdrop-blur-[2px] z-10 relative">
        
        {/* HEADER */}
        <header className="mb-12 pb-6 border-b border-slate-900/60 flex flex-col lg:flex-row justify-between lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight uppercase">
              {currentTab === 'contracts' && 'Current Work & Deals'}
              {currentTab === 'bookings' && 'New Customer Requests'}
              {currentTab === 'payments' && 'Money Saved Safely'}
              {currentTab === 'applications' && 'People Who Want to Join'}
              {currentTab === 'signed_artists' && 'Official Team Artists'}
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-2 max-w-2xl font-medium leading-relaxed">
              {currentTab === 'contracts' && 'Look at active jobs, check progress updates, and see who is finished playing.'}
              {currentTab === 'bookings' && 'Read what messages customers sent over, then choose to sign agreement papers.'}
              {currentTab === 'payments' && 'See cash sent by clients held safely until work is done, then clear it.'}
              {currentTab === 'applications' && 'See singers or DJs asking to work under Point Zero brand officially.'}
              {currentTab === 'signed_artists' && 'Our fully certified official list of protected creative partners.'}
            </p>
          </div>
          <button className="self-start lg:self-center px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95">
            + Start New Agreement
          </button>
        </header>

        {/* METRICS PANELS */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
          {[
            { title: 'Money Being Worked For', val: 'Ksh 240,000', desc: 'Total safe cash for open jobs', color: 'text-white border-slate-900' },
            { title: 'Waiting For Your OK', val: `${inboundBookings.length} ${inboundBookings.length === 1 ? 'Job' : 'Jobs'}`, desc: 'Needs your click to turn into a contract', color: 'text-amber-400 border-amber-500/10 bg-amber-500/[0.01]' },
            { title: 'Finished Jobs', val: '14 Deals', desc: 'Older works successfully closed and paid out', color: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/[0.01]' }
          ].map((card, i) => (
            <div key={i} className={`bg-slate-900/40 border p-6 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-slate-800 transition-colors duration-300 ${card.color}`}>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{card.title}</p>
              <p className="text-3xl font-black tracking-tight mt-2">{card.val}</p>
              <div className="mt-3 text-[11px] text-slate-400/70 font-mono flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-slate-600"></span> {card.desc}
              </div>
            </div>
          ))}
        </section>

        {/* TAB 1: ACTIVE PIPELINES */}
        {currentTab === 'contracts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2 px-1">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">Live Working Lines</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Showing connected deals active between our guys and hiring clients right now.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {contracts.map(con => (
                <div key={con.id} className="bg-slate-900/50 border border-slate-900 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-800/80 hover:bg-slate-900/70 backdrop-blur-md transition-all duration-300">
                  <div className="flex items-start lg:items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono text-xs font-black text-slate-400 shadow-inner">
                      #{con.id.split('-')[1]}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{con.artist}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{con.service}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap lg:items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 border-slate-900 pt-4 lg:pt-0">
                    <div className="font-mono text-left lg:text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Payment Amount</p>
                      <p className="text-sm font-black text-emerald-400 mt-0.5">{con.budget}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                        con.status === 'Active' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/10' :
                        con.status === 'Pending Review' ? 'bg-amber-500/5 text-amber-400 border-amber-500/10' :
                        'bg-slate-800/40 text-slate-400 border-slate-700/50'
                      }`}>
                        {con.status === 'Active' ? 'On-Going Work' : con.status === 'Pending Review' ? 'Checking Done Work' : 'Finished & Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CLIENT BOOKINGS */}
        {currentTab === 'bookings' && (
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">New Job Offers Queue</h3>
            <p className="text-xs text-slate-500 mb-8">Incoming hiring notifications that need your permission signature to become real.</p>
            
            {inboundBookings.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-900/40 rounded-2xl text-xs font-mono text-slate-600 uppercase tracking-widest bg-slate-950/20">
                No incoming customers messaging at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {inboundBookings.map((deal, idx) => (
                  <div key={deal.id || idx} className="p-6 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col lg:flex-row justify-between lg:items-center gap-6 group hover:border-slate-800 transition-all duration-300 backdrop-blur-sm">
                    <div className="space-y-3 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-widest uppercase bg-amber-400/10 text-amber-400 px-2.5 py-1 border border-amber-400/10 rounded-md font-mono">
                          Needs Check // {deal.id || 'INCOMING'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">📅 {deal.date}</span>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-white tracking-tight">
                          Customer: <span className="text-slate-300 font-medium">{deal.client}</span> ➔ Wants to Hire: <span className="text-emerald-400">{deal.artist}</span>
                        </p>
                        <p className="text-xs text-slate-400 mt-2 italic leading-relaxed font-medium bg-slate-900/60 p-3 rounded-xl border border-slate-900/80">
                          &ldquo;{deal.notes || 'No special instructions given by client.'}&rdquo;
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 border-slate-900/60 pt-4 lg:pt-0">
                      <div className="text-left lg:text-right font-mono">
                        <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Offered Pay</p>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">{deal.budget || 'Ksh 85,000'}</p>
                      </div>
                      <button 
                        onClick={() => handleApproveBooking(idx)}
                        className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-500/5 active:scale-95"
                      >
                        Sign & Start Job
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MONEY SYSTEM */}
        {currentTab === 'payments' && (
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">Safe Money Keeping Boxes</h3>
            <p className="text-xs text-slate-500 mb-8">Checking down-payments made by clients locked securely until our artist completes the work.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Kendi Nicole', project: 'Live Jazz Set Portfolio Deal', ref: 'ID-CON-902', amount: 'Ksh 75,000', secured: true },
                { name: 'Jotham Sparks', project: 'Studio Music Video Shoot', ref: 'ID-CON-884', amount: 'Ksh 120,000', secured: false }
              ].map((vault, i) => (
                <div key={i} className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col justify-between gap-6 hover:border-slate-800 transition-all duration-300 backdrop-blur-sm">
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-base font-bold text-white tracking-tight">{vault.name}</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">{vault.project}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase font-mono tracking-wider border ${
                        vault.secured 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/10'
                      }`}>
                        {vault.secured ? 'Cash_Locked_Safe' : 'Waiting_For_Deposit'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono mt-4">Receipt Number: {vault.ref}</p>
                  </div>
                  
                  <div className="border-t border-slate-900/80 pt-4 flex items-center justify-between font-mono">
                    <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Locked Amount</span>
                    <span className={`text-base font-black ${vault.secured ? 'text-emerald-400' : 'text-amber-400'}`}>{vault.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NEW TAB 4: NEW TALENT SIGN-UP REQUESTS */}
        {currentTab === 'applications' && (
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">New People Asking to Join</h3>
            <p className="text-xs text-slate-500 mb-8">These are independent creators who filled out registration forms online.</p>
            
            {newApplicants.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-900/40 rounded-2xl text-xs font-mono text-slate-600 uppercase tracking-widest bg-slate-950/20">
                Nobody new is in the holding queue.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {newApplicants.map((applicant) => (
                  <div key={applicant.id} className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:border-slate-800 transition-all duration-300 backdrop-blur-sm">
                    <div>
                      <h4 className="text-base font-bold text-white tracking-tight">{applicant.name}</h4>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{applicant.style}</p>
                      <p className="text-[10px] text-slate-600 font-mono mt-2">Form ID: {applicant.id}</p>
                    </div>
                    <button 
                      onClick={() => handleSignArtist(applicant.id)}
                      className="self-start sm:self-center px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95"
                    >
                      Sign as Official Artist
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* NEW TAB 5: LIST OF OFFICIAL POINT ZERO ARTISTS */}
        {currentTab === 'signed_artists' && (
          <div className="bg-slate-900/30 border border-slate-900/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">Our Official Point Zero Family</h3>
            <p className="text-xs text-slate-500 mb-8">This is your current team line-up. These artists show up on client hire portals.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {officialArtists.map((artist) => (
                <div key={artist.id} className="p-5 bg-slate-950/40 border border-slate-900 rounded-2xl flex justify-between items-center hover:border-slate-800 transition-all duration-300 backdrop-blur-sm">
                  <div>
                    <h4 className="text-base font-bold text-white tracking-tight">{artist.name}</h4>
                    <p className="text-[10px] text-emerald-400 font-mono mt-1">Badge ID: {artist.id}</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/10">
                    {artist.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}