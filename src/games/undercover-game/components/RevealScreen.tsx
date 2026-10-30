import React, { useState, useEffect, useRef } from 'react';
import { Shield, EyeOff, HelpCircle, Lock, Eye, Fingerprint, ArrowRight, CheckCircle2, User } from 'lucide-react';
import { ROLES, ROLE_INFO, type EnginePlayer } from '../utils/gameEngine';
import { AGENT_COLORS } from './SetupScreen';
import { sounds } from '../utils/sound';

export interface RevealScreenProps {
  players: EnginePlayer[];
  onCompleteAllReveals: () => void;
}

export default function RevealScreen({ players, onCompleteAllReveals }: RevealScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [hasRevealedCurrent, setHasRevealedCurrent] = useState(false);
  const isHoldingRef = useRef(false);

  const currentPlayer = players[currentIndex];
  const isLast = currentIndex === players.length - 1;
  const colorMeta = AGENT_COLORS[currentIndex % AGENT_COLORS.length];

  const startHold = (e?: React.SyntheticEvent | Event) => {
    if (e && 'preventDefault' in e) {
      e.preventDefault();
    }
    if (!isHoldingRef.current) {
      isHoldingRef.current = true;
      setIsHolding(true);
      setHasRevealedCurrent(true);
      sounds.playPeek();
    }
  };

  const endHold = (e?: React.SyntheticEvent | Event) => {
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      setIsHolding(false);
    }
  };

  // Foolproof global release listeners: guarantees hiding when pointer or touch lifts anywhere
  useEffect(() => {
    const handleGlobalRelease = () => {
      if (isHoldingRef.current) {
        isHoldingRef.current = false;
        setIsHolding(false);
      }
    };

    window.addEventListener('mouseup', handleGlobalRelease);
    window.addEventListener('touchend', handleGlobalRelease);
    window.addEventListener('touchcancel', handleGlobalRelease);
    window.addEventListener('pointerup', handleGlobalRelease);
    window.addEventListener('pointercancel', handleGlobalRelease);
    window.addEventListener('mouseleave', handleGlobalRelease);

    return () => {
      window.removeEventListener('mouseup', handleGlobalRelease);
      window.removeEventListener('touchend', handleGlobalRelease);
      window.removeEventListener('touchcancel', handleGlobalRelease);
      window.removeEventListener('pointerup', handleGlobalRelease);
      window.removeEventListener('pointercancel', handleGlobalRelease);
      window.removeEventListener('mouseleave', handleGlobalRelease);
    };
  }, []);

  // Keyboard Spacebar hold support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isHoldingRef.current) {
        e.preventDefault();
        startHold();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        endHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleNextPlayer = () => {
    sounds.playTap();
    if (isLast) {
      sounds.playDramaticBoom();
      onCompleteAllReveals();
    } else {
      isHoldingRef.current = false;
      setIsHolding(false);
      setHasRevealedCurrent(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const roleInfo = ROLE_INFO[currentPlayer.role] || ROLE_INFO[ROLES.CIVILIAN];

  return (
    <div
      className="animate-enter"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {/* Top Operative Telemetry Bar */}
      <div className="glass-panel" style={{ padding: '16px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>Top Secret Clearance</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Pass & Play Identity Briefing
            </span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#34d399' }}>
            Operative {currentIndex + 1} of {players.length}
          </span>
        </div>

        {/* Progress Bar (Solid Emerald) */}
        <div style={{ height: '7px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '6px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${((currentIndex + 1) / players.length) * 100}%`,
              background: '#10b981',
              transition: 'width 0.35s ease',
            }}
          />
        </div>
      </div>

      {/* Main Secret Briefing Console */}
      <div
        className="glass-panel"
        style={{
          textAlign: 'center',
          padding: 'clamp(20px, 4vw, 36px) 18px 24px',
          minHeight: 'clamp(340px, 48vh, 460px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          touchAction: 'none',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: '540px', width: '100%' }}>
          {/* Operative Avatar */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: colorMeta.bg,
            border: `2.5px solid ${colorMeta.border}`,
            color: colorMeta.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem',
            fontWeight: 900,
            marginBottom: '10px',
            boxShadow: `0 0 24px ${colorMeta.border}44`,
          }}>
            {currentPlayer.name.charAt(0).toUpperCase()}
          </div>

          <span style={{
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: '4px',
          }}>
            Pass Device To Operative
          </span>

          <h2 style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
            fontWeight: 900,
            color: '#ffffff',
            marginBottom: '12px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
          }}>
            {currentPlayer.name}
          </h2>

          {/* Stable Secret Window Viewport (Fixed Height: No Layout Shift) */}
          <div style={{
            width: '100%',
            height: '130px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}>
            {!isHolding ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  marginBottom: '10px',
                }}>
                  <Lock size={14} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Identity Encrypted
                  </span>
                </div>
                <p style={{
                  fontSize: '0.92rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: 0,
                  maxWidth: '460px',
                  textAlign: 'center',
                }}>
                  Only <strong>{currentPlayer.name}</strong> should view this screen. Press & hold the biometric scanner below to reveal your secret word.
                </p>
              </div>
            ) : (
              <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                {/* Role Header Badge */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 16px',
                  borderRadius: 'var(--radius-full)',
                  background: roleInfo.bg,
                  border: `1.5px solid ${roleInfo.border}`,
                  color: roleInfo.color,
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}>
                  {currentPlayer.role === ROLES.CIVILIAN && <Shield size={16} />}
                  {currentPlayer.role === ROLES.UNDERCOVER && <EyeOff size={16} />}
                  {currentPlayer.role === ROLES.MR_WHITE && <HelpCircle size={16} />}
                  <span>{roleInfo.name}</span>
                </div>

                {/* Secret Word Display */}
                {currentPlayer.role !== ROLES.MR_WHITE ? (
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: '#ffffff',
                    letterSpacing: '0.03em',
                    lineHeight: 1.15,
                    textShadow: `0 0 25px ${roleInfo.color}66`,
                  }}>
                    {currentPlayer.word}
                  </div>
                ) : (
                  <div style={{
                    fontSize: '1.7rem',
                    fontWeight: 900,
                    color: '#c084fc',
                    lineHeight: 1.15,
                  }}>
                    ❓ NO WORD ASSIGNED ❓
                  </div>
                )}

                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '6px', textAlign: 'center' }}>
                  {roleInfo.description}
                </div>
              </div>
            )}
          </div>

          {/* Permanently Mounted Tactile Biometric Scanner (Fixed Size, Zero Shrink/Shift) */}
          <div
            className={`scanner-pad ${isHolding ? 'active' : ''}`}
            onMouseDown={startHold}
            onMouseUp={endHold}
            onTouchStart={startHold}
            onTouchEnd={endHold}
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              width: '140px',
              height: '140px',
              marginTop: '12px',
              cursor: 'pointer',
              touchAction: 'none',
            }}
          >
            <Fingerprint size={52} color={isHolding ? '#10b981' : '#34d399'} />
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: isHolding ? '#10b981' : '#34d399',
              marginTop: '8px',
              letterSpacing: '0.06em',
              textAlign: 'center',
            }}>
              {isHolding ? 'REVEALING...' : 'HOLD TO PEEK'}
            </span>
          </div>

          <span style={{
            fontSize: '0.78rem',
            color: isHolding ? '#34d399' : 'var(--text-muted)',
            marginTop: '12px',
            fontWeight: 600,
            height: '18px',
            transition: 'color 0.2s ease',
          }}>
            {isHolding ? '(Release to conceal immediately)' : '(Or press & hold Spacebar)'}
          </span>
        </div>
      </div>

      {/* Full-width Advance Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.7)',
        padding: '16px 24px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-glass-bright)',
      }}>
        <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          {hasRevealedCurrent ? (
            <span style={{ color: 'var(--emerald-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Word verified by {currentPlayer.name}
            </span>
          ) : (
            <span>Hold the scanner above before passing to the next operative.</span>
          )}
        </div>

        <button
          onClick={handleNextPlayer}
          disabled={!hasRevealedCurrent}
          className="btn-launch"
          style={{
            padding: '16px 36px',
            fontSize: '1.08rem',
            fontWeight: 800,
            opacity: hasRevealedCurrent ? 1 : 0.4,
            cursor: hasRevealedCurrent ? 'pointer' : 'not-allowed',
          }}
        >
          {isLast ? (
            <>
              <span>All Ready — Begin Clue Phase</span>
              <ArrowRight size={20} />
            </>
          ) : (
            <>
              <span>Next Operative ({currentIndex + 2}/{players.length})</span>
              <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
