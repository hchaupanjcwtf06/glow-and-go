/**
 * React Bits - AuroraBackground
 * Renders ethereal, fluid, glowing light orbs in pastel skincare tones
 * (Rose Quartz, Champagne Peach, Soft Lavender, Hydrating Aqua)
 */
export default function AuroraBackground({ children, className = '' }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      {/* Aurora glowing light layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Glow Orb 1 - Rose Pink */}
        <div
          className="absolute -top-[10%] left-[15%] w-[38rem] h-[38rem] rounded-full opacity-40 blur-[110px]"
          style={{
            background:
              'radial-gradient(circle, rgba(251, 113, 133, 0.45) 0%, rgba(244, 63, 94, 0.25) 50%, transparent 75%)',
            animation: 'aurora-float-1 18s ease-in-out infinite alternate',
          }}
        />

        {/* Glow Orb 2 - Soft Lavender/Purple */}
        <div
          className="absolute top-[25%] -right-[5%] w-[42rem] h-[42rem] rounded-full opacity-35 blur-[120px]"
          style={{
            background:
              'radial-gradient(circle, rgba(192, 132, 252, 0.4) 0%, rgba(236, 72, 153, 0.2) 50%, transparent 75%)',
            animation: 'aurora-float-2 22s ease-in-out infinite alternate',
          }}
        />

        {/* Glow Orb 3 - Warm Champagne / Amber Glow */}
        <div
          className="absolute bottom-[10%] left-[5%] w-[32rem] h-[32rem] rounded-full opacity-30 blur-[100px]"
          style={{
            background:
              'radial-gradient(circle, rgba(253, 186, 116, 0.45) 0%, rgba(251, 146, 60, 0.2) 50%, transparent 75%)',
            animation: 'aurora-float-3 20s ease-in-out infinite alternate',
          }}
        />

        {/* Glow Orb 4 - Dewy Hydration Aqua/Teal */}
        <div
          className="absolute top-[50%] left-[40%] w-[30rem] h-[30rem] rounded-full opacity-25 blur-[105px]"
          style={{
            background:
              'radial-gradient(circle, rgba(94, 234, 212, 0.35) 0%, rgba(45, 212, 191, 0.15) 50%, transparent 75%)',
            animation: 'aurora-float-4 25s ease-in-out infinite alternate',
          }}
        />
      </div>

      {children}
    </div>
  );
}
