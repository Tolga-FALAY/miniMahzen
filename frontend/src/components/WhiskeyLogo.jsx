import React from 'react';

export default function WhiskeyLogo({ size = 28, showGlow = false, className = "" }) {
  return (
    <svg 
      viewBox="0 0 64 64" 
      width={size} 
      height={size} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      className={className}
      style={{ display: 'block' }}
    >
      {showGlow && (
        <circle cx="32" cy="32" r="28" fill="url(#glassGlow)" opacity="0.15"/>
      )}
      
      {/* Liquid (Whiskey) inside straight glass walls */}
      <path 
        d="M14.25,28 C14.25,28 32,30.5 49.75,28 L48.8,44 C48.8,46 38,47.2 32,47.2 C26,47.2 15.2,46 15.2,44 Z" 
        fill="url(#whiskeyGrad)" 
      />
      <ellipse cx="32" cy="28.5" rx="14.5" ry="1.2" fill="rgba(255, 255, 255, 0.25)" />

      {/* Ice Cube 1 (Lower Right, partially submerged) */}
      <g transform="rotate(15 36 34)">
        <rect x="30" y="28" width="13" height="13" rx="2" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.65)" strokeWidth="0.8"/>
        <path d="M31,29 L41,29" stroke="rgba(255,255,255,0.7)" strokeWidth="0.7" strokeLinecap="round"/>
        <path d="M31,29 L31,39" stroke="rgba(255,255,255,0.7)" strokeWidth="0.7" strokeLinecap="round"/>
      </g>

      {/* Ice Cube 2 (Upper Left, floating higher) */}
      <g transform="rotate(-12 25 24)">
        <rect x="18" y="18" width="14" height="14" rx="2.5" fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.75)" strokeWidth="0.8"/>
        <path d="M19.5,19.5 L30.5,19.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.7" strokeLinecap="round"/>
        <path d="M19.5,19.5 L19.5,30.5" stroke="rgba(255,255,255,0.8)" strokeWidth="0.7" strokeLinecap="round"/>
      </g>

      {/* Straight Glass Outlines (Classic Old Fashioned Rocks Glass) */}
      <ellipse cx="32" cy="12" rx="20" ry="2.2" stroke="url(#glassGrad)" strokeWidth="1.5" />
      <path 
        d="M12,12 L12,52 C12,54.5 16,56 32,56 C48,56 52,54.5 52,52 L52,12" 
        stroke="url(#glassGrad)" 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Thick Glass Base sham shading/reflection */}
      <path 
        d="M12.8,44.5 C12.8,44.5 18,48 32,48 C46,48 51.2,44.5 51.2,44.5 C51.2,44.5 50.5,51.5 47,53.5 C43.5,55.2 37,55.5 32,55.5 C27,55.5 20.5,55.2 17,53.5 C13.5,51.5 12.8,44.5 12.8,44.5 Z" 
        fill="rgba(255, 255, 255, 0.18)" 
        stroke="url(#glassGrad)" 
        strokeWidth="0.8"
      />
      
      {/* Left Glass Highlight */}
      <path d="M15,16 L15,42" stroke="rgba(255,255,255,0.65)" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Right Glass Highlight */}
      <path d="M49,18 L49,42" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round"/>

      {/* Liquid Surface Meniscus line */}
      <path d="M14.25,28 C20,30.5 44,30.5 49.75,28" stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.2" strokeLinecap="round"/>

      <defs>
        <linearGradient id="whiskeyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.85"/>
          <stop offset="40%" stopColor="#d97706" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="#78350f" stopOpacity="1"/>
        </linearGradient>
        <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="30%" stopColor="#e2e8f0"/>
          <stop offset="70%" stopColor="#cbd5e1"/>
          <stop offset="100%" stopColor="#94a3b8"/>
        </linearGradient>
        <radialGradient id="glassGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6366f1"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
    </svg>
  );
}
