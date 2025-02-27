// src/components/shared/LogoSmall.tsx
import React from 'react';

const LogoSmall = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60" className="w-8 h-8">
      {/* רק האייקון בלי הטקסט */}
      <defs>
        <linearGradient id="gradientSmall" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: '#4158D0' }} />
          <stop offset="46%" style={{ stopColor: '#C850C0' }} />
          <stop offset="100%" style={{ stopColor: '#FFCC70' }} />
        </linearGradient>
      </defs>
      <g transform="translate(0, 0)">
        <path d="M0 35 L15 10 L30 35 L45 15 L60 35" fill="none" stroke="url(#gradientSmall)" strokeWidth="3" strokeLinecap="round" />
        <path d="M22 25 C22 20, 18 15, 13 15 C8 15, 4 20, 4 25 C4 35, 22 40, 22 40 C22 40, 40 35, 40 25 C40 20, 36 15, 31 15 C26 15, 22 20, 22 25Z" fill="url(#gradientSmall)" opacity="0.3" />
      </g>
    </svg>
  );
};

export default LogoSmall;
