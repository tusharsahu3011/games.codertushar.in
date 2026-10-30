import React from 'react';
import { Card, Suit, Rank } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS, getRankLabel } from '../utils/engine';

export interface PlayingCardProps {
  card?: Card;
  isFaceDown?: boolean;
  isSelected?: boolean;
  isValidMove?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  rotation?: number;
  highlightLeadAce?: boolean;
  playerName?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function PlayingCard({
  card,
  isFaceDown = false,
  isSelected = false,
  isValidMove = true,
  disabled = false,
  onClick,
  size = 'md',
  rotation = 0,
  highlightLeadAce = false,
  playerName,
  className = '',
  style,
}: PlayingCardProps) {
  const isAceOfSpades = Boolean(card && card.suit === 'SPADES' && card.rank === 14);

  // Enlarged dimensions for premium board presence
  const dimensions = {
    sm: { width: '54px', height: '80px', fontSize: '0.85rem', suitSize: '1.35rem', radius: '8px' },
    md: { width: '78px', height: '114px', fontSize: '1.1rem', suitSize: '2.0rem', radius: '11px' },
    lg: { width: '96px', height: '140px', fontSize: '1.35rem', suitSize: '2.6rem', radius: '13px' },
    xl: { width: '112px', height: '162px', fontSize: '1.55rem', suitSize: '3.1rem', radius: '15px' },
  }[size];

  const isClickable = !disabled && Boolean(onClick);
  const isRed = card ? card.suit === 'HEARTS' || card.suit === 'DIAMONDS' : false;
  const rankLabel = card ? getRankLabel(card.rank) : '';
  const suitSymbol = card ? SUIT_SYMBOLS[card.suit] : '';
  const suitColor = isRed ? '#dc2626' : '#0f172a';

  return (
    <div
      className={`playing-card-container ${className}`}
      onClick={isClickable && (!card || isValidMove) ? onClick : undefined}
      style={{
        width: dimensions.width,
        minWidth: dimensions.width,
        maxWidth: dimensions.width,
        height: dimensions.height,
        minHeight: dimensions.height,
        maxHeight: dimensions.height,
        perspective: '1000px',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
        cursor: isClickable && isValidMove ? 'pointer' : 'default',
        transform: `rotate(${rotation}deg)`,
        transition: 'transform 0.24s cubic-bezier(0.16, 1, 0.3, 1)',
        ...style,
      }}
    >
      {/* 3D Flipper Core */}
      <div
        className="card-3d-flipper"
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.55s cubic-bezier(0.34, 1.4, 0.64, 1), box-shadow 0.25s ease',
          transform: isFaceDown || !card
            ? 'rotateY(180deg)'
            : isSelected
            ? 'translateY(-18px) scale(1.05)'
            : 'translateY(0)',
          borderRadius: dimensions.radius,
          boxShadow: isAceOfSpades && highlightLeadAce
            ? '0 0 20px rgba(245, 158, 11, 0.75), 0 10px 24px rgba(0, 0, 0, 0.6)'
            : isSelected
            ? '0 0 18px rgba(56, 189, 248, 0.7), 0 12px 24px rgba(0, 0, 0, 0.55)'
            : isValidMove && !disabled
            ? '0 6px 16px rgba(0, 0, 0, 0.45)'
            : '0 3px 8px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* ================= FRONT FACE ================= */}
        <div
          className="card-face card-front"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            borderRadius: dimensions.radius,
            background: isAceOfSpades && highlightLeadAce
              ? 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 65%, #fde68a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f9fafb 55%, #f3f4f6 100%)',
            border: isAceOfSpades && highlightLeadAce
              ? '2px solid #f59e0b'
              : isSelected
              ? '2px solid #38bdf8'
              : '1px solid rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: size === 'sm' ? '4px 5px' : '6px 8px',
            overflow: 'hidden',
          }}
        >
          {/* Subtle inner linen border */}
          <div
            style={{
              position: 'absolute',
              inset: '3px',
              borderRadius: `calc(${dimensions.radius} - 2px)`,
              border: '1px solid rgba(0, 0, 0, 0.04)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Left Pip & Rank */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              lineHeight: 1,
              color: suitColor,
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: dimensions.fontSize,
                letterSpacing: '-0.03em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {rankLabel}
            </span>
            <span style={{ fontSize: `calc(${dimensions.fontSize} * 0.9)`, marginTop: '1px' }}>
              {suitSymbol}
            </span>
          </div>

          {/* Center Royal Watermark & Seal */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: dimensions.suitSize,
              color: suitColor,
              opacity: card && card.rank >= 11 ? 0.8 : 0.95,
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
            }}
          >
            {card && card.rank >= 11 && (
              <span
                style={{
                  fontSize: '0.62em',
                  fontWeight: 900,
                  marginBottom: '-4px',
                  letterSpacing: '0.04em',
                  color: isRed ? '#b91c1c' : '#1e293b',
                }}
              >
                {rankLabel}
              </span>
            )}
            <span>{suitSymbol}</span>
          </div>

          {/* Special Lead Badge for Ace of Spades */}
          {isAceOfSpades && highlightLeadAce && (
            <div
              style={{
                position: 'absolute',
                top: '-7px',
                right: '-7px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#ffffff',
                fontSize: '0.62rem',
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: '999px',
                boxShadow: '0 3px 8px rgba(0,0,0,0.5)',
                letterSpacing: '0.04em',
                zIndex: 10,
              }}
            >
              LEAD ⭐
            </div>
          )}

          {/* Bottom Right Corner (Inverted) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              lineHeight: 1,
              color: suitColor,
              transform: 'rotate(180deg)',
              zIndex: 2,
            }}
          >
            <span
              style={{
                fontWeight: 900,
                fontSize: dimensions.fontSize,
                letterSpacing: '-0.03em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              {rankLabel}
            </span>
            <span style={{ fontSize: `calc(${dimensions.fontSize} * 0.9)`, marginTop: '1px' }}>
              {suitSymbol}
            </span>
          </div>
        </div>

        {/* ================= BACK FACE (PREMIUM CASINO FILIGREE) ================= */}
        <div
          className="card-face card-back"
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: dimensions.radius,
            background: 'linear-gradient(145deg, #091322 0%, #0f1d33 50%, #050b14 100%)',
            border: '2px solid #b45309',
            boxShadow: 'inset 0 0 16px rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px',
            overflow: 'hidden',
          }}
        >
          {/* Intricate Gold Foil Outer Border */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: `calc(${dimensions.radius} - 4px)`,
              border: '1.5px solid rgba(245, 158, 11, 0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              background: `
                radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%),
                repeating-linear-gradient(45deg, rgba(245, 158, 11, 0.08) 0px, rgba(245, 158, 11, 0.08) 2px, transparent 2px, transparent 8px),
                repeating-linear-gradient(-45deg, rgba(245, 158, 11, 0.08) 0px, rgba(245, 158, 11, 0.08) 2px, transparent 2px, transparent 8px)
              `,
            }}
          >
            {/* Center Royal Medallion */}
            <div
              style={{
                width: size === 'sm' ? '28px' : '42px',
                height: size === 'sm' ? '28px' : '42px',
                borderRadius: '50%',
                border: '1.5px solid rgba(245, 158, 11, 0.8)',
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f59e0b',
                fontSize: size === 'sm' ? '1rem' : '1.35rem',
              }}
            >
              ♠
            </div>
          </div>
        </div>
      </div>

      {/* Player name label when card is played onto the table */}
      {playerName && (
        <div
          style={{
            position: 'absolute',
            bottom: '-24px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.92)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
            color: '#f8fafc',
            fontSize: '0.72rem',
            fontWeight: 800,
            padding: '2px 8px',
            borderRadius: '999px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {playerName}
        </div>
      )}
    </div>
  );
}
