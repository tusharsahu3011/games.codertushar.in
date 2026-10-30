import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  ShieldAlert,
  Compass,
  RotateCcw,
  Sliders,
  ArrowLeft,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { SpyfallPlayer, SpyfallOutcome, SpyfallSettings } from '../types';
import { spySounds } from '../utils/sound';
import { ssoAuth } from '../../../services/ssoAuth';

export interface SpyfallGameOverScreenProps {
  outcome: SpyfallOutcome;
  players: SpyfallPlayer[];
  settings: SpyfallSettings;
  onPlayAgain: () => void;
  onReconfigure: () => void;
  onBackToHub: () => void;
}

export default function SpyfallGameOverScreen({
  outcome,
  players,
  settings,
  onPlayAgain,
  onReconfigure,
  onBackToHub,
}: SpyfallGameOverScreenProps) {
  const isOperativesWin = outcome.winner === 'operatives';

  // Confetti effect on load
  useEffect(() => {
    spySounds.playVictory();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: isOperativesWin ? ['#06b6d4', '#10b981', '#38bdf8'] : ['#f43f5e', '#fb7185', '#be123c'],
      });
    } catch (e) {}

    // Record stats with SSO
    try {
      const myPlayer = players[0]; // Primary local player
      const userWon = myPlayer.isSpy ? !isOperativesWin : isOperativesWin;
      ssoAuth.recordGameResult(myPlayer.isSpy ? 'undercover' : 'civilian', userWon);
    } catch (e) {}
  }, [isOperativesWin, players]);

  return (
    <div style={{
      maxWidth: '820px',
      margin: '0 auto',
      padding: '30px 16px 80px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top Banner */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 18px',
        borderRadius: '999px',
        background: isOperativesWin ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
        border: isOperativesWin ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(244, 63, 94, 0.4)',
        color: isOperativesWin ? '#34d399' : '#fb7185',
        fontSize: '0.82rem',
        fontWeight: 800,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '20px',
      }}>
        {isOperativesWin ? <Trophy size={16} /> : <ShieldAlert size={16} />}
        <span>{isOperativesWin ? 'MISSION ACCOMPLISHED // OPERATIVES VICTORY' : 'MISSION COMPROMISED // SPY VICTORY'}</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(2.4rem, 6vw, 3.4rem)',
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '-0.03em',
        margin: '0 0 12px',
        lineHeight: 1.15,
      }}>
        {isOperativesWin ? 'The Spy Was Unmasked!' : 'The Spy Triumphed!'}
      </h1>

      <p style={{
        fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
        color: '#cbd5e1',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '0 0 36px',
        lineHeight: 1.6,
      }}>
        {outcome.reason}
      </p>

      {/* Secret Location Reveal Card */}
      <div style={{
        width: '100%',
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
        border: '1.5px solid rgba(6, 182, 212, 0.4)',
        borderRadius: '24px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 30px rgba(6, 182, 212, 0.2)',
        marginBottom: '28px',
      }}>
        <div style={{ fontSize: '3.6rem', marginBottom: '8px' }}>
          {outcome.secretLocation.emoji}
        </div>

        <div style={{
          fontSize: '0.78rem',
          color: '#38bdf8',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          fontWeight: 800,
          marginBottom: '4px',
        }}>
          THE CLASSIFIED LOCATION WAS
        </div>

        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          margin: '0 0 8px',
        }}>
          {outcome.secretLocation.name}
        </h2>

        <p style={{
          fontSize: '0.92rem',
          color: '#94a3b8',
          maxWidth: '460px',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {outcome.secretLocation.description}
        </p>
      </div>

      {/* Complete Operative Dossier Table */}
      <div style={{
        width: '100%',
        background: 'rgba(15, 23, 42, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '36px',
        boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}>
          <Users size={18} color="#06b6d4" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
            Complete Operative Dossier
          </h3>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {players.map((p, idx) => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderRadius: '12px',
                background: p.isSpy ? 'rgba(244, 63, 94, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: p.isSpy ? '1px solid rgba(244, 63, 94, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}>
                  #{idx + 1}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.96rem', fontWeight: 800, color: '#ffffff' }}>
                      {p.name}
                    </span>
                    {p.isSpy && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 900,
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: '#f43f5e',
                        color: '#ffffff',
                        letterSpacing: '0.04em',
                      }}>
                        THE SPY
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: p.isSpy ? '#fb7185' : '#94a3b8' }}>
                    {p.role}
                  </div>
                </div>
              </div>

              <div style={{
                fontSize: '0.82rem',
                color: '#cbd5e1',
                maxWidth: '280px',
                textAlign: 'right',
              }}>
                {p.roleDuty}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        <button
          onClick={() => {
            spySounds.playSelect();
            onPlayAgain();
          }}
          style={{
            padding: '14px 28px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
            color: '#ffffff',
            border: 'none',
            fontSize: '1rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
          }}
        >
          <RotateCcw size={18} />
          <span>Play Again (Same Players)</span>
        </button>

        <button
          onClick={() => {
            spySounds.playTap();
            onReconfigure();
          }}
          style={{
            padding: '14px 22px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sliders size={18} />
          <span>Reconfigure</span>
        </button>

        <button
          onClick={() => {
            spySounds.playTap();
            onBackToHub();
          }}
          style={{
            padding: '14px 22px',
            borderRadius: '14px',
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <ArrowLeft size={16} />
          <span>Exit to Hub</span>
        </button>
      </div>
    </div>
  );
}
