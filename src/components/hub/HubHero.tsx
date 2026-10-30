import { Sparkles, Users, Mic, Smartphone, Flame, Play, Shield } from 'lucide-react';
import type { PlayerStats } from '../../types/sso';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface HubHeroProps {
  ssoStats?: PlayerStats | null;
  onExploreGames?: () => void;
}

export default function HubHero({ onExploreGames }: HubHeroProps) {
  const handleScrollToGames = () => {
    sounds.playTap();
    if (onExploreGames) {
      onExploreGames();
    } else {
      const section = document.getElementById('game-catalog-section');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section
      style={{
        maxWidth: '1240px',
        margin: '0 auto clamp(24px, 5vw, 40px)',
        padding: '0 clamp(14px, 3vw, 24px)',
      }}
    >
      <div
        style={{
          background: '#0d131f',
          border: '1.5px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '28px',
          padding: 'clamp(28px, 5vw, 48px) clamp(18px, 4vw, 40px)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Subtle accent backdrop glow */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.22) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        />

        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
          {/* Top Pill Tags */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#10b981',
                color: '#ffffff',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
              }}
            >
              <Flame size={14} />
              <span>THE DOST YAAR HUB</span>
            </span>

            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '5px 12px',
                borderRadius: '999px',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <span>⚡ 100% In-Browser • Zero Downloads</span>
            </span>
          </div>

          {/* Main Hero Punch Heading */}
          <h1
            style={{
              fontSize: 'clamp(2rem, 5.5vw, 3.4rem)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.12,
              letterSpacing: '-0.035em',
              margin: '0 0 16px',
            }}
          >
            Epic Party & Card Games for your <span style={{ color: '#10b981' }}>Dost & Yaar</span>.
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.96rem, 2vw, 1.12rem)',
              color: '#94a3b8',
              lineHeight: 1.6,
              margin: '0 0 28px',
              maxWidth: '720px',
            }}
          >
            Bring the vibes! Pass your phone around for instant social deception with <strong style={{ color: '#ffffff' }}>Undercover</strong>, interrogate suspects in <strong style={{ color: '#ffffff' }}>Spyfall</strong>, or deal 52 cards in traditional Indian <strong style={{ color: '#ffffff' }}>Bhabhi (Get Away)</strong> with live multiplayer rooms.
          </p>

          {/* Action Button & Jump Link */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              onClick={handleScrollToGames}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#10b981',
                color: '#ffffff',
                padding: '14px 28px',
                borderRadius: '14px',
                fontSize: '0.98rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                border: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <Play size={18} fill="#ffffff" />
              <span>Browse All Games</span>
            </button>
          </div>

          {/* Modern Highlights Feature Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                color: '#e2e8f0',
                fontWeight: 700,
              }}
            >
              <Smartphone size={16} color="#10b981" />
              <span>Single Phone Pass & Play</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                color: '#e2e8f0',
                fontWeight: 700,
              }}
            >
              <Mic size={16} color="#06b6d4" />
              <span>Live WebRTC Voice Chat</span>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '8px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                color: '#e2e8f0',
                fontWeight: 700,
              }}
            >
              <Users size={16} color="#f59e0b" />
              <span>3 to 20 Players per Game</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
