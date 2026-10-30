import React from 'react';

/**
 * Faint game-themed background icons for the main hub.
 * Crisp SVG icons (cards, dice, controllers, magnifying glasses, crowns) with subtle low opacity
 * providing an atmospheric 'Gen Z' gaming hub vibe without visual clutter.
 */
export default function FaintGameBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.14,
      }}
    >
      {/* 1. Ace of Spades Top-Left */}
      <svg
        width="110"
        height="110"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ position: 'absolute', top: '40px', left: '3%', transform: 'rotate(-15deg)', color: '#38bdf8' }}
      >
        <path d="M12 2C9 7 4 11 4 15c0 3.3 2.7 6 6 6 1.4 0 2-.6 2-1.5 0 .9.6 1.5 2 1.5 3.3 0 6-2.7 6-6 0-4-5-8-8-13z" />
      </svg>

      {/* 2. Dice Top-Right */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ position: 'absolute', top: '80px', right: '4%', transform: 'rotate(22deg)', color: '#10b981' }}
      >
        <rect width="18" height="18" x="3" y="3" rx="4" />
        <path d="M16 8h.01M8 8h.01M12 12h.01M16 16h.01M8 16h.01" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* 3. Gamepad Center-Left */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ position: 'absolute', top: '420px', left: '1%', transform: 'rotate(10deg)', color: '#8b5cf6' }}
      >
        <line x1="6" x2="10" y1="12" y2="12" />
        <line x1="8" x2="8" y1="10" y2="14" />
        <line x1="15" x2="15.01" y1="13" y2="13" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="18" x2="18.01" y1="11" y2="11" strokeWidth="2.5" strokeLinecap="round" />
        <rect width="20" height="12" x="2" y="6" rx="6" />
      </svg>

      {/* 4. Heart Suit Center-Right */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ position: 'absolute', top: '560px', right: '3%', transform: 'rotate(-12deg)', color: '#f43f5e' }}
      >
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>

      {/* 5. Detective Magnifying Glass Mid-Bottom Left */}
      <svg
        width="130"
        height="130"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ position: 'absolute', top: '880px', left: '4%', transform: 'rotate(-25deg)', color: '#06b6d4' }}
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" strokeWidth="2.5" strokeLinecap="round" />
      </svg>

      {/* 6. Crown Bottom-Right */}
      <svg
        width="120"
        height="120"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        style={{ position: 'absolute', top: '1020px', right: '5%', transform: 'rotate(15deg)', color: '#f59e0b' }}
      >
        <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.735H5.81a1 1 0 0 1-.957-.735L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
        <path d="M5 21h14" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* 7. Club Suit Bottom-Center */}
      <svg
        width="95"
        height="95"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ position: 'absolute', top: '1380px', left: '10%', transform: 'rotate(18deg)', color: '#10b981' }}
      >
        <path d="M12 2a4 4 0 0 0-4 4c0 1.1.5 2.1 1.2 2.8A4 4 0 0 0 6 12a4 4 0 0 0 4 4h1v3H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-3h1a4 4 0 0 0 4-4 4 4 0 0 0-3.2-3.2c.7-.7 1.2-1.7 1.2-2.8a4 4 0 0 0-4-4z" />
      </svg>

      {/* 8. Diamond Suit Mid-Center */}
      <svg
        width="100"
        height="100"
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ position: 'absolute', top: '1240px', right: '12%', transform: 'rotate(-8deg)', color: '#f43f5e' }}
      >
        <path d="M12 2 2 12l10 10 10-10Z" />
      </svg>
    </div>
  );
}

