const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none z-0">
    <div className="w-full h-full opacity-[0.03]"
         style={{
           backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
           backgroundSize: '50px 50px'
         }}>
    </div>
  </div>
);

export default GridBackground;
