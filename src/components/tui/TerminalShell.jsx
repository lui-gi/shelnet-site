// src/components/tui/TerminalShell.jsx
// Thin page wrapper: a centered max-width column with padding that clears the
// fixed top (PromptBar) and bottom (BottomBar) status bars, on the shared
// glow-green background. The terminal chrome (prompt, breadcrumb, exit) now
// lives in the global bars, so this no longer renders a banner or command line.
const TerminalShell = ({ maxWidthClass = 'max-w-4xl', center = false, children }) => (
  <div className={`min-h-screen px-6 pt-12 pb-14 glow-green${center ? ' flex flex-col justify-center' : ''}`}>
    <div className={`mx-auto w-full ${maxWidthClass} font-mono text-sm md:text-base`}>
      {children}
    </div>
  </div>
);

export default TerminalShell;
