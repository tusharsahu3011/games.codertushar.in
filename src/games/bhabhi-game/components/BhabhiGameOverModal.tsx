import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { GameState } from '../types';
import { Crown, RotateCcw, Home, Sparkles, AlertTriangle } from 'lucide-react';
import { bhabhiSounds } from '../utils/sound';

export interface BhabhiGameOverModalProps {
  room: GameState;
  myPlayerId: string;
  isHost: boolean;
  onRematch: () => void;
  onExit: () => void;
}

export default function BhabhiGameOverModal({
  room,
  myPlayerId,
  isHost,
  onRematch,
  onExit,
}: BhabhiGameOverModalProps) {
  const isMeBhabhi = room.loserId === myPlayerId;
  const loser = room.players.find((p) => p.id === room.loserId);
  const myPlayer = room.players.find((p) => p.id === myPlayerId);

  // Trigger victory fanfare & confetti or Bhabhi game over sound!
  useEffect(() => {
    if (isMeBhabhi) {
      bhabhiSounds.playBhabhiGameOver();
    } else {
      bhabhiSounds.playGetAwayFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#34d399', '#38bdf8', '#fbbf24', '#f43f5e'],
        });
      } catch (e) {}
    }
  }, [isMeBhabhi]);

  // Order of exits: winnerOrder first, then the loser
  const rankedPlayers = [...room.players].sort((a, b) => {
    if (a.id === room.loserId) return 1;
    if (b.id === room.loserId) return -1;
    return (a.exitRank || 99) - (b.exitRank || 99);
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(3, 7, 18, 0.88)',
        backdropFilter: 'blur(10px)',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: isMeBhabhi ? '2px solid rgba(239, 68, 68, 0.5)' : '2px solid rgba(16, 185, 129, 0.5)',
          borderRadius: '28px',
          padding: '32px 24px',
          boxShadow: isMeBhabhi
            ? '0 0 50px rgba(239, 68, 68, 0.35)'
            : '0 0 50px rgba(16, 185, 129, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* Top Icon Badge */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: isMeBhabhi ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            border: isMeBhabhi ? '1px solid #ef4444' : '1px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isMeBhabhi ? '#ef4444' : '#10b981',
            marginBottom: '16px',
          }}
        >
          {isMeBhabhi ? <Crown size={32} /> : <Sparkles size={32} />}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '1.9rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: '0 0 6px',
            letterSpacing: '-0.02em',
          }}
        >
          {isMeBhabhi ? 'You are the Bhabhi!' : 'You Got Away Safe!'}
        </h2>

        <p
          style={{
            fontSize: '0.92rem',
            color: isMeBhabhi ? '#fca5a5' : '#86efac',
            fontWeight: 600,
            margin: '0 0 24px',
          }}
        >
          {isMeBhabhi
            ? 'You were left with cards when all other operatives escaped!'
            : `Safe operative! Ranked #${myPlayer?.exitRank || 1} to empty your hand.`}
        </p>

        {/* Standings List */}
        <div
          style={{
            width: '100%',
            background: 'rgba(0, 0, 0, 0.35)',
            borderRadius: '16px',
            padding: '12px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '4px',
              textAlign: 'left',
              padding: '0 8px',
            }}
          >
            Match Standings
          </div>

          {rankedPlayers.map((player) => {
            const isLoser = player.id === room.loserId;
            const isMe = player.id === myPlayerId;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isLoser
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: isLoser
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img
                    src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`}
                    alt={player.name}
                    style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                  />
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#f8fafc' }}>
                      {player.name} {isMe && <span style={{ color: '#38bdf8' }}>(You)</span>}
                    </div>
                  </div>
                </div>

                {isLoser ? (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 900,
                      color: '#f87171',
                      background: 'rgba(239, 68, 68, 0.25)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Crown size={12} /> BHABHI
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#34d399',
                      background: 'rgba(16, 185, 129, 0.2)',
                      padding: '3px 8px',
                      borderRadius: '999px',
                    }}
                  >
                    Got Away #{player.exitRank || '✓'}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button
            type="button"
            onClick={onExit}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#cbd5e1',
              padding: '12px',
              borderRadius: '14px',
              fontSize: '0.9rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <Home size={16} />
            <span>Mode Select</span>
          </button>

          <button
            type="button"
            onClick={onRematch}
            style={{
              flex: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '14px',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
            }}
          >
            <RotateCcw size={16} />
            <span>Play Rematch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
