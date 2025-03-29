// src/pages/Index.tsx
import React, { useEffect, useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";

const Index = () => {
  const [mounted, setMounted] = useState(false);
  
  // Animation on component mount
  useEffect(() => {
    setMounted(true);
    
    // Add viewport height fix for mobile
    const setVhProperty = () => {
      // First we get the viewport height and we multiply it by 1% to get a value for a vh unit
      const vh = window.innerHeight * 0.01;
      // Then we set the value in the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    
    // Set the value initially and on resize
    setVhProperty();
    window.addEventListener('resize', setVhProperty);
    window.addEventListener('orientationchange', setVhProperty);
    
    return () => {
      window.removeEventListener('resize', setVhProperty);
      window.removeEventListener('orientationchange', setVhProperty);
    };
  }, []);

  return (
    <div className="main-container flex flex-col min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black overflow-x-hidden">
      {/* Fixed header - only visible on larger screens */}
      <header className="fixed-header px-0 hidden sm:flex justify-center items-center">
        <div className={`flex items-center space-x-1 bg-zinc-800/50 px-3 py-4 rounded-full backdrop-blur-sm border border-zinc-700/50 shadow-lg transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0 -translate-y-4'}`}>
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span className="text-xs font-medium text-purple-400">TableChat Experience</span>
        </div>
      </header>
      
      {/* Scrollable content container */}
      <div className="content-container flex-1 flex items-start justify-center relative overflow-y-auto py-4 safe-area-inset">
        {/* Background elements */}
        <div className="ambient-effect fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Top right glow */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full filter blur-3xl"></div>
          
          {/* Bottom left glow */}
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full filter blur-3xl"></div>
          
          {/* Center ambient glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/5 rounded-full filter blur-3xl animate-pulse-slow"></div>
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Floating particles for decoration */}
          {mounted && Array(8).fill(0).map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-purple-300/10 animate-float-slow"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 10 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>
        
        {/* Main content with scrollable container */}
        <div className={`w-full max-w-md mx-auto z-10 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <BarcodeScanner />
        </div>
      </div>
      
      {/* Fixed footer - visually subtle */}
      <footer className="fixed-footer pb-safe py-0 px-0 mx-0 hidden sm:flex justify-center items-center">
        <div className={`text-xs text-zinc-600 transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
        <p className="my-4 mx-0 px-0 text-purple-400/70">Powered by TableChat AI • © 2025</p>
        </div>
      </footer>
    </div>
  );
};

// Don't forget to import Sparkles
import { Sparkles } from 'lucide-react';

export default Index;