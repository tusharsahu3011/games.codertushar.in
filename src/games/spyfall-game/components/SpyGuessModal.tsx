import { useState } from 'react';
import { Compass, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import type { SpyfallLocation } from '../types';
import LocationReferenceModal from './LocationReferenceModal';
import { spySounds } from '../utils/sound';

export interface SpyfallSpyGuessModalProps {
  isOpen: boolean;
  onConfirmGuess: (location: SpyfallLocation) => void;
  onCancel: () => void;
}

export default function SpyfallSpyGuessModal({
  isOpen,
  onConfirmGuess,
  onCancel,
}: SpyfallSpyGuessModalProps) {
  const [selectedLoc, setSelectedLoc] = useState<SpyfallLocation | null>(null);

  if (!isOpen) return null;

  const handlePickLocation = (loc: SpyfallLocation) => {
    setSelectedLoc(loc);
  };

  const handleFinalConfirm = () => {
    if (selectedLoc) {
      spySounds.playDramaticSting();
      onConfirmGuess(selectedLoc);
    }
  };

  return (
    <>
      <LocationReferenceModal
        isOpen={isOpen && !selectedLoc}
        onClose={onCancel}
        isGuessMode={true}
        onSelectForGuess={handlePickLocation}
      />

      {/* Confirmation Step if selected */}
      {selectedLoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 110,
          background: 'rgba(2, 6, 23, 0.92)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            background: '#090e17',
            border: '2px solid #f43f5e',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: '32px 24px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(244, 63, 94, 0.5), 0 0 40px rgba(244, 63, 94, 0.3)',
            animation: 'fadeIn 0.2s ease',
          }}>
            <div style={{
              fontSize: '3.4rem',
              marginBottom: '8px',
            }}>
              {selectedLoc.emoji}
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              color: '#fb7185',
              fontSize: '0.74rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              marginBottom: '12px',
            }}>
              <ShieldAlert size={14} />
              <span>FINAL SPY LOCATION GUESS</span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
              {selectedLoc.name}
            </h2>

            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 28px' }}>
              Are you confident the operatives are gathered at <strong>{selectedLoc.name}</strong>?
              If you are right, you win immediately! If wrong, the operatives win.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={handleFinalConfirm}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(244, 63, 94, 0.4)',
                }}
              >
                <Check size={18} />
                <span>Confirm Location Guess</span>
              </button>

              <button
                onClick={() => setSelectedLoc(null)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Choose a Different Location
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
