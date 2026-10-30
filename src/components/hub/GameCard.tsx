import { Play, Users, Clock, ChevronRight, Lock, Sparkles, Eye } from 'lucide-react';
import type { GameItem } from '../../types/hub';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface GameCardProps {
  game: GameItem;
  onPlay: (gameId: string) => void;
  onPreview?: (game: GameItem) => void;
}

export default function GameCard({ game, onPlay, onPreview }: GameCardProps) {
  const isPlayable = game.status === 'ACTIVE';

  const handleClick = () => {
    if (isPlayable) {
      sounds.playSelect();
      onPlay(game.id);
    } else if (onPreview) {
      sounds.playTap();
      onPreview(game);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={isPlayable ? 'card-interactive' : 'card-interactive-subtle'}
      style={{
        padding: 'clamp(20px, 3.5vw, 26px)',
        borderRadius: '22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0d131f',
        border: isPlayable
          ? `1.5px solid ${game.accentColor}`
          : '1px solid rgba(255, 255, 255, 0.08)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isPlayable
          ? '0 10px 30px -10px rgba(0, 0, 0, 0.6)'
          : '0 4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div>
        {/* Top Badges & Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '999px',
              background: isPlayable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
              border: isPlayable ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
              color: isPlayable ? '#10b981' : '#94a3b8',
              letterSpacing: '0.04em',
            }}
          >
            <span>{isPlayable ? '● READY TO PLAY' : 'IN DEVELOPMENT'}</span>
          </span>

          <span
            style={{
              fontSize: '0.78rem',
              color: game.accentColor,
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}
          >
            {game.genre}
          </span>
        </div>

        {/* Title & Tagline */}
        <h3
          style={{
            fontSize: 'clamp(1.4rem, 4vw, 1.7rem)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
          }}
        >
          {game.title}
        </h3>

        <div
          style={{
            fontSize: '0.86rem',
            color: '#94a3b8',
            fontWeight: 600,
            marginBottom: '14px',
          }}
        >
          {game.tagline}
        </div>

        <p
          style={{
            fontSize: '0.92rem',
            color: '#cbd5e1',
            lineHeight: 1.55,
            margin: '0 0 18px',
          }}
        >
          {game.description}
        </p>

        {/* Player range & duration */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.82rem',
            color: '#94a3b8',
            marginBottom: '18px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={15} color={game.accentColor} />
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{game.playerRange}</span>
          </div>
          <span style={{ opacity: 0.5 }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color={game.accentColor} />
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{game.estimatedTime}</span>
          </div>
        </div>

        {/* Features list */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '22px',
          }}
        >
          {game.features.map((feat, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.74rem',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 600,
              }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      {isPlayable ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          style={{
            width: '100%',
            padding: '13px 20px',
            minHeight: '48px',
            fontSize: '0.96rem',
            fontWeight: 800,
            background: game.accentColor,
            border: 'none',
            borderRadius: '14px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 18px ${game.accentColor}44`,
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>Select Mode & Play</span>
          <ChevronRight size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          style={{
            width: '100%',
            padding: '12px 18px',
            minHeight: '48px',
            fontSize: '0.88rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            borderRadius: '14px',
            cursor: 'pointer',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            touchAction: 'manipulation',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.borderColor = game.accentColor;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <Sparkles size={15} color={game.accentColor} />
          <span>Preview Game Specs</span>
          <ChevronRight size={15} color="#94a3b8" />
        </button>
      )}
    </div>
  );
}
