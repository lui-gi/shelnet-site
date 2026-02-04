import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => { document.documentElement.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

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
          <div className="hidden md:flex gap-8 font-mono text-sm text-white/60">
            {/* Links updated to work from any page */}
            <a href="/#pbqs" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">PBQs</a>
            <a href="/#exams" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Exams</a>
            <a href="/#visualizations" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Visualizations</a>
            <a href="/#labs" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Labs</a>
            <a href="/#notes" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Notes</a>
            <a href="/#about" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">About</a>
            <a href="/#connect" className="hover:text-white transition-colors hover:underline decoration-green-500 underline-offset-4">Connect</a>
          </div>

          {/* Hamburger menu button - mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-white hover:text-green-500 transition-colors p-2"
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`md:hidden fixed left-0 right-0 bg-black/95 border-b border-white/10 z-40 overflow-hidden transition-all duration-300 ${
          scrolled ? 'top-[72px]' : 'top-[84px]'
        } ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        <div className="flex flex-col">
          <a
            href="/#pbqs"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            PBQs
          </a>
          <a
            href="/#exams"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            Exams
          </a>
          <a
            href="/#visualizations"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            Visualizations
          </a>
          <a
            href="/#labs"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            Labs
          </a>
          <a
            href="/#notes"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            Notes
          </a>
          <a
            href="/#about"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors border-b border-white/5 font-mono text-sm"
          >
            About
          </a>
          <a
            href="/#connect"
            onClick={() => setIsMenuOpen(false)}
            className="block w-full py-4 px-6 text-white/60 hover:text-white hover:bg-white/5 transition-colors font-mono text-sm"
          >
            Connect
          </a>
        </div>
      </div>

      {/* This renders the child route (App.jsx or APlusPBQs.jsx) */}
      <Outlet />
    </div>
  );
};

export default Layout;