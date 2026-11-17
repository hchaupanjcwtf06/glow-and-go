import { useState, useEffect } from 'react';

/**
 * React Bits - ClickSpark
 * Emits vibrant sparkling stars and particles on user clicks
 */
export default function ClickSpark({ children }) {
  const [sparks, setSparks] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      // Don't trigger on text inputs or select elements to avoid interference
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const sparkCount = 6;
      const symbols = ['✨', '💖', '⭐', '🌸', '✦'];
      const newSparks = Array.from({ length: sparkCount }).map((_, i) => {
        const angle = (i / sparkCount) * Math.PI * 2 + Math.random() * 0.5;
        const velocity = 25 + Math.random() * 35;
        return {
          id: `${Date.now()}-${i}-${Math.random()}`,
          x: e.clientX,
          y: e.clientY,
          dx: Math.cos(angle) * velocity,
          dy: Math.sin(angle) * velocity,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          size: 14 + Math.random() * 8,
        };
      });

      setSparks((prev) => [...prev.slice(-18), ...newSparks]);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Auto clean-up finished particles
  useEffect(() => {
    if (sparks.length === 0) return;
    const timer = setTimeout(() => {
      setSparks([]);
    }, 700);
    return () => clearTimeout(timer);
  }, [sparks]);

  return (
    <>
      {children}
      {/* Floating Sparkles Layer */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {sparks.map((s) => (
          <span
            key={s.id}
            className="absolute select-none animate-spark-burst"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              fontSize: `${s.size}px`,
              '--dx': `${s.dx}px`,
              '--dy': `${s.dy}px`,
            }}
          >
            {s.symbol}
          </span>
        ))}
      </div>
    </>
  );
}
