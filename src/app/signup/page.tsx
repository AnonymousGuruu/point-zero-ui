'use client';

import React, { useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

/**
 * Utility to compress base64 image strings directly on the client browser.
 * Fixed and inlined here to resolve the missing export error from your library.
 */
function compressBase64Image(base64Str: string, maxWidth = 400, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to create 2D canvas context"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => reject(err);
  });
}

const SYSTEM_ROLES = ['artist', 'client', 'manager'] as const;

export default function SignupPage() {
  const [role, setRole] = useState<'artist' | 'client' | 'manager'>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile metadata metrics
  const [artistCategory, setArtistCategory] = useState('Vocalist');
  const [location, setLocation] = useState('Nairobi');
  const [customTags, setCustomTags] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          // Client-side auto compression guarantees files stay safely under the strict 1MB Firestore limit
          const compressed = await compressBase64Image(rawBase64, 400, 0.7);
          setAvatarBase64(compressed);
        } catch (err) {
          console.error("Image compression failed, falling back to raw:", err);
          setAvatarBase64(rawBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    console.log("🚀 Form submission intercepted! Current Payload:", { name, email, role });

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill out all required fields.');
      setLoading(false);
      return;
    }

    if (role === 'manager') {
      if (!adminCode || adminCode !== 'PZ-2026-NBO-ALPHA') {
        setError("Hold up, that admin pass-key doesn't look right.");
        setLoading(false);
        return;
      }
    }

    try {
      console.log(`📡 Dispatching payload directly to Firebase Auth & Firestore...`);
      
      // 1. Create secure credentials in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // Assemble unified schema object
      const profileData = {
        uid: user.uid,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role,
        avatar: avatarBase64,
        artistCategory: role === 'artist' ? artistCategory : null,
        location: role === 'artist' ? location.trim() : null,
        customTags: role === 'artist' ? customTags.trim() : null,
        createdAt: new Date().toISOString()
      };

      // 2. Write the user metadata document securely directly to Firestore DB
      await setDoc(doc(db, 'users', user.uid), profileData);

      console.log("📥 Account Created Successfully!");

      // 3. Keep local session metrics matching login expectations
      sessionStorage.setItem('pz_active_session', JSON.stringify(profileData));
      sessionStorage.setItem('pz_last_registered_email', email.toLowerCase().trim());

      // 4. AUTO-FORWARD: Ship user directly to their dashboard space without showing the login screen
      if (role === 'artist') {
        window.location.href = '/dashboard/artist';
      } else if (role === 'client') {
        window.location.href = '/dashboard/client';
      } else {
        window.location.href = '/dashboard/manager';
      }

    } catch (err: any) {
      console.error("🚨 Signup Submission Error Stack:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered. Try signing in.");
      } else if (err.code === 'auth/weak-password') {
        setError("Your password is too weak. Please use at least 6 characters.");
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network error! Please check your internet connection, cell service, or DNS config.");
      } else {
        setError(err.message || "Failed to establish secure cloud sync. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-md bg-[#131a2c] border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-violet-500/20 mb-4">Ω</div>
          <h2 className="text-2xl font-black text-white tracking-tight">Join Point Zero</h2>
          <p className="text-slate-400 text-xs mt-1.5 text-center">Zero pressure. Just pure creative connection.</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium rounded-2xl text-center">
            {error}
          </div>
        )}

        {/* ROLE SWAPPER */}
        <div className="grid grid-cols-3 p-1 bg-[#0b0f19] rounded-2xl border border-slate-800/60 mb-6 gap-1">
          {SYSTEM_ROLES.map((r) => (
            <button
              key={r} 
              type="button" 
              disabled={loading}
              onClick={() => { setRole(r); setError(null); }}
              className={`py-2 text-[11px] font-bold rounded-xl uppercase tracking-wider transition-all duration-200 ${
                role === r 
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleSignup} noValidate className="space-y-5">
          {/* USER NAME */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Stage Name / Brand</label>
            <input type="text" disabled={loading} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name / Brand" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          {/* DYNAMIC CATEGORY DROPDOWN */}
          {role === 'artist' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Talent Core Category</label>
              <div className="relative">
                <select
                  disabled={loading}
                  value={artistCategory}
                  onChange={(e) => setArtistCategory(e.target.value)}
                  className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 appearance-none cursor-pointer focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="Vocalist">Vocalist</option>
                  <option value="Dancer">Dancer</option>
                  <option value="Model">Model</option>
                  <option value="Cinematographer">Cinematographer</option>
                  <option value="Producer">Producer</option>
                  <option value="Photographer">Photographer</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-violet-400">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* METADATA METRICS */}
          {role === 'artist' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">City Location</label>
                <input type="text" disabled={loading} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nairobi" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Filter Tags</label>
                <input type="text" disabled={loading} value={customTags} onChange={(e) => setCustomTags(e.target.value)} placeholder="Afro-Jazz, Live" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
          )}

          {/* PROFILE PICTURE WITH INTEGRATED PREVIEW */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Profile Picture / Avatar</label>
            <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-2xl flex items-center gap-4">
              <input type="file" disabled={loading} accept="image/*" onChange={handleFileChange} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#131a2c] file:text-violet-400 hover:file:bg-slate-800 cursor-pointer transition-colors w-full" />
              {avatarBase64 && <img src={avatarBase64} alt="Preview" className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0" />}
            </div>
          </div>

          {/* MANAGER KEY */}
          {role === 'manager' && (
            <div className="p-4 bg-[#0b0f19] border border-fuchsia-500/20 rounded-2xl">
              <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Admin Security Key Token</label>
              <input type="password" disabled={loading} value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Enter system administrative key..." className="w-full px-4 py-3.5 bg-[#131a2c] border border-slate-800 rounded-2xl text-sm font-mono text-fuchsia-400 placeholder-slate-700 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
            <input type="email" disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="developer@pointzero.io" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Secure Password</label>
            <input type="password" disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:opacity-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/10 text-xs uppercase tracking-widest active:scale-[0.98] flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Linking Core Matrix...
              </>
            ) : (
              `Register ${role} Profile`
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">Already have an account? <a href="/login" className="text-violet-400 font-semibold hover:underline">Sign In</a></p>
      </div>
    </div>
  );
}