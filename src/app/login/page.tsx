'use client';

import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Inlined Firebase configuration to ensure the file is completely self-contained and compiles successfully
const firebaseConfig = {
  apiKey: "AIzaSyC0oCQx9XW6-Ccdp1TwITuPCkZ8XQgzmqs",
  authDomain: "point-zero-ccc16.firebaseapp.com",
  projectId: "point-zero-ccc16",
  storageBucket: "point-zero-ccc16.firebasestorage.app",
  messagingSenderId: "371376718175",
  appId: "1:371376718175:web:2e767517cf2fc4f12976ea",
  measurementId: "G-HQQRQ74Q57"
};

// Safely initialize the application instance
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export default function LoginPage() {
  const [role, setRole] = useState<'artist' | 'client' | 'manager'>('artist');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastEmail = sessionStorage.getItem('pz_last_registered_email');
    if (lastEmail) setEmail(lastEmail);
    
    // Check parameters for secure notice indicators
    if (window.location.search.includes('auth_required')) {
      setErrorMessage('Hold up! You need to sign in to access that workspace portal.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      // 1. Authenticate against Firebase Auth safely
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase().trim(), password);
      const user = userCredential.user;

      // 2. Look up metadata records dynamically from Cloud Firestore DB
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        setErrorMessage('Access Denied: Account verified but profile metadata is missing.');
        setLoading(false);
        return;
      }

      const accountData = userDocSnap.data();

      // 3. Keep specific cross-boundary profile protection secure
      if (accountData.role !== role) {
        setErrorMessage(`Authentication Error: This profile is registered as an ${accountData.role.toUpperCase()}.`);
        setLoading(false);
        return;
      }

      // Store active session details matching your workspace routing checks
      sessionStorage.setItem('pz_active_session', JSON.stringify({ uid: user.uid, ...accountData }));

      // Handle custom callback landing forwards
      const postAuthRedirect = sessionStorage.getItem('pz_redirect_back_target');
      if (postAuthRedirect) {
        sessionStorage.removeItem('pz_redirect_back_target');
        window.location.href = postAuthRedirect;
        return;
      }

      // 4. Send the user to their respective dashboard portals
      if (accountData.role === 'artist') {
        window.location.href = '/dashboard/artist';
      } else if (accountData.role === 'client') {
        window.location.href = '/dashboard/client';
      } else {
        window.location.href = '/dashboard/manager';
      }

    } catch (err: any) {
      console.error("🚨 Firebase Authentication Error:", err);
      // Explicit error mapping for clean client experiences
      if (err.code === 'auth/network-request-failed') {
        setErrorMessage('Connection failed: Check your internet signal, DNS, or browser settings.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setErrorMessage('Access Denied: Invalid email or password signature.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Access locked due to too many failed attempts. Try again later.');
      } else {
        setErrorMessage(err.message || 'An error occurred during authentication.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center p-6 font-sans antialiased text-slate-200">
      <div className="w-full max-w-md bg-[#131a2c] border border-slate-800/80 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
        
        <div className="text-center mb-10">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center font-black text-white text-2xl mx-auto mb-4">Ω</div>
          <h2 className="text-2xl font-black text-white">Welcome Back</h2>
          <p className="text-slate-400 text-xs mt-1">Ready to pick up where you left off?</p>
        </div>

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-2xl text-center">
            {errorMessage}
          </div>
        )}

        {/* ROLE TABS */}
        <div className="grid grid-cols-3 p-1 bg-[#0b0f19] rounded-2xl border border-slate-800/60 mb-8 gap-1">
          {(['artist', 'client', 'manager'] as const).map((r) => (
            <button
              key={r} type="button" disabled={loading} onClick={() => { setRole(r); setErrorMessage(null); }}
              className={`py-2 text-[10px] font-bold rounded-xl uppercase tracking-wider transition-all ${role === r ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Email Address</label>
            <input type="email" required disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="developer@pointzero.io" className="w-full px-5 py-4 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">Password</label>
            <input type="password" required disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-5 py-4 bg-[#0b0f19] border border-slate-800 rounded-2xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-violet-500 transition-colors" />
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 mt-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-black rounded-2xl shadow-lg shadow-violet-500/10 text-xs uppercase tracking-widest hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Decrypting Signature...
              </>
            ) : (
              `Sign In as ${role}`
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">New to the hub? <a href="/signup" className="text-violet-400 font-semibold hover:underline">Create an account</a></p>
      </div>
    </div>
  );
}