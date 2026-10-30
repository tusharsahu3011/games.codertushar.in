import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { PlayedCard, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/engine';
import PlayingCard from './PlayingCard';

export interface TrickCenterProps {
  displayedCards: PlayedCard[];
  leadSuit: Suit | null;
  firstRound: boolean;
  isHoldingCompletedTrick: boolean;
  completedTrickReason?: 'win' | 'thoko' | string;
  completedTrickWinner?: string;
  completedTrickPenaltyPlayer?: string;
}

export default function TrickCenter({
  displayedCards,
  leadSuit,
  firstRound,
  isHoldingCompletedTrick,
  completedTrickReason,
  completedTrickWinner,
  completedTrickPenaltyPlayer,
}: TrickCenterProps) {
  return (
    <div
      className="trick-center-zone"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 5,
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
      }}
    >
      {/* Lead Suit / Review Status Header Pill */}
      <div
        className={
          isHoldingCompletedTrick && completedTrickReason === 'thoko' ? 'thoko-banner' : ''
        }
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: isHoldingCompletedTrick
            ? completedTrickReason === 'thoko'
              ? 'linear-gradient(135deg, #ef4444, #b91c1c)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)'
            : 'rgba(15, 23, 42, 0.85)',
          border: isHoldingCompletedTrick
            ? '2px solid #ffffff'
            : '1px solid rgba(255, 255, 255, 0.15)',
          padding: '5px 16px',
          borderRadius: '999px',
          marginBottom: '10px',
          boxShadow: isHoldingCompletedTrick
            ? '0 0 20px rgba(245, 158, 11, 0.6)'
            : '0 4px 12px rgba(0, 0, 0, 0.35)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '0.8rem',
          transition: 'all 0.2s ease',
          backdropFilter: 'blur(8px)',
        }}
      >
        {isHoldingCompletedTrick ? (
          completedTrickReason === 'thoko' ? (
            <span>
              💥 THOKO! {completedTrickPenaltyPlayer} picks up {displayedCards.length} cards!
            </span>
          ) : (
            <span>✨ Won by {completedTrickWinner}! (Clearing in 2s...)</span>
          )
        ) : leadSuit ? (
          <>
            <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
              Lead Suit:
            </span>
            <span
              style={{
                color: SUIT_COLORS[leadSuit],
                fontWeight: 900,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {SUIT_SYMBOLS[leadSuit]} {leadSuit}
            </span>
          </>
        ) : firstRound ? (
          <span
            style={{
              color: '#fbbf24',
              fontSize: '0.75rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Sparkles size={13} /> Opening Move: Ace of Spades (A♠) Required
          </span>
        ) : (
          <span style={{ color: '#cbd5e1', fontSize: '0.75rem', fontWeight: 700 }}>
            Open Trick — Lead can play any suit
          </span>
        )}
      </div>

      {/* Cards currently played in the active trick */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '124px',
          position: 'relative',
          width: '100%',
        }}
      >
        {displayedCards.length === 0 ? (
          <div
            style={{
              border: '1.5px dashed rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '16px 28px',
              color: 'rgba(255, 255, 255, 0.4)',
              fontSize: '0.78rem',
              fontWeight: 600,
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.15)',
            }}
          >
            Waiting for lead card to begin trick...
          </div>
        ) : (
          <div
            className={isHoldingCompletedTrick ? 'trick-review-active' : ''}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: '130px',
              padding: isHoldingCompletedTrick ? '8px 16px' : '4px 8px',
              borderRadius: '20px',
              flexWrap: 'nowrap',
            }}
          >
            {displayedCards.map((played, idx) => {
              // Rotational angles for authentic tabletop card overlap
              const rotations = [-4, 3, -3, 5, -5, 4];
              const rotation = rotations[idx % rotations.length];
              const marginOffset = idx === 0 ? '0px' : displayedCards.length > 4 ? '-28px' : '-16px';
              const isThoko = leadSuit !== null && played.card.suit !== leadSuit;
              const isLeadCard = idx === 0;

              return (
                <motion.div
                  key={`${played.card.id}_${idx}`}
                  initial={{ y: -40, opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{ y: 0, opacity: 1, scale: 1, rotate: rotation }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  style={{
                    marginLeft: marginOffset,
                    zIndex: idx + 1,
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  {/* Special Trick Role Tag (LEAD vs THOKO) */}
                  {isThoko ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 7px',
                        borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
                        letterSpacing: '0.04em',
                        zIndex: 20,
                        animation: 'bounce 0.6s ease',
                      }}
                    >
                      THOKO 💥
                    </div>
                  ) : isLeadCard ? (
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        color: '#ffffff',
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        padding: '1px 7px',
                        borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
                        letterSpacing: '0.04em',
                        zIndex: 20,
                      }}
                    >
                      LEAD ⭐
                    </div>
                  ) : null}

                  <PlayingCard
                    card={played.card}
                    size="md"
                    rotation={0}
                    playerName={played.playerName}
                    disabled
                  />
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
