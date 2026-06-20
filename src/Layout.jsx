import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const NAV = [
  { label: 'resources', href: '/#resources', id: 'resources' },
  { label: 'about',     href: '/#about',     id: 'about' },
  { label: 'connect',   href: '/#connect',   id: 'connect' },
];

const Layout = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  useEffect(() => {
    // Reset mobile drawer on navigation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.documentElement.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => { document.documentElement.style.overflow = ''; };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) setIsMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const goHome = (e) => {
    e.preventDefault();
    if (location.pathname === '/') {
      document.getElementById('hero')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/#hero';
    }
  };

  return (
    <div className="relative min-h-screen bg-black font-mono text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* NAVBAR */}
      <nav className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-300 ${scrolled ? 'border-white/10 bg-black/85 py-3 backdrop-blur-md' : 'border-transparent bg-transparent py-4'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="/#hero" onClick={goHome}
             className="text-lg font-bold lowercase tracking-tight transition-colors"
             style={{ color: '#43c08c', textShadow: '0 0 8px rgba(52,211,153,.3)' }}>
            shelnet_
          </a>

          <div className="hidden gap-8 text-sm text-white/55 md:flex">
            {NAV.map((item) => (
              <a key={item.id} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </div>

          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="px-2 text-xl leading-none text-white/70 transition-colors hover:text-emerald-400 md:hidden"
            aria-label="Toggle navigation menu" aria-expanded={isMenuOpen}>
            {isMenuOpen ? '✕' : '≡'}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`fixed left-0 right-0 z-40 overflow-hidden border-b border-white/10 bg-black/95 transition-all duration-300 md:hidden ${scrolled ? 'top-[52px]' : 'top-[60px]'} ${isMenuOpen ? 'max-h-96' : 'max-h-0'}`}>
        <div className="flex flex-col py-2 text-sm">
          {NAV.map((item) => (
            <a key={item.id} href={item.href} onClick={() => setIsMenuOpen(false)}
               className="flex items-center gap-2 px-6 py-3 text-white/60 transition-colors hover:bg-white/5 hover:text-white">
              <span style={{ color: '#43c08c' }}>&gt;</span>{item.label}
            </a>
          ))}
          <div className="border-t border-white/10 px-6 py-3 text-xs text-white/35">guest@tty3</div>
        </div>
      </div>

      <Outlet />
    </div>
  );
};

export default Layout;
