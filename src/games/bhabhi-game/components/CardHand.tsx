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
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 8px 8px',
        position: 'relative',
        zIndex: 20,
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
          marginBottom: '8px',
        }}
      >
        {/* Suit Tabs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
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
                  background: isSelected ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
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
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.22)',
                border: '1px solid #f59e0b',
                color: '#fbbf24',
                boxShadow: '0 0 14px rgba(245, 158, 11, 0.4)',
                animation: 'pulse 1.8s infinite',
              }}
            >
              <Sparkles size={14} />
              Lead with Ace of Spades (A♠)!
            </span>
          )}

          <div
            style={{
              padding: '5px 14px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              letterSpacing: '0.02em',
              background: isTrickReviewing
                ? 'rgba(245, 158, 11, 0.2)'
                : isMyTurn
                ? 'rgba(16, 185, 129, 0.25)'
                : 'rgba(255, 255, 255, 0.06)',
              border: isTrickReviewing
                ? '1px solid rgba(245, 158, 11, 0.5)'
                : isMyTurn
                ? '1px solid rgba(16, 185, 129, 0.6)'
                : '1px solid rgba(255, 255, 255, 0.12)',
              color: isTrickReviewing ? '#fbbf24' : isMyTurn ? '#34d399' : '#94a3b8',
              boxShadow: isMyTurn ? '0 0 16px rgba(16, 185, 129, 0.35)' : 'none',
            }}
          >
            {isTrickReviewing
              ? '⏳ REVIEWING TRICK (2s)...'
              : isMyTurn
              ? '● YOUR TURN — CLICK A CARD TO PLAY'
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
            background: 'rgba(239, 68, 68, 0.22)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '6px 16px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            marginBottom: '8px',
            width: '100%',
            justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <AlertCircle size={15} />
          <span>{validationHint}</span>
        </div>
      )}

      {/* ================= CARDS DOCK (PERFECT HORIZONTAL STRAIGHT LINE) ================= */}
      <div
        className="cards-dock-container"
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.4) 0%, rgba(10, 15, 28, 0.8) 100%)',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          boxShadow: 'inset 0 2px 12px rgba(255, 255, 255, 0.05), 0 12px 32px rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(12px)',
          padding: '26px 16px 14px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflowX: 'auto',
          overflowY: 'visible',
          WebkitOverflowScrolling: 'touch',
          minHeight: '168px',
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
            <Sparkles size={26} color="#34d399" style={{ marginBottom: '8px' }} />
            <span style={{ fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
              🎉 You have Got Away!
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
              Hand is cleared! Safe from becoming Bhabhi.
            </span>
          </div>
        ) : (
          <div
            className="horizontal-straight-cards-row"
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingBottom: '2px',
            }}
          >
            {filteredHand.map((card, idx) => {
              const validation = gameState ? BhabhiEngine.validateMove(gameState, myPlayerId, card) : { valid: true };
              const isValid = isMyTurn && validation.valid;
              const isSelected = selectedCardId === card.id;
              const isHovered = hoveredCardId === card.id;

              const N = filteredHand.length;

              // Horizontal overlap calculation to fit cleanly in viewport
              const overlapMargin = N > 14
                ? '-52px'
                : N > 11
                ? '-42px'
                : N > 8
                ? '-34px'
                : N > 5
                ? '-24px'
                : N > 2
                ? '-14px'
                : '0px';

              // Vertical lift on hover or selection (keeping strictly 0deg horizontal rotation)
              const liftY = isSelected ? -24 : isHovered ? -16 : 0;
              const scaleFactor = isSelected ? 1.06 : isHovered ? 1.03 : 1;

              return (
                <div
                  key={card.id}
                  style={{
                    marginLeft: idx === 0 ? 0 : overlapMargin,
                    zIndex: isSelected ? 60 : isHovered ? 50 : idx + 10,
                    position: 'relative',
                    transform: `translateY(${liftY}px) scale(${scaleFactor})`,
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
                    size="lg"
                    isSelected={isSelected}
                    isValidMove={isValid}
                    disabled={!isMyTurn}
                    highlightLeadAce={isAceOfSpadesFirstMove}
                    onClick={() => handleCardClick(card)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful bottom cue */}
      <div
        style={{
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '6px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <ArrowUpCircle size={13} color="#94a3b8" />
        <span>Click card to play into the center table trick</span>
      </div>
    </div>
  );
}
