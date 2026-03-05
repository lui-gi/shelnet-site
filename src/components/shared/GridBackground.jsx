import { useId } from 'react';

const GridBackground = () => {
  const uid = useId();
  const filterId = `noise-${uid.replace(/:/g, '')}`;
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none z-0"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id={filterId}>
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter={`url(#${filterId})`}/>
    </svg>
  );
};

export default GridBackground;
