import React from 'react';

interface CartAnimateProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const CartAnimate: React.FC<CartAnimateProps> = ({ size = 'md', text }) => {
  const sizeClasses = {
    sm: 'w-24 h-20 sm:w-32 sm:h-24',
    md: 'w-40 h-32 sm:w-56 sm:h-44',
    lg: 'w-56 h-44 sm:w-72 sm:h-56'
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center w-full">
      <style>{`
        :root { --anim-speed: 1.00s; }
        @keyframes wheelRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes legWalkLeft { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(-22deg); } }
        @keyframes legWalkRight { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(22deg); } }
        @keyframes armPush { 0%, 100% { transform: translateX(0px); } 50% { transform: translateX(3px); } }
        @keyframes cartBob { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-2px); } }
        .wheel-part { transform-box: fill-box; transform-origin: center; animation: wheelRotate var(--anim-speed) linear infinite; }
        .leg-left { transform-origin: 97px 150px; animation: legWalkLeft var(--anim-speed) ease-in-out infinite; }
        .leg-right { transform-origin: 97px 150px; animation: legWalkRight var(--anim-speed) ease-in-out infinite; }
        .pusher-arms { animation: armPush var(--anim-speed) ease-in-out infinite; }
        .cart-group { animation: cartBob var(--anim-speed) ease-in-out infinite; }
      `}</style>
      <div className={`transition-all duration-300 mx-auto ${sizeClasses[size]}`}>
        <svg viewBox="0 0 400 280" className="w-full h-full drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]">
          <defs>
            <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1"></stop>
              <stop offset="30%" stopColor="#f8fafc"></stop>
              <stop offset="70%" stopColor="#94a3b8"></stop>
              <stop offset="100%" stopColor="#64748b"></stop>
            </linearGradient>
          </defs>

          <g className="cart-group" transform="translate(30, 10)">
              
              {/* Man Head */}
              <circle cx="95" cy="65" r="13" fill="url(#silverGrad)"></circle>

              {/* Man Torso */}
              <path d="M86 81 C82 81, 79 105, 87 150 L109 150 C117 105, 114 81, 104 81 Z" fill="url(#silverGrad)"></path>

              {/* Pelvis / Waist connector */}
              <rect x="87" y="144" width="22" height="13" rx="4" fill="url(#silverGrad)"></rect>

              {/* Man Arms pushing handle */}
              <g className="pusher-arms">
                  <path d="M96 98 L125 116 L145 112" stroke="url(#silverGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
              </g>

              {/* Man Back Leg */}
              <g className="leg-left">
                  <path d="M97 150 L87 197 L75 242" stroke="url(#silverGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
              </g>

              {/* Man Front Leg */}
              <g className="leg-right">
                  <path d="M97 150 L108 197 L122 242" stroke="url(#silverGrad)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"></path>
              </g>

              {/* V-Shaped Cart & Wheels Intaking Underneath */}
              <g>
                  {/* Handle Bar & Support Rod */}
                  <path d="M140 112 C132 112, 125 119, 125 130 L170 205" stroke="url(#silverGrad)" strokeWidth="8" strokeLinecap="round" fill="none"></path>
                  
                  {/* V-Shaped Container */}
                  <path d="M155 105 L195 105 L250 200 L305 105 L345 105 L275 212 L225 212 Z" fill="url(#silverGrad)"></path>

                  {/* Solid Chassis Base Bar */}
                  <rect x="225" y="212" width="55" height="9" rx="3.5" fill="url(#silverGrad)"></rect>

                  {/* Cart Wheel Mounts / Axles */}
                  <rect x="238" y="221" width="4" height="4" fill="url(#silverGrad)"></rect>
                  <rect x="264" y="221" width="4" height="4" fill="url(#silverGrad)"></rect>

                  {/* Left Wheel */}
                  <g transform="translate(240, 235)">
                      <circle cx="0" cy="0" r="14" fill="url(#silverGrad)"></circle>
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#64748b" strokeWidth="1.5"></circle>
                      <circle cx="0" cy="0" r="5" fill="#0f172a"></circle>
                      <line x1="0" y1="-14" x2="0" y2="14" stroke="#0f172a" strokeWidth="2" className="wheel-part"></line>
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#0f172a" strokeWidth="2" className="wheel-part"></line>
                  </g>

                  {/* Right Wheel */}
                  <g transform="translate(266, 235)">
                      <circle cx="0" cy="0" r="14" fill="url(#silverGrad)"></circle>
                      <circle cx="0" cy="0" r="14" fill="none" stroke="#64748b" strokeWidth="1.5"></circle>
                      <circle cx="0" cy="0" r="5" fill="#0f172a"></circle>
                      <line x1="0" y1="-14" x2="0" y2="14" stroke="#0f172a" strokeWidth="2" className="wheel-part"></line>
                      <line x1="-14" y1="0" x2="14" y2="0" stroke="#0f172a" strokeWidth="2" className="wheel-part"></line>
                  </g>
              </g>

          </g>
        </svg>
      </div>
      {text && <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-3 animate-pulse">{text}</p>}
    </div>
  );
};
