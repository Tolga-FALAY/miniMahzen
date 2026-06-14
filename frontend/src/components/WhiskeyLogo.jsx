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
      
      {/* Liquid (Whiskey) */}
      <path 
        d="M19.5,32 C19.5,32 32,35 44.5,32 L42,50 C42,52 38,53.5 32,53.5 C26,53.5 22,52 22,50 Z" 
        fill="url(#whiskeyGrad)" 
      />
      <ellipse cx="32" cy="32.5" rx="12.5" ry="1.5" fill="rgba(255, 255, 255, 0.3)" />

      {/* Ice Cube 1 (Lower Right, partially submerged) */}
      <g transform="rotate(12 34 36)">
        <rect x="29" y="31" width="10" height="10" rx="2" fill="rgba(255, 255, 255, 0.2)" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="1"/>
        <path d="M30,32 L38,32" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M30,32 L30,40" stroke="rgba(255,255,255,0.8)" strokeWidth="0.8" strokeLinecap="round"/>
      </g>

      {/* Ice Cube 2 (Upper Left, floating higher) */}
      <g transform="rotate(-15 26 28)">
        <rect x="21" y="23" width="11" height="11" rx="2" fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.7)" strokeWidth="1"/>
        <path d="M22,24 L31,24" stroke="rgba(255,255,255,0.85)" strokeWidth="0.8" strokeLinecap="round"/>
        <path d="M22,24 L22,33" stroke="rgba(255,255,255,0.85)" strokeWidth="0.8" strokeLinecap="round"/>
      </g>

      {/* Glass Tumbler Outlines & Shading */}
      <ellipse cx="32" cy="14" rx="16" ry="2" stroke="url(#glassGrad)" strokeWidth="1.5" />
      <path 
        d="M16,14 C16,14 18,48 20,51 C21.5,53.5 25,55 32,55 C39,55 42.5,53.5 44,51 C46,48 48,14 48,14" 
        stroke="url(#glassGrad)" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Thick Glass Base highlight */}
      <path 
        d="M20.8,47 C20.8,47 25,50.5 32,50.5 C39,50.5 43.2,47 43.2,47 C43.2,47 42.5,52 41,53.2 C39.5,54.2 36,54.5 32,54.5 C28,54.5 24.5,54.2 23,53.2 C21.5,52 20.8,47 20.8,47 Z" 
        fill="rgba(255, 255, 255, 0.15)" 
        stroke="url(#glassGrad)" 
        strokeWidth="0.8"
      />
      
      {/* Left Glass Highlight */}
      <path d="M18.5,18 C18.5,18 20.5,38 21,48" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" strokeLinecap="round"/>
      
      {/* Right Glass Highlight */}
      <path d="M45.5,20 C45.5,20 43.8,36 43,46" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" strokeLinecap="round"/>

      {/* Liquid Surface line */}
      <path d="M19.5,32 C25,33.5 39,33.5 44.5,32" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="1" strokeLinecap="round"/>

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
