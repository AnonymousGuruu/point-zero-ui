'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import * as THREE from 'three';
// Firebase Imports
import { db } from '@/lib/firebase'; // Ensure this points to your firebase config
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

interface ChatMessage {
  id: string;
  senderName: string;
  senderAvatar: string | null;
  text: string;
  timestamp: any; // Firestore timestamp
  isMe: boolean;
}

export default function ArtistDashboard() {
  const [currentView, setCurrentView] = useState<'media' | 'bookings' | 'preview' | 'chat'>('media');
  const [artistName, setArtistName] = useState('Creative');
  const [artistAvatar, setArtistAvatar] = useState<string | null>(null);
  
  // Real-time Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typedMessage, setTypedMessage] = useState('');
  
  // References
  const threeRootRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 1. Firebase Chat Listener
  useEffect(() => {
    const q = query(collection(db, "chatMessages"), orderBy("timestamp", "asc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages: ChatMessage[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Omit<ChatMessage, 'id'>,
        isMe: doc.data().senderName === artistName
      }));
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, [artistName]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 2. Firebase Message Sender
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
      console.error("Error sending message to Firestore: ", error);
    }
  };

  // Three.js Engine remains unchanged
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
    container.appendChild(renderer.domElement);

    const geometry = new THREE.OctahedronGeometry(1, 0);
    const material = new THREE.MeshPhongMaterial({ color: 0x6366f1, flatShading: true });
    const crystalMesh = new THREE.Mesh(geometry, material);
    scene.add(crystalMesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const animateLoop = () => {
      requestAnimationFrame(animateLoop);
      crystalMesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animateLoop();

    return () => {
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-200">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900/80 border-r border-slate-800 p-6 flex flex-col z-20">
        <div ref={threeRootRef} className="w-32 h-32 mb-6" />
        <nav className="space-y-4">
          <button onClick={() => setCurrentView('media')} className="w-full text-left font-bold text-xs uppercase text-slate-400">Files</button>
          <button onClick={() => setCurrentView('chat')} className="w-full text-left font-bold text-xs uppercase text-indigo-400">Chat</button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-10 flex flex-col">
        {currentView === 'chat' ? (
          <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-[2rem] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-800"><h3 className="font-bold text-indigo-400">Point Zero Guild</h3></div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-3 rounded-2xl ${msg.isMe ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-800 flex gap-2">
              <input 
                type="text"
                value={typedMessage}
                onChange={(e) => setTypedMessage(e.target.value)}
                className="flex-1 bg-slate-950 p-3 rounded-xl border border-slate-800"
              />
              <button type="submit" className="bg-indigo-600 px-6 py-3 rounded-xl font-bold">Send</button>
            </form>
          </div>
        ) : (
          <div className="text-slate-500">Other content views...</div>
        )}
      </main>
    </div>
  );
}