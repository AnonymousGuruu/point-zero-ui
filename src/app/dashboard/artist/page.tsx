'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import * as THREE from '@/app/three';
import { db } from '@/lib/firebase'; // Ensure this points to your firebase config
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

// Interfaces for structured chat data tracking
interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  timestamp: any; // Firestore timestamp
  isMe: boolean;
}

export default function ArtistDashboard() {
  // Simple view tabs switching between files, invitations, preview, or workspace network chat
  const [currentView, setCurrentView] = useState<'media' | 'bookings' | 'preview' | 'chat'>('media');

  const [artistName, setArtistName] = useState('Creative');
  const [artistAvatar, setArtistAvatar] = useState<string | null>(null);
  
  const [mediaFiles, setMediaFiles] = useState([
    { id: 1, name: 'Live_Acoustic_Set.mp4', type: 'Video', size: '42.5 MB', date: '2026-05-20' },
    { id: 2, name: 'Studio_Profile_Main.jpg', type: 'Image', size: '2.4 MB', date: '2026-05-22' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [liveOffers, setLiveOffers] = useState<any[]>([]);

  // Real-time Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');

  // References
  const selectedFile = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const threeRootRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load profile sessions and global booking pipelines
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

  // Firebase Chat Sync
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

  // Smooth scroll pinning mechanism for incoming message structures
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, currentView]);

  // Three.js moving graphic system setup loop
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
      color: 0x6366f1, 
      emissive: 0x111122,
      specular: 0xffffff,
      shininess: 80,
      flatShading: true,
      transparent: true,
      opacity: 0.85,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0xec4899, 
      wireframe: true,
      transparent: true,
      opacity: 0.45
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
      geometry.dispose();
      wireframeGeometry.dispose();
      material.dispose();
      wireMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
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
    if (e.target.files && e.target.files[0]) {
      selectedFile.current = e.target.files[0];
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const simulateUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile.current) return;

    setUploading(true);
    
    setTimeout(() => {
      if (!selectedFile.current) return;
      const isVideo = selectedFile.current.type.startsWith('video/');
      
      setMediaFiles(prev => [
        {
          id: Date.now(),
          name: selectedFile.current!.name,
          type: isVideo ? 'Video' : 'Image',
          size: formatBytes(selectedFile.current!.size),
          date: new Date().toISOString().split('T')[0]
        },
        ...prev
      ]);
      
      setUploading(false);
      selectedFile.current = null;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 1500);
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
        <Image 
          src="/bg-pattern.jpeg" 
          alt="Page Background Pattern" 
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover mix-blend-overlay"
        />
      </div>

      {/* Desktop Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800/60 p-6 flex-col justify-between hidden md:flex rounded-r-3xl shadow-xl z-20 relative backdrop-blur-md">
        <div>
          <div className="flex flex-col items-center text-center pb-6 mb-6 border-b border-slate-800/50 relative overflow-visible">
            <div 
              ref={threeRootRef} 
              className="w-32 h-32 cursor-grab active:cursor-grabbing relative drop-shadow-2xl"
              style={{ minHeight: '128px' }}
            />
            
            <div className="mt-2">
              <span className="text-xl font-black tracking-wider text-slate-100 uppercase block leading-none">Point Zero</span>
              <span className="text-[10px] tracking-widest text-indigo-400 uppercase font-bold font-mono mt-1 block">Main Office Picture</span>
            </div>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setCurrentView('media')} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all ${
                currentView === 'media' ? 'bg-indigo-500/10 text-indigo-400 shadow-md border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-base">🖼️</span> My Files & Media
            </button>
            <button 
              onClick={() => setCurrentView('bookings')} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all relative ${
                currentView === 'bookings' ? 'bg-indigo-500/10 text-indigo-400 shadow-md border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-base">🗓️</span> Work Invitations
              {liveOffers.length > 0 && (
                <span className="absolute right-3 px-2 py-0.5 text-[10px] bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full font-black animate-pulse">
                  {liveOffers.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setCurrentView('preview')} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all ${
                currentView === 'preview' ? 'bg-indigo-500/10 text-indigo-400 shadow-md border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-base">👤</span> Look At My Online Page
            </button>

            <button 
              onClick={() => setCurrentView('chat')} 
              className={`w-full flex items-center gap-3 px-4 py-3 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all relative ${
                currentView === 'chat' ? 'bg-indigo-500/10 text-indigo-400 shadow-md border border-indigo-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <span className="text-base">💬</span> Artist Network Chat
              <span className="absolute right-3 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            </button>
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

      {/* Main Content Area - Added pb-24 for mobile nav spacing */}
      <main className="flex-1 p-6 pb-24 md:p-10 md:pb-10 overflow-y-auto relative z-10 flex flex-col justify-start">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative w-full rounded-[2rem] overflow-hidden border border-slate-800/80 bg-slate-950 mb-10 h-auto min-h-[14rem] flex flex-col sm:flex-row items-center gap-6 p-6 md:p-8 shadow-lg group transition-transform duration-300 hover:scale-[1.01] z-10 flex-shrink-0">
          
          {artistAvatar && (
            <div className="absolute inset-0 z-0 pointer-events-none select-none w-full h-full flex items-center justify-center bg-slate-900/60">
              <img 
                src={artistAvatar} 
                alt="Banner Visual Background" 
                className="w-full h-full object-contain opacity-45 transition-opacity duration-300 group-hover:opacity-55"
              />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0f19] via-[#0b0f19]/80 to-[#0b0f19]/20 z-10 pointer-events-none" />
          
          {artistAvatar ? (
            <div className="relative z-20 w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border border-slate-700/50 bg-slate-950 flex-shrink-0 shadow-2xl flex items-center justify-center">
              <img 
                src={artistAvatar} 
                alt={artistName} 
                className="w-full h-full object-contain" 
              />
            </div>
          ) : (
            <div className="relative z-20 w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 flex items-center justify-center font-black text-2xl text-indigo-400 uppercase flex-shrink-0">
              {artistName.substring(0, 2)}
            </div>
          )}
          
          <div className="relative z-20 text-center sm:text-left">
            <h1 className="text-3xl md:text-4xl font-black text-slate-100 tracking-tight uppercase">
              Hello, {artistName}
            </h1>
            <p className="text-indigo-400 text-xs md:text-sm font-bold mt-1 tracking-wide">
              {currentView === 'media' && 'Your file storage list looks clean and safe ✨'}
              {currentView === 'bookings' && 'Check jobs and bookings sent by customers or managers 💌'}
              {currentView === 'preview' && 'Checking how people see your profile on the main website 🌏'}
              {currentView === 'chat' && 'Live global networking room with all active platform creators ⚡'}
            </p>
          </div>
        </div>

        {currentView !== 'chat' && (
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 flex-shrink-0">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Profile Visitors</p>
              <p className="text-3xl font-black text-slate-100 mt-2">1,420</p>
              <div className="mt-2 text-xs text-indigo-400 font-bold">🎉 ↑ 12% extra this week</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Offers Waiting for You</p>
              <p className="text-3xl font-black text-amber-500 mt-2">{liveOffers.length} {liveOffers.length === 1 ? 'Job' : 'Jobs'}</p>
              <div className="mt-2 text-xs text-slate-400 font-medium">Needs your answer button check</div>
            </div>
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-3xl shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Size of Uploaded Files</p>
              <p className="text-3xl font-black text-slate-100 mt-2">44.9 MB</p>
              <div className="mt-2 text-xs text-pink-400 font-bold">🚀 You have unlimited storage room</div>
            </div>
          </section>
        )}

        {currentView === 'media' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-[2rem] h-fit shadow-md backdrop-blur-sm">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest mb-1">Add New Content</h3>
              <p className="text-xs text-slate-400 mb-4">Put new songs, clips, or photos onto your public profile.</p>
              
              <form onSubmit={simulateUpload} className="space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden" 
                />

                <div 
                  onClick={triggerFileSelect}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer bg-slate-950/40 transition-all group ${
                    selectedFile.current ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-slate-800 hover:border-indigo-500/40'
                  }`}
                >
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                    {selectedFile.current ? '✅' : '📥'}
                  </span>
                  <p className="text-xs font-bold text-slate-300 max-w-[200px] mx-auto truncate">
                    {selectedFile.current ? selectedFile.current.name : 'Click to select files or drop them here'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase font-semibold">
                    {selectedFile.current ? formatBytes(selectedFile.current.size) : 'Video files or image pictures'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={uploading || !selectedFile.current}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 disabled:from-slate-800 disabled:to-slate-800 text-white disabled:text-slate-500 font-bold text-xs rounded-2xl uppercase tracking-wider transition-all shadow-lg active:scale-[0.99]"
                >
                  {uploading ? 'Saving file safely... ✨' : 'Upload File Now'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-md backdrop-blur-sm">
              <div className="p-6 border-b border-slate-800/60 bg-slate-900/20">
                <h3 className="text-base font-black text-slate-100 uppercase tracking-wider">My Public Showcase List</h3>
                <p className="text-xs text-slate-400 mt-0.5">These items are showing live right now to anyone checking Point Zero.</p>
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
                    <span className="px-3 py-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold rounded-full uppercase tracking-wider shadow-sm">Visible Online</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === 'bookings' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-6 shadow-md backdrop-blur-sm">
            <h3 className="text-base font-black text-slate-100 uppercase tracking-wider mb-1">Incoming Work Invites</h3>
            <p className="text-xs text-slate-400 mb-6">Deals created by outside people who want to hire you directly.</p>
            
            {liveOffers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 font-medium bg-slate-950/20">
                You have no pending job invites right now. New tasks will show up right here 🍦
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {liveOffers.map((deal, idx) => (
                  <div key={deal.id || idx} className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-500/30 transition-colors">
                    <div>
                      <p className="font-bold text-slate-100 text-base">{deal.client || 'Booking Customer'}</p>
                      <p className="text-slate-400 text-xs mt-1">📅 Setup Date: {deal.date}</p>
                      <p className="text-slate-400 text-xs mt-1.5 font-medium italic bg-slate-900/60 p-2 rounded-xl border border-slate-800/60">"{deal.notes}"</p>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-0 border-slate-800 pt-3 sm:pt-0">
                      <p className="text-xl font-black text-indigo-400 mb-1.5">{deal.budget || 'KES 85,000'}</p>
                      <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        Waiting for managers check
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'preview' && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-[2rem] p-8 text-center max-w-xl mx-auto shadow-md backdrop-blur-sm">
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg text-white animate-pulse">
              ✨
            </div>
            <h3 className="text-lg font-black text-slate-100 tracking-tight">Your Page Is Live On The Web</h3>
            <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
              Your name, details, and music files are successfully turned on and working on the open directory space for clients to view.
            </p>
            <a 
              href="/artists" 
              className="mt-6 inline-block text-xs font-bold bg-slate-800 hover:bg-slate-750 border border-slate-700 px-6 py-3 rounded-2xl text-indigo-400 transition-all tracking-wider uppercase shadow-md active:scale-95"
            >
              Open My Live Card File
            </a>
          </div>
        )}

        {currentView === 'chat' && (
          <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md flex flex-col h-[500px] min-h-[400px]">
            <div className="p-4 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-200">Point Zero Artist Guild</h3>
                  <p className="text-[10px] text-slate-400 font-medium">⚡ Firebase Firestore Secure</p>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 px-2.5 py-1 rounded-xl font-bold font-mono">
                {messages.length} System Nodes
              </span>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs scrollbar-thin scrollbar-thumb-slate-800">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col max-w-[75%] ${msg.isMe ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 opacity-70">
                    {!msg.isMe && (
                      <span className="font-bold text-slate-300 text-[10px] tracking-wide">
                        {msg.senderName}
                      </span>
                    )}
                    <span className="text-[9px] font-mono font-medium text-slate-500">{msg.timestamp}</span>
                  </div>

                  <div 
                    className={`p-3.5 rounded-2xl leading-relaxed text-sm shadow-md border ${
                      msg.isMe 
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-indigo-500/20 rounded-tr-none' 
                        : 'bg-slate-950/80 text-slate-300 border-slate-800/80 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <form 
              onSubmit={handleSendMessage} 
              className="p-4 bg-slate-950/40 border-t border-slate-800/60 flex items-center gap-3 flex-shrink-0"
            >
              <input 
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50"
              />
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-xl z-50 px-4 py-3 flex justify-between items-center pb-safe">
        <button
          onClick={() => setCurrentView('media')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentView === 'media' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-xl">🖼️</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Media</span>
        </button>
        <button
          onClick={() => setCurrentView('bookings')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentView === 'bookings' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-xl">🗓️</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Jobs</span>
          {liveOffers.length > 0 && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse border border-slate-900"></span>
          )}
        </button>
        <button
          onClick={() => setCurrentView('preview')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentView === 'preview' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Card</span>
        </button>
        <button
          onClick={() => setCurrentView('chat')}
          className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            currentView === 'chat' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-xl">💬</span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Chat</span>
          <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
        </button>
      </nav>

    </div>
  );
}