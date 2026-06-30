'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  timestamp: any;
  isMe: boolean;
}

const SHOP_ITEMS = [
  { id: 'VIP-01', type: 'ticket', name: 'VIP Node Access', price: 'KES 5,000', glow: 'from-amber-400 to-orange-600', icon: '🎫', desc: 'Premium live session routing with backstage pipeline access.' },
  { id: 'REG-01', type: 'ticket', name: 'Regular Entry', price: 'KES 1,500', glow: 'from-blue-400 to-cyan-600', icon: '🎟️', desc: 'Standard access terminal for the upcoming live event.' },
  { id: 'MERCH-01', type: 'merch', name: 'Waziza FC Studio Kit', price: 'KES 2,800', glow: 'from-emerald-400 to-teal-600', icon: '👕', desc: 'Official high-grade collective apparel. Breathable mesh.' },
  { id: 'MERCH-02', type: 'merch', name: 'Point Zero Core Hoodie', price: 'KES 3,500', glow: 'from-indigo-400 to-purple-600', icon: '🧥', desc: 'Heavyweight dark-mode hoodie with reflective branding.' }
];

export default function ArtistDashboard() {
  const [currentView, setCurrentView] = useState<'media' | 'bookings' | 'preview' | 'chat' | 'shop'>('shop');

  const [artistName, setArtistName] = useState('Creative');
  const [artistAvatar, setArtistAvatar] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [liveOffers, setLiveOffers] = useState<any[]>([]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');

  const selectedFile = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threeRootRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeSessionStr = sessionStorage.getItem('pz_active_session');
    if (activeSessionStr) {
      const session = JSON.parse(activeSessionStr);
      if (session.name) setArtistName(session.name);
      if (session.avatar) setArtistAvatar(session.avatar);
    }
    const systemQueue = localStorage.getItem('pz_global_booking_queue');
    if (systemQueue) {
      setLiveOffers(JSON.parse(systemQueue));
    }
  }, [currentView]);

  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          senderName: data.senderName,
          senderAvatar: data.senderAvatar,
          text: data.text,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : 'Just now',
          isMe: data.senderName === artistName
        };
      });
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [artistName]);

  useEffect(() => {
    const q = query(collection(db, "artistMedia"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMedia = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          type: data.type,
          size: data.size,
          date: data.timestamp?.toDate ? data.timestamp.toDate().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        };
      });
      setMediaFiles(fetchedMedia);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  useEffect(() => {
    if (!threeRootRef.current) return;
    const container = threeRootRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.5;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.OctahedronGeometry(1, 0);
    const wireframeGeometry = new THREE.OctahedronGeometry(1.04, 0);
    const material = new THREE.MeshPhongMaterial({
      color: 0x6366f1, emissive: 0x111122, specular: 0xffffff, shininess: 80, flatShading: true, transparent: true, opacity: 0.85,
    });
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xec4899, wireframe: true, transparent: true, opacity: 0.45
    });

    const crystalMesh = new THREE.Mesh(geometry, material);
    const wireMesh = new THREE.Mesh(wireframeGeometry, wireMaterial);
    const group3D = new THREE.Group();
    group3D.add(crystalMesh);
    group3D.add(wireMesh);
    scene.add(group3D);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight1 = new THREE.PointLight(0xf43f5e, 1.5, 10); 
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);
    const pointLight2 = new THREE.PointLight(0x3b82f6, 1.2, 10); 
    pointLight2.position.set(-2, -2, 1);
    scene.add(pointLight2);

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / height) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId: number;
    const clock = new THREE.Clock();
    const animateLoop = () => {
      animationFrameId = requestAnimationFrame(animateLoop);
      const elapsedTime = clock.getElapsedTime();
      group3D.rotation.y = elapsedTime * 0.4;
      group3D.rotation.x = Math.sin(elapsedTime * 0.2) * 0.2;
      group3D.rotation.y += (mouseX * 0.4 - group3D.rotation.y) * 0.1;
      group3D.rotation.x += (-mouseY * 0.4 - group3D.rotation.x) * 0.1;
      const scaleFactor = 1 + Math.sin(elapsedTime * 1.5) * 0.04;
      group3D.scale.set(scaleFactor, scaleFactor, scaleFactor);
      renderer.render(scene, camera);
    };
    animateLoop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) selectedFile.current = e.target.files[0];
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const simulateUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile.current) return;
    setUploading(true);
    try {
      const isVideo = selectedFile.current.type.startsWith('video/');
      await addDoc(collection(db, "artistMedia"), {
        name: selectedFile.current.name,
        type: isVideo ? 'Video' : 'Image',
        size: formatBytes(selectedFile.current.size),
        artistName: artistName,
        timestamp: serverTimestamp(),
      });
      setUploading(false);
      selectedFile.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error("Error saving media: ", error);
      setUploading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    try {
      await addDoc(collection(db, "chatMessages"), {
        senderName: artistName,
        senderAvatar: artistAvatar,
        text: typedMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setTypedMessage('');
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-200 font-sans antialiased selection:bg-pink-500/30 relative overflow-hidden">
      
      <div className="absolute inset-0 z-0 pointer-events-none select-none opacity-10 inverted-patch">
        <Image src="/bg-pattern.jpeg" alt="Background" fill priority className="object-cover mix-blend-overlay" />
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/60 p-6 flex-col justify-between hidden md:flex rounded-r-3xl shadow-xl z-20 relative backdrop-blur-md">
        <div>
          <div className="flex flex-col items-center text-center pb-6 mb-6 border-b border-slate-800/50">
            <div ref={threeRootRef} className="w-32 h-32 cursor-grab active:cursor-grabbing relative drop-shadow-2xl" style={{ minHeight: '128px' }} />
            <div className="mt-2">
              <span className="text-xl font-black tracking-wider text-slate-100 uppercase block leading-none">Point Zero</span>
              <span className="text-[10px] tracking-widest text-indigo-400 uppercase font-bold font-mono mt-1 block">Main Office Picture</span>
            </div>
          </div>
          
          <nav className="space-y-2">
            {[
              { id: 'shop', icon: '🛒', label: 'Point Zero Shop' },
              { id: 'media', icon: '🖼️', label: 'My Files & Media' },
              { id: 'bookings', icon: '🗓️', label: 'Work Invitations' },
              { id: 'preview', icon: '👤', label: 'Look At My Page' },
              { id: 'chat', icon: '💬', label: 'Artist Chat' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => setCurrentView(item.id as any)} 
                className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all relative ${
                  currentView === item.id ? 'bg-indigo-500/10 text-indigo-400 shadow-md border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="text-base">{item.icon}</span> {item.label}
                {item.id === 'bookings' && liveOffers.length > 0 && (
                  <span className="absolute right-3 px-2 py-0.5 text-[10px] bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-black animate-pulse">
                    {liveOffers.length}
                  </span>
                )}
                {item.id === 'chat' && <span className="absolute right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-800/60 pt-4 flex items-center gap-3">
          {artistAvatar ? (
            <img src={artistAvatar} alt={artistName} className="h-10 w-10 rounded-2xl object-cover border-2 border-indigo-500/20 bg-slate-800" />
          ) : (
            <div className="h-10 w-10 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 uppercase">
              {artistName.substring(0, 2)}
            </div>
          )}
          <div className="truncate">
            <p className="text-sm font-bold text-slate-100 truncate max-w-[140px]">{artistName}</p>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Artist Account</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 pb-24 md:p-10 md:pb-10 overflow-y-auto relative z-10 flex flex-col justify-start">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative w-full rounded-[2rem] overflow-hidden border border-slate-800/80 bg-slate-950 mb-10 h-auto min-h-[14rem] flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 shadow-lg group transition-transform duration-300 hover:scale-[1.01] z-10 flex-shrink-0">
          {artistAvatar && (
            <div className="absolute inset-0 z-0 pointer-events-none select-none w-full h-full flex items-center justify-center bg-slate-900/60">
              <img src={artistAvatar} alt="Banner Visual Background" className="w-full h-full object-contain opacity-45 transition-opacity duration-300 group-hover:opacity-55" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-[#0b0f19]/20 z-10 pointer-events-none" />
          
          {artistAvatar ? (
            <div className="relative z-20 w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950 flex-shrink-0 shadow-2xl flex items-center justify-center">
              <img src={artistAvatar} alt={artistName} className="w-full h-full object-contain" />
            </div>
          ) : (
            <div className="relative z-20 w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 flex items-center justify-center font-black text-2xl text-indigo-400 uppercase flex-shrink-0">
              {artistName.substring(0, 2)}
            </div>
          )}
          
          <div className="relative z-20 text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight uppercase">Hello, {artistName}</h1>
            <p className="text-indigo-400 text-xs md:text-sm font-bold mt-1 tracking-wide">
              {currentView === 'shop' && 'Manage and distribute premium assets on your terminal 🛒'}
              {currentView === 'media' && 'Your file storage list looks clean and safe ✨'}
              {currentView === 'bookings' && 'Check jobs and bookings sent by customers or managers 💌'}
              {currentView === 'preview' && 'Checking how people see your profile on the main website 🌏'}
              {currentView === 'chat' && 'Live global networking room with all active platform creators ⚡'}
            </p>
          </div>
        </div>

        {/* STUNNING SHOP INTERFACE */}
        {currentView === 'shop' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Shop Hero Card */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900/40 border border-slate-800/80 p-8 md:p-12 backdrop-blur-xl shadow-2xl group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-[80px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
              
              <div className="relative z-10 max-w-2xl">
                <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm inline-block mb-4">
                  E-Commerce Terminal
                </span>
                <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
                  Point Zero <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Shop</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-8 font-medium">
                  Direct allocation terminal for high-value merchandise and live session tickets. Seamlessly route your audience to checkout.
                </p>
                <button className="bg-white text-slate-950 font-black px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  Copy Shop Link
                </button>
              </div>
            </div>

            {/* Shop Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {SHOP_ITEMS.map((item) => (
                <div 
                  key={item.id} 
                  className="group relative bg-slate-900/50 border border-slate-800/80 rounded-[2rem] p-6 hover:bg-slate-900/80 transition-all duration-300 backdrop-blur-md overflow-hidden flex flex-col justify-between min-h-[320px]"
                >
                  {/* Hover Gradient Glow */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-br ${item.glow} transition-opacity duration-500 pointer-events-none`} />
                  
                  <div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.glow} bg-opacity-10 flex items-center justify-center text-2xl shadow-inner border border-white/5`}>
                        {item.icon}
                      </div>
                      <span className="text-[9px] font-mono font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800/50">
                        {item.type}
                      </span>
                    </div>
                    
                    <div className="relative z-10">
                      <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight mb-2 group-hover:text-white transition-colors">{item.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-3">{item.desc}</p>
                    </div>
                  </div>

                  <div className="mt-8 relative z-10 pt-4 border-t border-slate-800/60 flex items-center justify-between">
                    <div className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400">
                      {item.price}
                    </div>
                    <button className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.glow} text-white flex items-center justify-center font-bold hover:scale-110 active:scale-95 transition-transform shadow-lg`}>
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ... KEEP EXISTING VIEWS FOR MEDIA, BOOKINGS, PREVIEW, CHAT HERE ... */}
        {currentView === 'media' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2rem] h-fit shadow-md backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-1">Add New Content</h3>
              <p className="text-xs text-slate-400 mb-4">Put new songs, clips, or photos onto your public profile.</p>
              
              <form onSubmit={simulateUpload} className="space-y-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
                <div onClick={triggerFileSelect} className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40 transition-all group ${selectedFile.current ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-indigo-500/40'}`}>
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                    {selectedFile.current ? '✅' : '📥'}
                  </span>
                  <p className="text-xs font-bold text-slate-300 max-w-[200px] mx-auto truncate">
                    {selectedFile.current ? selectedFile.current.name : 'Click to select files or drop them here'}
                  </p>
                </div>
                <button type="submit" disabled={uploading || !selectedFile.current} className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-lg active:scale-[0.99]">
                  {uploading ? 'Saving file safely... ✨' : 'Upload File Now'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-md backdrop-blur-sm">
              <div className="p-6 border-b border-slate-800/60 bg-slate-900/20">
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">My Public Showcase List</h3>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                {mediaFiles.map(file => (
                  <div key={file.id} className="p-5 flex items-center justify-between hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 bg-slate-950 border border-slate-800 text-indigo-400 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                        {file.type === 'Video' ? '🎥' : '📸'}
                      </div>
                      <div>
                        <p className="text-slate-200 font-bold text-sm">{file.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{file.date} • {file.size}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile Navigation */}
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl z-50 px-4 py-3 flex justify-between items-center pb-safe">
        {[
          { id: 'shop', icon: '🛒', label: 'Shop' },
          { id: 'media', icon: '🖼️', label: 'Media' },
          { id: 'bookings', icon: '🗓️', label: 'Jobs' },
          { id: 'preview', icon: '👤', label: 'Card' },
          { id: 'chat', icon: '💬', label: 'Chat' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as any)}
            className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              currentView === item.id ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            {item.id === 'bookings' && liveOffers.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse border border-slate-900"></span>
            )}
          </button>
        ))}
      </nav>

    </div>
  );
}