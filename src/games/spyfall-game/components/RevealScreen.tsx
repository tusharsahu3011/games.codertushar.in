import { useState } from 'react';
import {
  Fingerprint,
  Eye,
  EyeOff,
  ShieldAlert,
  MapPin,
  Briefcase,
  ArrowRight,
  Compass,
  Lock,
  Unlock,
} from 'lucide-react';
import type { SpyfallPlayer, SpyfallLocation } from '../types';
import { spySounds } from '../utils/sound';

export interface SpyfallRevealScreenProps {
  players: SpyfallPlayer[];
  secretLocation: SpyfallLocation;
  onAllBriefed: () => void;
  onAbortGame: () => void;
}

export default function SpyfallRevealScreen({
  players,
  secretLocation,
  onAllBriefed,
  onAbortGame,
}: SpyfallRevealScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);

  const currentPlayer = players[currentIndex];
  const isLastPlayer = currentIndex === players.length - 1;

  const handleToggleReveal = () => {
    if (!isRevealed) {
      spySounds.playDecrypted();
      setIsRevealed(true);
    } else {
      spySounds.playTap();
      setIsRevealed(false);
    }
  };

  const handleNextPlayer = () => {
    spySounds.playSelect();
    setIsRevealed(false);
    if (isLastPlayer) {
      spySounds.playDramaticSting();
      onAllBriefed();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  return (
    <div style={{
      maxWidth: '640px',
      margin: '0 auto',
      padding: '30px 16px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top Progress Bar */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
      }}>
        <button
          onClick={() => {
            spySounds.playTap();
            onAbortGame();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.82rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Cancel Mission
        </button>

        <span style={{
          fontSize: '0.82rem',
          color: '#38bdf8',
          fontWeight: 800,
          letterSpacing: '0.04em',
        }}>
          OPERATIVE {currentIndex + 1} OF {players.length}
        </span>
      </div>

      {/* Progress Dots */}
      <div style={{
        display: 'flex',
        gap: '6px',
        marginBottom: '28px',
        width: '100%',
        maxWidth: '300px',
      }}>
        {players.map((_, idx) => (
          <div
            key={idx}
            style={{
              flex: 1,
              height: '4px',
              borderRadius: '2px',
              background: idx < currentIndex ? '#06b6d4' : idx === currentIndex ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
              transition: 'background 0.3s ease',
            }}
          />
        ))}
      </div>

      {/* Player Hand-Off Banner */}
      <div style={{
        textAlign: 'center',
        marginBottom: '24px',
      }}>
        <div style={{
          fontSize: '0.82rem',
          color: '#94a3b8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 700,
          marginBottom: '6px',
        }}>
          Hand device securely to
        </div>

        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1.5px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '999px',
          padding: '8px 22px 8px 12px',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.2)',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: currentPlayer.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 900,
            fontSize: '0.85rem',
          }}>
            #{currentIndex + 1}
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>
            {currentPlayer.name}
          </span>
        </div>
      </div>

      {/* Card Body: Concealed vs Revealed */}
      <div style={{
        width: '100%',
        minHeight: '380px',
        background: isRevealed
          ? currentPlayer.isSpy
            ? 'linear-gradient(180deg, rgba(30, 10, 20, 0.95) 0%, rgba(15, 5, 10, 0.98) 100%)'
            : 'linear-gradient(180deg, rgba(10, 25, 45, 0.95) 0%, rgba(5, 15, 30, 0.98) 100%)'
          : 'rgba(15, 23, 42, 0.9)',
        border: isRevealed
          ? currentPlayer.isSpy
            ? '2px solid rgba(244, 63, 94, 0.6)'
            : '2px solid rgba(6, 182, 212, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        boxShadow: isRevealed
          ? currentPlayer.isSpy
            ? '0 20px 50px -10px rgba(244, 63, 94, 0.4)'
            : '0 20px 50px -10px rgba(6, 182, 212, 0.35)'
          : '0 15px 35px -10px rgba(0, 0, 0, 0.6)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {!isRevealed ? (
          // CONCEALED PRIVACY SHIELD
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '2px dashed rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 2s infinite',
            }}>
              <Fingerprint size={44} color="#38bdf8" />
            </div>

            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
                Classified Clearance Dossier
              </h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', margin: 0, maxWidth: '340px' }}>
                Ensure no other players are looking at the screen before biometric decryption.
              </p>
            </div>

            <button
              onClick={handleToggleReveal}
              style={{
                marginTop: '12px',
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.96rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(6, 182, 212, 0.4)',
              }}
            >
              <Eye size={18} />
              <span>Tap to Decrypt Identity</span>
            </button>
          </div>
        ) : currentPlayer.isSpy ? (
          // REVEALED: SPY IDENTITY
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.5)',
              color: '#fb7185',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}>
              <ShieldAlert size={14} />
              <span>SECURITY BREACH // IDENTITY CLASSIFIED</span>
            </div>

            <div style={{
              fontSize: '3.6rem',
              lineHeight: 1,
              filter: 'drop-shadow(0 0 20px rgba(244, 63, 94, 0.5))',
            }}>
              🕵️
            </div>

            <div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#fb7185',
                letterSpacing: '0.04em',
                margin: '0 0 6px',
              }}>
                YOU ARE THE SPY!
              </h2>
              <p style={{
                fontSize: '0.92rem',
                color: '#e2e8f0',
                lineHeight: 1.5,
                margin: 0,
                maxWidth: '420px',
              }}>
                You have infiltrated the operation without location intelligence.
                Listen to operatives' answers, deflect suspicion, and deduce where they are!
              </p>
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '0.84rem',
              color: '#fda4af',
              maxWidth: '420px',
            }}>
              💡 <em>You can win by remaining undetected OR by revealing yourself to guess the location!</em>
            </div>
          </div>
        ) : (
          // REVEALED: OPERATIVE IDENTITY
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '999px',
              background: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: '#38bdf8',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
            }}>
              <Compass size={14} />
              <span>CLASSIFIED LOCATION BRIEFING</span>
            </div>

            {/* Location Display */}
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '4px' }}>
                {secretLocation.emoji}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                SECRET LOCATION
              </div>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                margin: '2px 0 6px',
              }}>
                {secretLocation.name}
              </h2>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', margin: 0, maxWidth: '400px' }}>
                {secretLocation.description}
              </p>
            </div>

            {/* Assigned Role Display */}
            <div style={{
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '14px',
              padding: '12px 20px',
              maxWidth: '420px',
              width: '100%',
              textAlign: 'left',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.75rem',
                color: '#38bdf8',
                fontWeight: 800,
                letterSpacing: '0.04em',
                marginBottom: '4px',
              }}>
                <Briefcase size={14} />
                <span>YOUR ASSIGNED ROLE:</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff', marginBottom: '4px' }}>
                {currentPlayer.role}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                {currentPlayer.roleDuty}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{
        marginTop: '28px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        width: '100%',
      }}>
        {isRevealed && (
          <button
            onClick={handleNextPlayer}
            style={{
              width: '100%',
              maxWidth: '420px',
              padding: '15px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <span>{isLastPlayer ? 'All Briefed — Begin Interrogation' : 'I Have Memorized My Role'}</span>
            <ArrowRight size={18} />
          </button>
        )}

        {isRevealed && (
          <button
            onClick={handleToggleReveal}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <EyeOff size={15} />
            <span>Hide identity to pass device safely</span>
          </button>
        )}
      </div>
    </div>
  );
}
