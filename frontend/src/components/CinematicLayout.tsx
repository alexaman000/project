'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Globe, Camera, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function CinematicLayout({ children }: { children: React.ReactNode }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadingOutRef = useRef(false);
  const animationFrameRef = useRef<number>(0);
  
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Video looping and fading logic
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const fade = (startOpacity: number, endOpacity: number, duration: number, callback?: () => void) => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      const startTime = performance.now();
      const currentOpacity = parseFloat(video.style.opacity || "0");
      // Use current opacity if we're interrupting an existing fade
      const actualStart = isNaN(currentOpacity) ? startOpacity : currentOpacity;
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing (easeOutCubic)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const newOpacity = actualStart + (endOpacity - actualStart) * easeProgress;
        
        video.style.opacity = newOpacity.toString();
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else if (callback) {
          callback();
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    const handleLoadedData = () => {
      video.play().catch(() => {});
      fade(0, 1, 500); // Fade in over 500ms
    };

    const handleTimeUpdate = () => {
      if (!video.duration) return;
      const timeRemaining = video.duration - video.currentTime;
      
      // Start fade out 0.55s before end
      if (timeRemaining <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        fade(1, 0, 500);
      }
    };

    const handleEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        fadingOutRef.current = false;
        video.play().catch(() => {});
        fade(0, 1, 500);
      }, 100);
    };

    video.addEventListener('loadeddata', handleLoadedData);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    // Initial state
    video.style.opacity = "0";

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      video.removeEventListener('loadeddata', handleLoadedData);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col relative">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
          style={{ opacity: 0 }}
        />
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-1" />
      </div>



      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center w-full max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
