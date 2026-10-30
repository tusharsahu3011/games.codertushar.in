import { useState } from 'react';
import { ShieldAlert, Check, X, AlertTriangle, Users } from 'lucide-react';
import type { SpyfallPlayer } from '../types';
import { spySounds } from '../utils/sound';

export interface SpyfallAccusationModalProps {
  isOpen: boolean;
  accusedPlayer: SpyfallPlayer | null;
  allPlayers: SpyfallPlayer[];
  onConfirmConviction: () => void;
  onCancelAccusation: () => void;
}

export default function SpyfallAccusationModal({
  isOpen,
  accusedPlayer,
  allPlayers,
  onConfirmConviction,
  onCancelAccusation,
}: SpyfallAccusationModalProps) {
  const [votes, setVotes] = useState<Record<string, boolean>>({});

  if (!isOpen || !accusedPlayer) return null;

  const eligibleVoters = allPlayers.filter((p) => p.id !== accusedPlayer.id);

  const handleCastVote = (playerId: string, isGuilty: boolean) => {
    spySounds.playTap();
    setVotes((prev) => ({ ...prev, [playerId]: isGuilty }));
  };

  const guiltyCount = Object.values(votes).filter((v) => v === true).length;
  const innocentCount = Object.values(votes).filter((v) => v === false).length;
  const totalVotesCast = Object.keys(votes).length;

  const handleFinalize = () => {
    if (guiltyCount > innocentCount) {
      spySounds.playAlarm();
      onConfirmConviction();
    } else {
      spySounds.playTap();
      onCancelAccusation();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 23, 0.9)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#090e17',
        border: '2px solid #ef4444',
        borderRadius: '24px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.4), 0 0 35px rgba(239, 68, 68, 0.2)',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          background: 'rgba(239, 68, 68, 0.08)',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#f87171',
            fontSize: '0.75rem',
            fontWeight: 800,
            letterSpacing: '0.06em',
            marginBottom: '12px',
          }}>
            <ShieldAlert size={14} />
            <span>EMERGENCY TRIBUNAL IN SESSION</span>
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 6px',
          }}>
            Accusation Against {accusedPlayer.name}
          </h2>

          <p style={{ fontSize: '0.86rem', color: '#cbd5e1', margin: 0 }}>
            Do the operatives convict this suspect as the infiltrator?
          </p>
        </div>

        {/* Voting Ballot */}
        <div style={{
          padding: '20px 24px',
          maxHeight: '340px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#94a3b8',
            marginBottom: '4px',
          }}>
            <span>Operative Jurors ({eligibleVoters.length})</span>
            <span>
              Guilty: <strong style={{ color: '#f87171' }}>{guiltyCount}</strong> | Innocent: <strong style={{ color: '#34d399' }}>{innocentCount}</strong>
            </span>
          </div>

          {eligibleVoters.map((voter) => {
            const currentVote = votes[voter.id];
            return (
              <div
                key={voter.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: voter.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontSize: '0.75rem',
                    fontWeight: 900,
                  }}>
                    {voter.name.charAt(0)}
                  </div>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc' }}>
                    {voter.name}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => handleCastVote(voter.id, true)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: currentVote === true ? '#ef4444' : 'rgba(239, 68, 68, 0.1)',
                      border: currentVote === true ? 'none' : '1px solid rgba(239, 68, 68, 0.3)',
                      color: currentVote === true ? '#ffffff' : '#f87171',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Guilty
                  </button>

                  <button
                    onClick={() => handleCastVote(voter.id, false)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      background: currentVote === false ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                      border: currentVote === false ? 'none' : '1px solid rgba(16, 185, 129, 0.3)',
                      color: currentVote === false ? '#ffffff' : '#34d399',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Innocent
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Consensus Buttons & Actions */}
        <div style={{
          padding: '18px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                // Quick unanimous guilty
                spySounds.playAlarm();
                onConfirmConviction();
              }}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.92rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
              }}
            >
              <Check size={18} />
              <span>Convict Suspect ({accusedPlayer.name})</span>
            </button>

            <button
              onClick={() => {
                spySounds.playTap();
                onCancelAccusation();
              }}
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Acquit / Resume Clock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
