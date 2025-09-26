import React from 'react';

const Logo = ({ className = "w-8 h-8" }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="professionalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
        <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#1e40af" floodOpacity="0.15"/>
        </filter>
      </defs>
      
      {/* Professional Medical Shield */}
      <path 
        d="M20 4L8 8v10c0 9 12 16 12 16s12-7 12-16V8L20 4z" 
        fill="url(#professionalGradient)"
        filter="url(#dropshadow)"
      />
      
      {/* Clean Medical Cross */}
      <g fill="white">
        <rect x="18" y="12" width="4" height="16" rx="1" />
        <rect x="12" y="18" width="16" height="4" rx="1" />
      </g>
      
      {/* Medical Caduceus Accents */}
      <g stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none">
        <path d="M28 10c1 0 2 1 2 2s-1 2-2 2" />
        <path d="M32 14c-1 0-2 1-2 2s1 2 2 2" />
      </g>
      
      {/* Professional Dots */}
      <circle cx="33" cy="8" r="1.5" fill="#10b981" opacity="0.8" />
      <circle cx="35" cy="6" r="1" fill="#10b981" opacity="0.6" />
      <circle cx="37" cy="8" r="1.2" fill="#10b981" opacity="0.7" />
    </svg>
  );
};

export default Logo;