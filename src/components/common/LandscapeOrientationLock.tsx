import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, Monitor, AlertCircle, Sparkles } from 'lucide-react';

export interface LandscapeOrientationLockProps {
  children: React.ReactNode;
  gameTitle?: string;
}

export default function LandscapeOrientationLock({
  children,
  gameTitle = 'Fun With Dost Yaar Game',
}: LandscapeOrientationLockProps) {
  const [isPortraitMobile, setIsPortraitMobile] = useState(false);
  const [bypassed, setBypassed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (typeof window === 'undefined') return;

      // Mobile or tablet device detection (width under 960px and portrait aspect ratio)
      const isNarrow = window.innerWidth <= 960;
      const isPortrait = window.innerHeight > window.innerWidth;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Enforce landscape when in portrait mode on mobile/tablet screens
      setIsPortraitMobile(isNarrow && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  if (isPortraitMobile && !bypassed) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: '#07090e',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '28px 24px',
          textAlign: 'center',
          userSelect: 'none',
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: 'absolute',
            width: '240px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Animated Phone Graphic Rotating */}
        <div
          style={{
            position: 'relative',
            width: '120px',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          {/* Pulsing ring */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(16, 185, 129, 0.35)',
              animation: 'spin 12s linear infinite',
            }}
          />

          {/* Rotating phone */}
          <div
            style={{
              animation: 'rotatePhone 2.5s ease-in-out infinite',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
            }}
          >
            <Smartphone size={56} strokeWidth={1.8} />
          </div>

          {/* Mini arrow hint */}
          <div
            style={{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
              background: '#10b981',
              color: '#ffffff',
              borderRadius: '50%',
              padding: '6px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RotateCw size={14} strokeWidth={2.5} />
          </div>
        </div>

        {/* Header Pill */}
        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            padding: '4px 12px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            marginBottom: '14px',
          }}
        >
          Strict Landscape Mode Required
        </span>

        {/* Title */}
        <h2
          style={{
            fontSize: 'clamp(1.4rem, 5vw, 1.8rem)',
            fontWeight: 900,
            margin: '0 0 10px',
            color: '#ffffff',
            letterSpacing: '-0.02em',
          }}
        >
          Rotate Your Device Horizontally
        </h2>

        {/* Description */}
        <p
          style={{
            fontSize: '0.92rem',
            color: '#94a3b8',
            maxWidth: '360px',
            lineHeight: 1.5,
            margin: '0 0 24px',
          }}
        >
          {gameTitle} is built for horizontal tabletop play. Rotate your phone sideways to unlock the game room.
        </p>

        {/* Interactive Device Orientation Tip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '0.82rem',
            color: '#cbd5e1',
            marginBottom: '28px',
          }}
        >
          <Sparkles size={16} color="#fbbf24" />
          <span>Auto-unlocks instantly when rotated</span>
        </div>

        {/* Developer / Testing Override Link */}
        <button
          type="button"
          onClick={() => setBypassed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.76rem',
            cursor: 'pointer',
            textDecoration: 'underline',
            marginTop: '12px',
          }}
        >
          Preview in Portrait Anyway (Dev Mode)
        </button>

        <style>{`
          @keyframes rotatePhone {
            0%, 20% {
              transform: rotate(0deg);
            }
            50%, 80% {
              transform: rotate(90deg);
            }
            100% {
              transform: rotate(0deg);
            }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}

