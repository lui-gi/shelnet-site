import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-green-500/30 selection:text-green-200 relative">
      {/* NAVBAR */}
      <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${scrolled ? 'bg-black/90 backdrop-blur-md border-white/10 py-4' : 'bg-transparent border-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* Barcode SVG */}
            <svg width="100" height="24" viewBox="0 0 140 30" className="opacity-80 fill-white hidden md:block">
              <rect x="0" y="0" width="2" height="30" />
              <rect x="4" y="0" width="1" height="30" />
              <rect x="7" y="0" width="3" height="30" />
              <rect x="15" y="0" width="2" height="30" />
              <rect x="22" y="0" width="4" height="30" />
              <rect x="31" y="0" width="2" height="30" />
              <rect x="38" y="0" width="3" height="30" />
              <rect x="46" y="0" width="2" height="30" />
              <rect x="53" y="0" width="4" height="30" />
              <rect x="62" y="0" width="2" height="30" />
              <rect x="74" y="0" width="2" height="30" />
              <rect x="81" y="0" width="3" height="30" />
              <rect x="93" y="0" width="4" height="30" />
              <rect x="102" y="0" width="2" height="30" />
              <rect x="117" y="0" width="2" height="30" />
              <rect x="124" y="0" width="4" height="30" />
            </svg>
            <Link to="/" className="font-bold text-xl tracking-tighter">SHELNET_</Link>
          </div>
          <div className="flex gap-8 font-mono text-sm text-white/60">
            {/* Links updated to work from any page */}
            <a href="/#pbqs" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">PBQs</a>
            <a href="/#exams" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Exams</a>
            <a href="/#about" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">About</a>
          </div>
        </div>
      </nav>

      {/* This renders the child route (App.jsx or APlusPBQs.jsx) */}
      <Outlet />
    </div>
  );
};

export default Layout;