import { useRef, useState } from 'react';

/**
 * React Bits - MagnetButton
 * Creates an elastic magnetic attraction pulling towards the cursor on hover
 */
export default function MagnetButton({
  children,
  className = '',
  magnetStrength = 0.25,
  onClick,
  ...props
}) {
  const buttonRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * magnetStrength;
    const deltaY = (e.clientY - centerY) * magnetStrength;

    setOffset({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setOffset({ x: 0, y: 0 });
  };

  return (
    <div
      ref={buttonRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
        transition:
          offset.x === 0 && offset.y === 0
            ? 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            : 'transform 0.1s ease-out',
      }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
