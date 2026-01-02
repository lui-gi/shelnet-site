const BrutalHeader = ({ title, subtitle }) => (
  <div className="mb-12 md:mb-16 border-b border-white/10 pb-6">
    <div>
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight uppercase" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
        {title}
      </h2>
      <div className="text-xs text-white/40 uppercase tracking-widest font-mono">
        {subtitle}
      </div>
    </div>
  </div>
);

export default BrutalHeader;
