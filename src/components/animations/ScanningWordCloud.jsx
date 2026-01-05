const words = [
  // Row 1 (y: 10-15%)
  { text: 'FIREWALL', x: 8, y: 12, size: 0.75 },
  { text: 'encryption', x: 25, y: 10, size: 0.45 },
  { text: 'MALWARE', x: 45, y: 14, size: 0.65 },
  { text: 'phishing', x: 68, y: 11, size: 0.42 },
  { text: 'ZERO-DAY', x: 85, y: 15, size: 0.55 },

  // Row 2 (y: 25-30%)
  { text: 'VPN', x: 5, y: 27, size: 0.9 },
  { text: 'authentication', x: 18, y: 30, size: 0.37 },
  { text: 'BREACH', x: 38, y: 26, size: 0.7 },
  { text: 'SSL/TLS', x: 58, y: 29, size: 0.47 },
  { text: 'RANSOMWARE', x: 78, y: 28, size: 0.6 },

  // Row 3 (y: 40-45%)
  { text: 'backdoor', x: 10, y: 43, size: 0.4 },
  { text: 'EXPLOIT', x: 28, y: 45, size: 0.8 },
  { text: 'hashing', x: 50, y: 41, size: 0.45 },
  { text: 'INTRUSION', x: 70, y: 44, size: 0.62 },
  { text: 'botnet', x: 88, y: 42, size: 0.42 },

  // Row 4 (y: 55-60%)
  { text: 'VULNERABILITY', x: 15, y: 58, size: 0.55 },
  { text: 'packet', x: 35, y: 60, size: 0.37 },
  { text: 'SANDBOX', x: 52, y: 56, size: 0.7 },
  { text: 'rootkit', x: 72, y: 59, size: 0.47 },
  { text: 'DDoS', x: 90, y: 57, size: 0.75 },

  // Row 5 (y: 70-75%)
  { text: 'MITM', x: 8, y: 73, size: 0.65 },
  { text: 'keylogger', x: 25, y: 71, size: 0.4 },
  { text: 'FORENSICS', x: 45, y: 75, size: 0.6 },
  { text: 'payload', x: 65, y: 72, size: 0.45 },
  { text: 'APT', x: 82, y: 74, size: 0.8 },

  // Row 6 (y: 85-90%)
  { text: 'CIPHER', x: 12, y: 88, size: 0.55 },
  { text: 'privilege escalation', x: 35, y: 86, size: 0.37 },
  { text: 'THREAT INTEL', x: 68, y: 90, size: 0.5 },
];

const ScanningWordCloud = () => {
  return (
    <div className="relative w-full h-[200px] overflow-hidden">
      {/* Scan Line */}
      <div className="scan-line absolute top-0 bottom-0 w-[3px] z-20" />

      {/* Word Cloud */}
      <div className="absolute inset-0">
        {words.map((word, idx) => (
          <span
            key={idx}
            className="word absolute font-mono font-bold text-purple-400"
            style={{
              left: `${word.x}%`,
              top: `${word.y}%`,
              fontSize: `${word.size}rem`,
              animationDelay: `${(word.x / 100) * 3}s`,
            }}
          >
            {word.text}
          </span>
        ))}
      </div>

      <style>{`
        /* Scan line moves left to right every 3 seconds */
        @keyframes scan {
          0% {
            left: -3px;
          }
          100% {
            left: 100%;
          }
        }

        /* Word reveal: opacity 0.15 → 1.0 → 0.15 with purple glow */
        @keyframes wordReveal {
          0% {
            opacity: 0.15;
          }
          5% {
            opacity: 1;
            text-shadow:
              0 0 10px rgba(168, 85, 247, 0.9),
              0 0 20px rgba(168, 85, 247, 0.6);
          }
          21.7% {
            opacity: 1;
            text-shadow:
              0 0 10px rgba(168, 85, 247, 0.9),
              0 0 20px rgba(168, 85, 247, 0.6);
          }
          26.7% {
            opacity: 0.15;
            text-shadow: none;
          }
          100% {
            opacity: 0.15;
          }
        }

        /* Scan line pulse effect */
        @keyframes scanPulse {
          0%, 100% {
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.7);
          }
          50% {
            box-shadow: 0 0 12px rgba(168, 85, 247, 0.9);
          }
        }

        /* Scan line styling */
        .scan-line {
          background: rgba(168, 85, 247, 0.9);
          animation:
            scan 3s linear infinite,
            scanPulse 1.5s ease-in-out infinite;
          will-change: transform;
          pointer-events: none;
        }

        /* Word styling */
        .word {
          opacity: 0.15;
          white-space: nowrap;
          user-select: none;
          animation: wordReveal 3s linear infinite;
          will-change: opacity;
          transform: translateZ(0);
          transition: none;
        }

        /* Accessibility: Reduced motion support */
        @media (prefers-reduced-motion: reduce) {
          .scan-line {
            animation: scanPulse 3s ease-in-out infinite;
            left: 50%;
          }
          .word {
            animation: none;
            opacity: 0.6;
          }
        }

        /* Responsive: Scale down on mobile */
        @media (max-width: 640px) {
          .word {
            font-size: calc(var(--word-size) * 0.75);
          }
        }
      `}</style>
    </div>
  );
};

export default ScanningWordCloud;
