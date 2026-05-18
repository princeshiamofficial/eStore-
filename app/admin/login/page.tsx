'use client';

import React, { useState, useEffect } from 'react';
import 'bootstrap-icons/font/bootstrap-icons.css';

// ── Toast ──────────────────────────────────────────────────────────────────
interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

function Toast({ message, type, onDismiss }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const bgColor =
    type === 'success' ? 'bg-slate-900 border-slate-800' : 'bg-red-600 border-red-500';
  const iconBg = type === 'success' ? 'bg-emerald-500' : 'bg-white/20';

  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${bgColor} text-white px-6 py-4 rounded-2xl shadow-2xl z-[9999] flex items-center gap-3 border font-medium text-sm min-w-[320px]`}
    >
      <div className={`w-6 h-6 ${iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
        <i className={`bi ${type === 'success' ? 'bi-check-lg' : 'bi-x-lg'} text-xs`} />
      </div>
      <span>{message}</span>
    </div>
  );
}

// ── Main Login Page ─────────────────────────────────────────────────────────
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  // On mount: handle ?logout=true, or auto-login if remember me was set
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('logout') === 'true') {
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminPassword');
      localStorage.removeItem('rememberMe');
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const savedEmail = localStorage.getItem('adminEmail');
    const savedPassword = localStorage.getItem('adminPassword');
    const savedRemember = localStorage.getItem('rememberMe') === 'true';

    if (savedRemember && savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(savedPassword);
      setRememberMe(true);
      autoLogin(savedEmail, savedPassword);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const autoLogin = async (savedEmail: string, savedPassword: string) => {
    setIsLoading(true);
    setLoadingLabel('Auto-signing in...');
    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: savedEmail, password: savedPassword }),
      });

      if (response.redirected) {
        showToast('Welcome back! Redirecting...', 'success');
        setTimeout(() => { window.location.href = response.url; }, 1500);
      } else if (!response.ok) {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminPassword');
        localStorage.removeItem('rememberMe');
        setRememberMe(false);
        setIsLoading(false);
        showToast('Session expired. Please login again.', 'error');
      }
    } catch {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setLoadingLabel('Verifying...');

    try {
      const response = await fetch('/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.redirected) {
        showToast('Login successful! Redirecting...', 'success');

        if (rememberMe) {
          localStorage.setItem('adminEmail', email);
          localStorage.setItem('adminPassword', password);
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('adminEmail');
          localStorage.removeItem('adminPassword');
          localStorage.removeItem('rememberMe');
        }

        setTimeout(() => { window.location.href = response.url; }, 1500);
      } else if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Invalid credentials');
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const message =
        err instanceof Error
          ? err.message
          : 'Verification failed. Please check your credentials.';
      showToast(message, 'error');
    }
  };

  return (
    <>
      {/* Global styles */}
      <style>{`
        body {
          font-family: 'Inter', sans-serif;
          background: radial-gradient(circle at top right, #f8fafc, #f1f5f9);
        }
        .studio-card {
          background: #ffffff;
          box-shadow:
            0 10px 25px -5px rgba(0,0,0,0.04),
            0 8px 10px -6px rgba(0,0,0,0.04);
        }
        .input-field {
          background: #fdfdfd;
          border: 1px solid #e2e8f0;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .input-field:focus {
          border-color: #000000;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(0,0,0,0.03);
          outline: none;
        }
      `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen flex items-center justify-center p-6 text-slate-900">
        <div className="w-full max-w-[400px]">

          {/* Logo — separate div above card */}
          <div className="flex justify-center mb-6">
            <img src="/logo.png" alt="Color Hut Studio" className="h-[34px] w-auto object-contain" />
          </div>

          {/* Card */}
          <div className="studio-card rounded-[2.5rem] p-10 border border-white">
            <header className="text-center mb-10">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
              <p className="text-slate-500 text-sm mt-1 font-medium">Sign in to manage your studio</p>
            </header>

            <form onSubmit={handleLogin} className="space-y-6">

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors pointer-events-none">
                    <i className="bi bi-envelope text-lg" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full input-field rounded-xl pl-12 pr-4 py-3.5 text-slate-900 placeholder-slate-400 font-medium text-sm"
                    placeholder="name@studio.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors pointer-events-none">
                    <i className="bi bi-lock text-lg" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full input-field rounded-xl pl-12 pr-12 py-3.5 text-slate-900 placeholder-slate-400 font-medium text-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-black transition-colors focus:outline-none"
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-lg`} />
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div
                className="flex items-center gap-3 cursor-pointer w-fit group"
                onClick={() => setRememberMe((prev) => !prev)}
              >
                <div
                  className={`h-5 w-5 border-2 rounded-md transition-all flex items-center justify-center flex-shrink-0
                    ${rememberMe ? 'bg-black border-black' : 'bg-white border-slate-200'}
                  `}
                >
                  {rememberMe && (
                    <i className="bi bi-check text-white text-sm leading-none" style={{ fontSize: '14px' }} />
                  )}
                </div>
                <span className="text-sm text-slate-500 font-medium group-hover:text-slate-800 transition-colors">
                  Remember Me
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl hover:bg-black hover:shadow-xl hover:shadow-black/10 active:scale-[0.98] transition-all duration-200 disabled:opacity-80 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="bi bi-arrow-repeat animate-spin text-lg" />
                    {loadingLabel}
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>


        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}
