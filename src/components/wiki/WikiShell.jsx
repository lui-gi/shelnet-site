// src/components/wiki/WikiShell.jsx
// Light-themed three-column shell for /wiki. White canvas filling the space
// between the fixed PromptBar/BottomBar. Sidebar is persistent on desktop and
// behind a hamburger on mobile. ToC slot collapses when null.
import { useState } from 'react';

const WikiShell = ({ sidebar, toc, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasToc = toc != null;
  const desktopGrid = hasToc
    ? 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)_200px]'
    : 'lg:grid lg:grid-cols-[240px_minmax(0,1fr)]';

  return (
    <main className={`bg-white text-neutral-900 font-sans mt-9 mb-9 min-h-[calc(100dvh-4.5rem)] ${desktopGrid}`}>
      {/* Mobile hamburger — only visible <lg */}
      <div className="lg:hidden flex items-center border-b border-neutral-200 px-4 py-2">
        <button
          type="button"
          onClick={() => setSidebarOpen((v) => !v)}
          aria-label="toggle sidebar"
          className="text-neutral-700 hover:text-neutral-900 text-sm font-sans"
        >
          {sidebarOpen ? '✕ close' : '☰ menu'}
        </button>
      </div>

      {/* Sidebar: desktop persistent, mobile overlay when open */}
      <aside
        className={[
          'bg-neutral-50 border-r border-neutral-200',
          'lg:block lg:static lg:h-auto',
          sidebarOpen
            ? 'block fixed inset-x-0 top-9 bottom-9 z-40 overflow-y-auto'
            : 'hidden',
        ].join(' ')}
      >
        <div className="px-4 py-6">{sidebar}</div>
      </aside>

      {/* Article column */}
      <div className="min-w-0">
        <div className="max-w-[720px] mx-auto px-6 py-8 lg:px-8">{children}</div>
      </div>

      {/* ToC column — desktop only, only when ToC provided */}
      {hasToc && (
        <aside className="hidden lg:block border-l border-neutral-200">
          <div className="sticky top-16 px-4 py-8 text-sm">{toc}</div>
        </aside>
      )}
    </main>
  );
};

export default WikiShell;
