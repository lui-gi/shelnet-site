import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30 selection:text-green-200 relative">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <a
              href="/#hero"
              onClick={(e) => {
                e.preventDefault();
                if (location.pathname === '/') {
                  document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#hero';
                }
              }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <img src="/shelnet-v3.svg" alt="Shelnet Logo" className="w-6 h-6" />
              <span className="font-bold text-xl tracking-tighter">SHELNET_</span>
            </a>
          </div>
          <div className="flex gap-8 font-mono text-sm text-white/60">
            {/* Links updated to work from any page */}
            <a href="/#pbqs" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">PBQs</a>
            <a href="/#exams" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Exams</a>
            <a href="/#about" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">About</a>
            <a href="/#connect" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Connect</a>
          </div>
        </div>
      </nav>

      {/* This renders the child route (App.jsx or APlusPBQs.jsx) */}
      <Outlet />
    </div>
  );
};

export default Layout;