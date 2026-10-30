import { motion, AnimatePresence } from 'framer-motion';
import { Layers } from 'lucide-react';
import type { PlayedCard } from '../types';

export interface DiscardPileProps {
  discardPileCount: number;
  recentDiscardedCards?: PlayedCard[];
  className?: string;
}

export default function DiscardPile({
  discardPileCount,
  recentDiscardedCards = [],
  className = '',
}: DiscardPileProps) {
  // Deterministic rotational angles for the stack visual layers
  const stackOffsets = [
    { rotate: -4, offsetX: -2, offsetY: 1 },
    { rotate: 5, offsetX: 2, offsetY: -1 },
    { rotate: -2, offsetX: 1, offsetY: 2 },
    { rotate: 3, offsetX: -1, offsetY: -2 },
  ];

  return (
    <div
      className={`table-discard-pile ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        userSelect: 'none',
        flexShrink: 0,
      }}
      title={`${discardPileCount} cards collected in the Discard Pile`}
    >
      {/* 3D Visual Card Stack */}
      <div
        style={{
          position: 'relative',
          width: 'clamp(50px, 6vw, 68px)',
          height: 'clamp(72px, 8.5vw, 98px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {discardPileCount === 0 ? (
          /* Empty placeholder box */
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '8px',
              border: '1.5px dashed rgba(255, 255, 255, 0.18)',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: '0.65rem',
              fontWeight: 700,
              gap: '4px',
            }}
          >
            <Layers size={16} />
            <span>Discard</span>
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Background layered cards to represent deck thickness */}
            {stackOffsets.slice(0, Math.min(4, Math.ceil(discardPileCount / 4))).map((offset, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
                  transform: `rotate(${offset.rotate}deg) translate(${offset.offsetX}px, ${offset.offsetY}px)`,
                  pointerEvents: 'none',
                }}
              >
                {/* Back card pattern lines */}
                <div
                  style={{
                    position: 'absolute',
                    inset: '3px',
                    borderRadius: '5px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                />
              </div>
            ))}

            {/* Topmost Card of Discard Pile */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #1e293b 0%, #090d16 100%)',
                border: '1.5px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 18px rgba(0, 0, 0, 0.65)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(-1deg)',
              }}
            >
              {/* Inner geometric stamp */}
              <div
                style={{
                  width: '75%',
                  height: '75%',
                  borderRadius: '5px',
                  border: '1px dashed rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(245, 158, 11, 0.04)',
                }}
              >
                <Layers size={18} color="#f59e0b" />
              </div>
            </motion.div>

            {/* Floating animated cards sliding into the pile */}
            <AnimatePresence>
              {recentDiscardedCards.map((rc, idx) => (
                <motion.div
                  key={`discard_fly_${rc.card.id}_${idx}`}
                  initial={{
                    scale: 1.1,
                    rotate: (idx % 2 === 0 ? 1 : -1) * 15,
                    opacity: 1,
                    y: -60,
                    x: (idx - 1) * -40,
                  }}
                  animate={{
                    scale: 0.98,
                    rotate: (idx % 2 === 0 ? -4 : 4),
                    opacity: 0,
                    y: 0,
                    x: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.08 }}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.7)',
                    pointerEvents: 'none',
                    zIndex: 30,
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Discard Counter Pill */}
      <div
        style={{
          marginTop: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '2px 8px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '0.66rem',
          fontWeight: 800,
          color: '#cbd5e1',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span style={{ color: '#94a3b8' }}>Discard:</span>
        <span style={{ color: '#f59e0b', fontWeight: 900 }}>{discardPileCount}</span>
      </div>
    </div>
  );
}
