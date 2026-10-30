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
  size?: 'sm' | 'md' | 'lg';
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
  const isAceOfSpades = card && card.suit === 'SPADES' && card.rank === 14;

  // Size dimensions
  const dimensions = {
    sm: { width: '48px', height: '68px', fontSize: '0.8rem', suitSize: '1.2rem', radius: '8px' },
    md: { width: '68px', height: '98px', fontSize: '1rem', suitSize: '1.7rem', radius: '10px' },
    lg: { width: '88px', height: '128px', fontSize: '1.25rem', suitSize: '2.2rem', radius: '12px' },
  }[size];

  if (isFaceDown || !card) {
    return (
      <div
        className={`playing-card face-down ${className}`}
        style={{
          width: dimensions.width,
          minWidth: dimensions.width,
          maxWidth: dimensions.width,
          height: dimensions.height,
          minHeight: dimensions.height,
          maxHeight: dimensions.height,
          borderRadius: dimensions.radius,
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
          border: '1.5px solid rgba(165, 180, 252, 0.3)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `rotate(${rotation}deg)`,
          position: 'relative',
          userSelect: 'none',
          cursor: disabled ? 'not-allowed' : 'default',
          flexShrink: 0,
          ...style,
        }}
      >
        <div
          style={{
            width: 'calc(100% - 10px)',
            height: 'calc(100% - 10px)',
            borderRadius: '6px',
            border: '1px dashed rgba(165, 180, 252, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          }}
        >
          <span style={{ fontSize: '1.1rem', color: '#818cf8', opacity: 0.8 }}>♠</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'HEARTS' || card.suit === 'DIAMONDS';
  const rankLabel = getRankLabel(card.rank);
  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const suitColor = isRed ? '#ef4444' : '#0f172a';

  const isClickable = !disabled && Boolean(onClick);

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`playing-card face-up ${isSelected ? 'selected' : ''} ${className}`}
      style={{
        width: dimensions.width,
        minWidth: dimensions.width,
        maxWidth: dimensions.width,
        height: dimensions.height,
        minHeight: dimensions.height,
        maxHeight: dimensions.height,
        borderRadius: dimensions.radius,
        background: isAceOfSpades && highlightLeadAce
          ? 'linear-gradient(145deg, #fffbeb 0%, #fef3c7 60%, #fde68a 100%)'
          : 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
        border: isAceOfSpades && highlightLeadAce
          ? '2px solid #f59e0b'
          : isSelected
          ? '2px solid #38bdf8'
          : '1px solid rgba(0, 0, 0, 0.15)',
        boxShadow: isAceOfSpades && highlightLeadAce
          ? '0 0 16px rgba(245, 158, 11, 0.6), 0 6px 16px rgba(0,0,0,0.4)'
          : isSelected
          ? '0 0 14px rgba(56, 189, 248, 0.6), 0 8px 18px rgba(0,0,0,0.35)'
          : isValidMove && !disabled
          ? '0 4px 10px rgba(0, 0, 0, 0.25)'
          : '0 2px 6px rgba(0, 0, 0, 0.15)',
        opacity: !isValidMove && !disabled ? 0.9 : 1,
        filter: !isValidMove && !disabled ? 'brightness(0.92)' : 'none',
        transform: isSelected
          ? `translateY(-14px) rotate(${rotation}deg) scale(1.04)`
          : `rotate(${rotation}deg)`,
        transition: 'transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.18s ease, opacity 0.18s ease',
        cursor: isClickable && isValidMove ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: size === 'sm' ? '3px 4px' : '5px 7px',
        userSelect: 'none',
        position: 'relative',
        flexShrink: 0,
        ...style,
      }}
    >
      {/* Top Left Corner */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          lineHeight: 1,
          color: suitColor,
        }}
      >
        <span style={{ fontWeight: 800, fontSize: dimensions.fontSize, letterSpacing: '-0.02em' }}>
          {rankLabel}
        </span>
        <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.95rem', marginTop: '1px' }}>
          {suitSymbol}
        </span>
      </div>

      {/* Center Watermark / Emblem */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: dimensions.suitSize,
          color: suitColor,
          opacity: card.rank >= 11 ? 0.7 : 0.95,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {card.rank >= 11 && (
          <span style={{ fontSize: '0.65em', fontWeight: 900, marginBottom: '-4px' }}>
            {rankLabel}
          </span>
        )}
        <span>{suitSymbol}</span>
      </div>

      {/* Special Lead Badge on Ace of Spades */}
      {isAceOfSpades && highlightLeadAce && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#ffffff',
            fontSize: '0.62rem',
            fontWeight: 900,
            padding: '2px 6px',
            borderRadius: '999px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
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
        }}
      >
        <span style={{ fontWeight: 800, fontSize: dimensions.fontSize, letterSpacing: '-0.02em' }}>
          {rankLabel}
        </span>
        <span style={{ fontSize: size === 'sm' ? '0.75rem' : '0.95rem', marginTop: '1px' }}>
          {suitSymbol}
        </span>
      </div>

      {/* Player name label when card is played on table */}
      {playerName && (
        <div
          style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            fontSize: '0.68rem',
            fontWeight: 700,
            padding: '1px 7px',
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 5,
          }}
        >
          {playerName}
        </div>
      )}
    </div>
  );
}
