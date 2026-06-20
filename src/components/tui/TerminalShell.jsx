// src/components/tui/TerminalShell.jsx
// Thin page wrapper: a centered max-width column with padding that clears the
// fixed top (PromptBar) and bottom (BottomBar) status bars, on the shared
// glow-green background. The terminal chrome (prompt, breadcrumb, exit) now
// lives in the global bars, so this no longer renders a banner or command line.
const TerminalShell = ({ maxWidthClass = 'max-w-4xl', center = false, fill = false, children }) => {
  if (fill) {
    // Screen-filling app pane: fixed height between the global bars, no width
    // cap. The inner region is a flex column so a `flex-1` child fills it.
    return (
      <div className="h-[100dvh] px-6 pt-10 pb-10 glow-green flex flex-col">
        <div className="flex-1 min-h-0 w-full font-mono text-sm md:text-base flex flex-col">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={`min-h-screen px-6 pt-12 pb-14 glow-green${center ? ' flex flex-col justify-center' : ''}`}>
      <div className={`mx-auto w-full ${maxWidthClass} font-mono text-sm md:text-base`}>
        {children}
      </div>
    </div>
  );
};

export default TerminalShell;
