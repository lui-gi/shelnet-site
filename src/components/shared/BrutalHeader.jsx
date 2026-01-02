const BrutalHeader = ({ title, subtitle, counter, id }) => (
  <div className="flex items-end justify-between mb-12 md:mb-16 border-b border-white/10 pb-6">
    <div>
      <h2 className="text-4xl md:text-6xl font-bold text-white mb-2 tracking-tight uppercase" style={{ fontFamily: 'Helvetica Neue, sans-serif' }}>
        {title}
      </h2>
      <div className="text-xs text-white/40 uppercase tracking-widest font-mono">
        {subtitle}
      </div>
    </div>
    <div className="text-right hidden md:block">
      <div className="text-2xl font-bold text-white font-mono">
        {counter}
      </div>
      <div className="text-xs text-white/40 uppercase tracking-widest">
        {id}
      </div>
    </div>
  </div>
);

export default BrutalHeader;
