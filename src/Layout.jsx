import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PromptBar from './components/tui/PromptBar';

const Layout = () => {
  const location = useLocation();

  // Scroll to top whenever the route (the open resource) changes.
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-black font-mono text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <PromptBar />
      <Outlet />
    </div>
  );
};

export default Layout;
