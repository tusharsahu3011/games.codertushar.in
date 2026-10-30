import { Users, Clock, ChevronRight, Sparkles, Play, Compass, Spade, Radio, Grid, Shield, Crown, Eye, Flame } from 'lucide-react';
import type { GameItem } from '../../types/hub';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface GameCardProps {
  game: GameItem;
  onPlay: (gameId: string) => void;
  onPreview?: (game: GameItem) => void;
}

// Icon mapping helper for Lucide icons
function getGameIcon(iconName?: string) {
  switch (iconName) {
    case 'Compass': return Compass;
    case 'Spade': return Spade;
    case 'Radio': return Radio;
    case 'Grid': return Grid;
    case 'Shield': return Shield;
    case 'Crown': return Crown;
    case 'Flame': return Flame;
    case 'Eye':
    default:
      return Eye;
  }
}

export default function GameCard({ game, onPlay, onPreview }: GameCardProps) {
  const isPlayable = game.status === 'ACTIVE';
  const GameIcon = getGameIcon(game.iconName);

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
      className="card-interactive"
      style={{
        padding: 'clamp(20px, 3.2vw, 26px)',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: '#0d131f',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
        minHeight: '380px',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = game.accentColor;
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 14px 34px -8px ${game.accentColor}33, 0 8px 24px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.45)';
      }}
    >
      <div>
        {/* Top Badges & Genre */}
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
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '999px',
              background: isPlayable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
              border: isPlayable ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(139, 92, 246, 0.35)',
              color: isPlayable ? '#34d399' : '#c084fc',
              letterSpacing: '0.04em',
            }}
          >
            <span>{isPlayable ? '● READY TO PLAY' : '○ IN DEVELOPMENT'}</span>
          </span>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              color: game.accentColor,
              fontWeight: 800,
              letterSpacing: '0.02em',
            }}
          >
            <GameIcon size={14} />
            <span>{game.genre}</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <h3
          style={{
            fontSize: 'clamp(1.35rem, 3.8vw, 1.65rem)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.02em',
            margin: '0 0 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {game.title}
        </h3>

        <div
          style={{
            fontSize: '0.84rem',
            color: '#94a3b8',
            fontWeight: 600,
            marginBottom: '14px',
          }}
        >
          {game.tagline}
        </div>

        <p
          style={{
            fontSize: '0.88rem',
            color: '#cbd5e1',
            lineHeight: 1.55,
            margin: '0 0 16px',
            minHeight: '44px',
          }}
        >
          {game.description}
        </p>

        {/* Player range & duration metadata */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '9px 12px',
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            fontSize: '0.8rem',
            color: '#94a3b8',
            marginBottom: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} color={game.accentColor} />
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{game.playerRange}</span>
          </div>
          <span style={{ opacity: 0.35 }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color={game.accentColor} />
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{game.estimatedTime}</span>
          </div>
        </div>

        {/* Features Chips */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginBottom: '20px',
          }}
        >
          {game.features.slice(0, 4).map((feat, i) => (
            <span
              key={i}
              style={{
                fontSize: '0.72rem',
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
            padding: '12px 18px',
            minHeight: '46px',
            fontSize: '0.92rem',
            fontWeight: 800,
            background: game.accentColor,
            border: 'none',
            borderRadius: '14px',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: `0 4px 16px ${game.accentColor}44`,
            cursor: 'pointer',
            touchAction: 'manipulation',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.12)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Play size={16} fill="#ffffff" />
          <span>Play Now</span>
          <ChevronRight size={16} />
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
            minHeight: '46px',
            fontSize: '0.88rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#e2e8f0',
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
