const SpinningKey = () => {
  return (
    <div className="relative perspective-1000">
      {/* Container for 3D perspective */}
      <div className="spinning-key-container">
        <pre className="spinning-key text-purple-400 font-mono text-lg leading-tight select-none">
{`     _          _            _
 ___| |__   ___| |_ __   ___| |_
/ __| '_ \\ / _ \\ | '_ \\ / _ \\ __|
\\__ \\ | | |  __/ | | | |  __/ |_
|___/_| |_|\\___|_|_| |_|\\___|\\___|`}
        </pre>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .spinning-key-container {
          display: inline-block;
          animation: spin 10s linear infinite;
          transform-style: preserve-3d;
        }

        .spinning-key {
          margin: 0;
          text-shadow:
            0 0 10px rgba(168, 85, 247, 0.8),
            0 0 20px rgba(168, 85, 247, 0.6),
            0 0 30px rgba(168, 85, 247, 0.4);
          animation: pulse-glow 2s ease-in-out infinite;
          will-change: transform, text-shadow;
        }

        @keyframes spin {
          from {
            transform: rotateY(0deg);
          }
          to {
            transform: rotateY(360deg);
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            text-shadow:
              0 0 10px rgba(168, 85, 247, 0.8),
              0 0 20px rgba(168, 85, 247, 0.6),
              0 0 30px rgba(168, 85, 247, 0.4);
          }
          50% {
            text-shadow:
              0 0 20px rgba(168, 85, 247, 1),
              0 0 30px rgba(168, 85, 247, 0.8),
              0 0 40px rgba(168, 85, 247, 0.6),
              0 0 50px rgba(168, 85, 247, 0.4);
          }
        }

        /* Accessibility: Respect user's motion preferences */
        @media (prefers-reduced-motion: reduce) {
          .spinning-key-container {
            animation: none;
          }
          .spinning-key {
            animation: pulse-glow 3s ease-in-out infinite;
          }
        }

        /* Responsive: Scale down on smaller screens */
        @media (max-width: 640px) {
          .spinning-key {
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SpinningKey;
