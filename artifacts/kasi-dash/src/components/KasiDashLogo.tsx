interface KasiDashLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function KasiDashLogo({ className = "", size = "md" }: KasiDashLogoProps) {
  const scale = size === "sm" ? 0.7 : size === "lg" ? 1.4 : 1;
  const width = Math.round(160 * scale);
  const height = Math.round(64 * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Kasi Dash"
    >
      <defs>
        <linearGradient id="flameGrad" x1="80" y1="0" x2="80" y2="22" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="60%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="textGrad" x1="0" y1="0" x2="160" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Flame / Energy Icon — centered above text */}
      <g filter="url(#glow)" transform="translate(66, 0)">
        {/* Left outer flame */}
        <path
          d="M14 18 C10 14 6 10 8 4 C5 7 3 11 5 16 C3 14 2 11 3 7 C0 11 1 17 5 20 C3 19 2 17 3 15 C4 20 8 22 14 20Z"
          fill="url(#flameGrad)"
          opacity="0.9"
        />
        {/* Right outer flame */}
        <path
          d="M14 18 C18 14 22 10 20 4 C23 7 25 11 23 16 C25 14 26 11 25 7 C28 11 27 17 23 20 C25 19 26 17 25 15 C24 20 20 22 14 20Z"
          fill="url(#flameGrad)"
          opacity="0.9"
        />
        {/* Center flame */}
        <path
          d="M14 22 C12 17 10 13 12 8 C13 11 14 13 14 13 C14 13 15 11 16 8 C18 13 16 17 14 22Z"
          fill="#FFD700"
        />
        {/* Left orb */}
        <circle cx="9" cy="17" r="3.5" fill="#D4AF37" opacity="0.85" />
        <circle cx="9" cy="17" r="2" fill="#FFE55C" opacity="0.6" />
        {/* Right orb */}
        <circle cx="19" cy="17" r="3.5" fill="#D4AF37" opacity="0.85" />
        <circle cx="19" cy="17" r="2" fill="#FFE55C" opacity="0.6" />
      </g>

      {/* Upper swoosh — thin arc above text */}
      <path
        d="M18 30 Q80 25 142 30"
        stroke="#D4AF37"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
      />

      {/* "Kasi Dash" text */}
      <text
        x="80"
        y="48"
        textAnchor="middle"
        fontFamily="'Georgia', 'Times New Roman', serif"
        fontStyle="italic"
        fontWeight="700"
        fontSize="22"
        fill="url(#textGrad)"
        filter="url(#glow)"
        letterSpacing="1"
      >
        Kasi Dash
      </text>

      {/* Lower swoosh — bolder arc below text */}
      <path
        d="M22 56 Q80 63 138 56"
        stroke="#D4AF37"
        strokeWidth="1.5"
        fill="none"
        opacity="0.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
