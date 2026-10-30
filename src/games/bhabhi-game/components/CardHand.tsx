import { useState } from 'react';
import { Card, Suit, GameState } from '../types';
import { BhabhiEngine, SUIT_SYMBOLS, SUIT_COLORS } from '../utils/engine';
import PlayingCard from './PlayingCard';
import { Sparkles, AlertCircle, ArrowUpCircle } from 'lucide-react';
import { bhabhiSounds } from '../utils/sound';

export interface CardHandProps {
  hand: Card[];
  gameState: GameState | null;
  myPlayerId: string;
  isMyTurn: boolean;
  onPlayCard: (cardId: string) => void;
  onInvalidClick?: (reason: string) => void;
}

export default function CardHand({
  hand,
  gameState,
  myPlayerId,
  isMyTurn,
  onPlayCard,
  onInvalidClick,
}: CardHandProps) {
  const [selectedSuit, setSelectedSuit] = useState<Suit | 'ALL'>('ALL');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const [validationHint, setValidationHint] = useState<string | null>(null);

  // Group hand by suits
  const suitCounts: Record<Suit, number> = {
    SPADES: hand.filter((c) => c.suit === 'SPADES').length,
    HEARTS: hand.filter((c) => c.suit === 'HEARTS').length,
    CLUBS: hand.filter((c) => c.suit === 'CLUBS').length,
    DIAMONDS: hand.filter((c) => c.suit === 'DIAMONDS').length,
  };

  const filteredHand = selectedSuit === 'ALL'
    ? hand
    : hand.filter((c) => c.suit === selectedSuit);

  const isTrickReviewing = Boolean(
    gameState?.activeTrick.cards.length === 0 &&
    gameState?.lastCompletedTrick &&
    Date.now() - gameState.lastCompletedTrick.completedAt < 2200
  );

  const handleCardClick = (card: Card) => {
    if (!gameState) return;

    if (isTrickReviewing) {
      const hint = 'Reviewing completed trick... Next trick starts shortly.';
      setValidationHint(hint);
      bhabhiSounds.playInvalid();
      onInvalidClick?.(hint);
      return;
    }

    if (!isMyTurn) {
      const hint = 'Wait for your turn before playing.';
      setValidationHint(hint);
      bhabhiSounds.playInvalid();
      onInvalidClick?.(hint);
      return;
    }

    const validation = BhabhiEngine.validateMove(gameState, myPlayerId, card);
    if (!validation.valid) {
      const hint = validation.reason || 'Invalid move.';
      setValidationHint(hint);
      bhabhiSounds.playInvalid();
      onInvalidClick?.(hint);
      return;
    }

    setValidationHint(null);
    setSelectedCardId(card.id);
    bhabhiSounds.playCardSlide();
    onPlayCard(card.id);
  };

  const isAceOfSpadesFirstMove = Boolean(
    gameState?.firstRound &&
    gameState.activeTrick.cards.length === 0 &&
    isMyTurn
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1020px',
        margin: '0 auto',
        padding: '0 8px 16px',
        position: 'relative',
      }}
    >
      {/* Top Filter Bar & Turn Status */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        {/* Suit Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.7)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedSuit('ALL')}
            style={{
              padding: '4px 10px',
              borderRadius: '8px',
              border: 'none',
              background: selectedSuit === 'ALL' ? '#3b82f6' : 'transparent',
              color: selectedSuit === 'ALL' ? '#ffffff' : '#94a3b8',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            All ({hand.length})
          </button>

          {(['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'] as Suit[]).map((suit) => {
            const count = suitCounts[suit];
            if (count === 0) return null;
            const isSelected = selectedSuit === suit;
            return (
              <button
                key={suit}
                type="button"
                onClick={() => setSelectedSuit(suit)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 9px',
                  borderRadius: '8px',
                  border: isSelected ? `1px solid ${SUIT_COLORS[suit]}` : '1px solid transparent',
                  background: isSelected ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: SUIT_COLORS[suit], fontSize: '0.9rem' }}>
                  {SUIT_SYMBOLS[suit]}
                </span>
                <span>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Turn Pill & Instructions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAceOfSpadesFirstMove && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.78rem',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#fbbf24',
              }}
            >
              <Sparkles size={13} />
              Play Ace of Spades (A♠) to Start!
            </span>
          )}

          <div
            style={{
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              background: isTrickReviewing
                ? 'rgba(245, 158, 11, 0.2)'
                : isMyTurn
                ? 'rgba(16, 185, 129, 0.2)'
                : 'rgba(255, 255, 255, 0.05)',
              border: isTrickReviewing
                ? '1px solid rgba(245, 158, 11, 0.5)'
                : isMyTurn
                ? '1px solid rgba(16, 185, 129, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              color: isTrickReviewing ? '#fbbf24' : isMyTurn ? '#34d399' : '#94a3b8',
            }}
          >
            {isTrickReviewing
              ? '⏳ REVIEWING TRICK (2s)...'
              : isMyTurn
              ? '● YOUR TURN — SELECT A CARD'
              : 'WAITING FOR OPPONENT...'}
          </div>
        </div>
      </div>

      {/* Validation hint banner */}
      {validationHint && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(239, 68, 68, 0.18)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#fca5a5',
            padding: '6px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            marginBottom: '10px',
            width: '100%',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <AlertCircle size={15} />
          <span>{validationHint}</span>
        </div>
      )}

      {/* Cards Display Tray (Overlapping Radial Semi-Circle Arc Fan) */}
      <div
        className="cards-tray"
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'visible',
          padding: '28px 16px 14px',
          minHeight: '175px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filteredHand.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
              color: '#94a3b8',
              fontSize: '0.9rem',
            }}
          >
            <Sparkles size={24} color="#34d399" style={{ marginBottom: '8px' }} />
            <span>🎉 You have Got Away! Safe from being Bhabhi!</span>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '6px',
            }}
          >
            {filteredHand.map((card, idx) => {
              const validation = gameState ? BhabhiEngine.validateMove(gameState, myPlayerId, card) : { valid: true };
              const isValid = isMyTurn && validation.valid;
              const isSelected = selectedCardId === card.id;
              const isHovered = hoveredCardId === card.id;

              // Arc Fan Radial Semi-Circle Geometry
              const N = filteredHand.length;
              const centerIdx = (N - 1) / 2;
              const offset = idx - centerIdx;

              // Angular spread per card around imaginary pivot
              const totalArcSpread = Math.min(68, Math.max(16, (N - 1) * (N > 10 ? 4.8 : N > 6 ? 5.8 : 7.5)));
              const angleStep = N > 1 ? totalArcSpread / (N - 1) : 0;
              const rotationDeg = offset * angleStep;

              // Parabolic vertical droop (creates the realistic natural arch)
              const arcY = Math.pow(Math.abs(offset), 1.55) * (N > 10 ? 1.7 : 2.4);

              // Lift card gracefully on hover or active selection
              const liftY = isSelected ? -28 : isHovered ? -16 : 0;
              const scaleFactor = isSelected ? 1.08 : isHovered ? 1.05 : 1;

              // Overlapping negative margin
              const overlapMargin = N > 12 ? '-38px' : N > 8 ? '-30px' : N > 5 ? '-20px' : N > 2 ? '-10px' : '0px';

              return (
                <div
                  key={card.id}
                  style={{
                    marginLeft: idx === 0 ? 0 : overlapMargin,
                    zIndex: isSelected ? 60 : isHovered ? 50 : idx + 10,
                    position: 'relative',
                    transform: `translateY(${arcY + liftY}px) rotate(${rotationDeg}deg) scale(${scaleFactor})`,
                    transformOrigin: '50% 135%',
                    transition: 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), z-index 0.15s ease',
                  }}
                  onMouseEnter={() => {
                    setHoveredCardId(card.id);
                    if (isMyTurn) {
                      bhabhiSounds.playCardHover();
                    }
                  }}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <PlayingCard
                    card={card}
                    size="md"
                    isSelected={isSelected}
                    isValidMove={isValid}
                    disabled={!isMyTurn}
                    highlightLeadAce={isAceOfSpadesFirstMove}
                    onClick={() => handleCardClick(card)}
                    style={{
                      transform: 'none', // Handled by outer radial arc wrapper
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful bottom status */}
      <div
        style={{
          fontSize: '0.74rem',
          color: '#64748b',
          marginTop: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <ArrowUpCircle size={13} color="#94a3b8" />
        <span>Click any highlighted card to play it to the center trick.</span>
      </div>
    </div>
  );
}
