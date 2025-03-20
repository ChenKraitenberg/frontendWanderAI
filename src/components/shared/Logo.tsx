//import React from 'react';

const Logo = () => {
  return (
    <div className="flex flex-col items-center text-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 120" className="w-64 h-auto max-w-full" width="300" height="120">
        <defs>
          <linearGradient id="mainGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4158D0' }} />
            <stop offset="46%" style={{ stopColor: '#C850C0' }} />
            <stop offset="100%" style={{ stopColor: '#FFCC70' }} />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#4158D0' }} />
            <stop offset="100%" style={{ stopColor: '#C850C0' }} />
          </linearGradient>
        </defs>

        {/* Icon Group with Improved Design */}
        <g transform="translate(20, 25)">
          {/* Mountains with More Detailed Path */}
          <path d="M0 45 L20 15 L40 45 L60 20 L80 45" fill="none" stroke="url(#mainGradient)" strokeWidth="3" strokeLinecap="round" />
          {/* Enhanced Heart Shape */}
          <path
            d="M40 35 
               C40 28, 34 22, 27 22 
               C20 22, 14 28, 14 35 
               C14 48, 40 55, 40 55 
               C40 55, 66 48, 66 35 
               C66 28, 60 22, 53 22 
               C46 22, 40 28, 40 35Z"
            fill="url(#mainGradient)"
            opacity="0.5"
          />
        </g>

        {/* Main Text with Enhanced Typography */}
        <text x="120" y="70" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="32">
          <tspan fill="url(#textGradient)">Wander</tspan>
          <tspan fill="#C850C0" fontSize="26" fontWeight="bold">
            AI
          </tspan>
        </text>
      </svg>
    </div>
  );
};

export default Logo;
