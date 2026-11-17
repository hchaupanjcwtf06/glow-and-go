/**
 * React Bits - ShinyText
 * Creates an elegant, continuous light sweep shimmer across text
 */
export default function ShinyText({
  text,
  disabled = false,
  speed = 4,
  className = '',
}) {
  if (disabled) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span
      className={`inline-block bg-clip-text text-transparent ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(120deg, rgba(225, 29, 72, 0.85) 0%, rgba(244, 63, 94, 1) 20%, rgba(255, 255, 255, 0.95) 50%, rgba(244, 63, 94, 1) 80%, rgba(245, 158, 11, 0.9) 100%)',
        backgroundSize: '200% auto',
        animation: `shiny-sweep ${speed}s linear infinite`,
      }}
    >
      {text}
    </span>
  );
}
