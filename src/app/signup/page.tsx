'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Pull the static configuration array completely outside the component render cycle
// This prevents Turbopack from misinterpreting the inline type casting syntax as a JSX block
const SYSTEM_ROLES = ['artist', 'client', 'manager'] as const;

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<'artist' | 'client' | 'manager'>('artist');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Core configuration metrics for the dynamic directory alignment mapping
  const [artistCategory, setArtistCategory] = useState('Vocalist');
  const [location, setLocation] = useState('Nairobi');
  const [customTags, setCustomTags] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    console.log("🚀 Form submission intercepted! Current Payload:", { name, email, role });

    // Enforce basic programmatic input validation for standard fields safely on mobile
    if (!name.trim() || !email.trim() || !password.trim()) {
      console.log("❌ Validation failed: One of the core fields is completely empty.");
      setError('Please fill out all required fields.');
      return;
    }

    // SYSTEM CHECK: Validate master admin authorization token key string before saving
    if (role === 'manager') {
      if (!adminCode || adminCode !== 'PZ-2026-NBO-ALPHA') {
        console.log("❌ Admin validation failed: Incorrect key string.");
        setError("Hold up, that admin pass-key doesn't look right.");
        return;
      }
    }

    // Assemble unified global payload object to transmit to your backend schema endpoints
    const signupPayload = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      avatar: avatarBase64,
      artistCategory,
      location: location.trim(),
      customTags: customTags.trim()
    };

    try {
      // Force the app to point directly to your live production Render backend
      const BASE_SERVER_URL = "https://point-zero-backend.onrender.com";
      console.log(`📡 Dispatching payload directly to backend: ${BASE_SERVER_URL}/api/auth/register`);
      
      const response = await fetch(`${BASE_SERVER_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupPayload),
      });

      const data = await response.json();
      console.log("📥 Server response received:", data);

      // Catch and expose specific errors returned directly from your Express backend logic
      if (!response.ok) {
        throw new Error(data.error || "An error occurred during account routing.");
      }

      // Keep trace of last registered address to cleanly fill inputs on the login page
      sessionStorage.setItem('pz_last_registered_email', signupPayload.email);

      // Clean routing shifts upon verified successful account commitment
      if (role === 'artist') {
        router.push('/artists');
      } else {
        router.push('/login');
      }
    } catch (err: any) {
      console.error("🚨 Signup Submission Error Stack:", err);
      setError(err.message || "Failed to establish global link. Make sure your server is online.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-md bg-[#131a2c] border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
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

        {/* THREE-WAY ROLE SWITCH SELECTOR BOX */}
        <div className="grid grid-cols-3 p-1 bg-[#0b0f19] rounded-2xl border border-slate-800/60 mb-6 gap-1">
          {SYSTEM_ROLES.map((r) => (
            <button
              key={r} 
              type="button" 
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

        {/* Added noValidate flag to override phantom mobile validation hangs */}
        <form onSubmit={handleSignup} noValidate className="space-y-5">
          {/* USER ACCOUNT NAME */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Stage Name / Brand</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full Name / Brand" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          {/* D_CORE TALENT CATEGORY DROPDOWN MENU */}
          {role === 'artist' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Talent Core Category</label>
              <div className="relative">
                <select
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

          {/* METRIC PROFILE METADATA PLACEMENTS FIELDS */}
          {role === 'artist' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">City Location</label>
                <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Nairobi" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Filter Tags</label>
                <input type="text" value={customTags} onChange={(e) => setCustomTags(e.target.value)} placeholder="Afro-Jazz, Live" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 focus:outline-none focus:border-violet-500 transition-colors" />
              </div>
            </div>
          )}

          {/* PORTFOLIO IMAGE COMPONENT ATTACHMENT BOX */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Profile Picture / Avatar</label>
            <div className="p-4 bg-[#0b0f19] border border-slate-800 rounded-2xl flex items-center gap-4">
              <input type="file" accept="image/*" onChange={handleFileChange} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#131a2c] file:text-violet-400 hover:file:bg-slate-800 cursor-pointer transition-colors w-full" />
              {avatarBase64 && <img src={avatarBase64} alt="Preview" className="h-10 w-10 rounded-xl object-cover border border-slate-700 shrink-0" />}
            </div>
          </div>

          {/* SYSTEM SECURITY LEVEL KEY TOKEN */}
          {role === 'manager' && (
            <div className="p-4 bg-[#0b0f19] border border-fuchsia-500/20 rounded-2xl">
              <label className="block text-xs font-bold text-fuchsia-400 uppercase tracking-widest mb-2">Admin Security Key Token</label>
              <input type="password" value={adminCode} onChange={(e) => setAdminCode(e.target.value)} placeholder="Enter system administrative key..." className="w-full px-4 py-3.5 bg-[#131a2c] border border-slate-800 rounded-2xl text-sm font-mono text-fuchsia-400 placeholder-slate-700 focus:outline-none focus:border-fuchsia-500 transition-colors" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="developer@pointzero.io" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Secure Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3.5 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <button type="submit" className="w-full py-4 mt-2 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 hover:opacity-95 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-500/10 text-xs uppercase tracking-widest active:scale-[0.98]">
            Register {role} Profile
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">Already have an account? <a href="/login" className="text-violet-400 font-semibold hover:underline">Sign In</a></p>
      </div>
    </div>
  );
}