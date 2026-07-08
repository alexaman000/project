'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Loader2, Quote } from 'lucide-react';



export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const router = useRouter();



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const res = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      login(data.access_token);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[10%] w-full">
      {/* Inspirational Quote (Instrument Serif) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="mb-12 max-w-2xl px-4 flex flex-col items-center"
      >
        <Quote className="text-[#FDE047]/40 mb-4" size={24} />
        <h1 className="text-4xl md:text-5xl lg:text-6xl text-[#FDE047] mb-4 tracking-tight font-serif italic font-light leading-tight">
          "The secret of getting ahead is getting started."
        </h1>
        <p className="text-[#FDE047]/60 text-sm tracking-widest uppercase">Mark Twain</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-6"
      >
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="flex flex-col gap-3">
            <div className="liquid-glass rounded-full px-6 py-1.5 flex items-center h-14">
              <input
                type="email"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none outline-none text-[#FDE047] placeholder:text-[#FDE047]/40 text-base w-full h-full"
              />
            </div>
            
            <div className="liquid-glass rounded-full px-6 py-1.5 flex items-center h-14">
              <input
                type="password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent border-none outline-none text-[#FDE047] placeholder:text-[#FDE047]/40 text-base w-full h-full tracking-wider"
              />
            </div>
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm">
              {error}
            </motion.p>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full liquid-glass rounded-full px-6 py-3 flex items-center justify-center gap-3 text-[#FDE047] text-base font-medium hover:bg-white/10 transition-all group disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <div className="bg-white rounded-full p-1.5 text-black group-hover:scale-110 transition-transform">
                  <ArrowRight size={16} />
                </div>
              </>
            )}
          </button>
        </form>

        <p className="text-[#FDE047]/60 text-sm leading-relaxed px-4">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[#FDE047] hover:underline font-medium"
          >
            {isLogin ? "Sign up today" : "Log in here"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
