import React, { useState, useEffect } from 'react';
import {
  Users, AlertTriangle, Clock, Play, Pause, RotateCcw,
  Shield, EyeOff, HelpCircle, Check, Flame, Award
} from 'lucide-react';
import { ROLES, ROLE_INFO, type EnginePlayer } from '../utils/gameEngine';
import { AGENT_COLORS } from './SetupScreen';
import { sounds } from '../utils/sound';

export interface VoteScreenProps {
  round: number;
  players: EnginePlayer[];
  onEliminatePlayer: (player: EnginePlayer) => void;
}

export default function VoteScreen({
  round,
  players,
  onEliminatePlayer,
}: VoteScreenProps) {
  const alivePlayers = players.filter((p) => p.isAlive);

  // Discussion Timer
  const [discussionTime, setDiscussionTime] = useState(90);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Voting mode: 'consensus' vs 'ballot'
  const [voteMode, setVoteMode] = useState<'consensus' | 'ballot'>('consensus');

  // Selected suspect
  const [selectedSuspect, setSelectedSuspect] = useState<EnginePlayer | null>(null);
  const [revealingPlayer, setRevealingPlayer] = useState<EnginePlayer | null>(null);

  // Secret Ballot State
  const [ballotVoterIndex, setBallotVoterIndex] = useState(0);
  const [ballotVotes, setBallotVotes] = useState<Record<string, number>>({});
  const [ballotReady, setBallotReady] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    if (isTimerRunning && discussionTime > 0) {
      interval = setInterval(() => {
        setDiscussionTime((prev) => {
          if (prev <= 5 && prev > 1) sounds.playTick();
          if (prev === 1) sounds.playDramaticBoom();
          return prev - 1;
        });
      }, 1000);
    } else if (discussionTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, discussionTime]);

  const handleSelectSuspect = (player: EnginePlayer) => {
    sounds.playSelect();
    setSelectedSuspect(player);
  };

  const handleConfirmElimination = () => {
    if (!selectedSuspect) return;
    sounds.playDramaticBoom();
    setRevealingPlayer(selectedSuspect);
  };

  const handleRevealDismiss = () => {
    const eliminated = revealingPlayer;
    setRevealingPlayer(null);
    setSelectedSuspect(null);
    if (eliminated) {
      onEliminatePlayer(eliminated);
    }
  };

  const handleCastBallotVote = (targetPlayerId: string) => {
    sounds.playSelect();
    const updated: Record<string, number> = {
      ...ballotVotes,
      [targetPlayerId]: (ballotVotes[targetPlayerId] || 0) + 1,
    };
    setBallotVotes(updated);

    if (ballotVoterIndex < alivePlayers.length - 1) {
      setBallotVoterIndex((prev) => prev + 1);
      setBallotReady(false);
    } else {
      let highestId: string | null = null;
      let maxVotes = -1;
      Object.entries(updated).forEach(([id, count]: [string, number]) => {
        if (count > maxVotes) {
          maxVotes = count;
          highestId = id;
        }
      });
      const chosen = alivePlayers.find((p) => p.id === highestId) || alivePlayers[0];
      setSelectedSuspect(chosen);
      sounds.playDramaticBoom();
      setRevealingPlayer(chosen);
    }
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <span className="badge badge-crimson" style={{ marginBottom: '6px' }}>
            Round {round} • Interrogation
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Detection & Elimination Phase</h2>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => { sounds.playTap(); setVoteMode(voteMode === 'consensus' ? 'ballot' : 'consensus'); }}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.86rem' }}
          >
            Mode: {voteMode === 'consensus' ? 'Direct Group Tap' : 'Secret Ballot Pass'}
          </button>
        </div>
      </div>

      {/* Discussion Debate Bar (Full Width) */}
      <div className="glass-panel" style={{
        padding: '18px 26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: discussionTime <= 10 ? 'rgba(244, 63, 94, 0.25)' : 'rgba(245, 158, 11, 0.18)',
            border: discussionTime <= 10 ? '1.5px solid #f43f5e' : '1.5px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Clock size={22} color={discussionTime <= 10 ? '#f43f5e' : '#fbbf24'} />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Debate & Deliberation Timer
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, fontFamily: 'monospace' }}>
              {Math.floor(discussionTime / 60)}:{(discussionTime % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => { sounds.playTap(); setIsTimerRunning(!isTimerRunning); }}
            className="btn-secondary"
            style={{ padding: '10px 18px', fontSize: '0.9rem' }}
          >
            {isTimerRunning ? <Pause size={16} /> : <Play size={16} />}
            <span>{isTimerRunning ? 'Pause' : 'Start Debate'}</span>
          </button>
          <button
            onClick={() => { sounds.playTap(); setDiscussionTime(90); setIsTimerRunning(false); }}
            className="btn-secondary"
            style={{ padding: '10px 14px' }}
            title="Reset to 90 seconds"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Main Voting Panel */}
      {voteMode === 'consensus' ? (
        /* DIRECT TAP MODE */
        <div className="glass-panel">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>
              Select Suspect to Eliminate
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Deliberate aloud with your squad and tap the player everyone agreed is most suspicious.
            </p>
          </div>

          {/* Full-width responsive suspect cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: '12px',
            marginBottom: '26px',
          }}>
            {alivePlayers.map((player, idx) => {
              const isSelected = selectedSuspect?.id === player.id;
              const colorMeta = AGENT_COLORS[idx % AGENT_COLORS.length];

              return (
                <button
                  key={player.id}
                  onClick={() => handleSelectSuspect(player)}
                  style={{
                    padding: '22px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: isSelected ? 'rgba(244, 63, 94, 0.22)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '2px solid var(--crimson-undercover)' : '1px solid var(--border-glass)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    boxShadow: isSelected ? '0 0 25px rgba(244, 63, 94, 0.45)' : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: isSelected ? 'var(--crimson-undercover)' : colorMeta.bg,
                    border: `2px solid ${isSelected ? '#ffffff' : colorMeta.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    color: isSelected ? '#ffffff' : colorMeta.text,
                    fontSize: '1.3rem',
                  }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>

                  <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                    {player.name}
                  </span>

                  {isSelected ? (
                    <span className="badge badge-crimson" style={{ fontSize: '0.68rem' }}>
                      Marked Suspect
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Tap to Accuse
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Elimination Action Launch Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={handleConfirmElimination}
              disabled={!selectedSuspect}
              className="btn-danger"
              style={{
                width: '100%',
                padding: '18px 32px',
                fontSize: '1.15rem',
                fontWeight: 800,
                opacity: selectedSuspect ? 1 : 0.4,
                cursor: selectedSuspect ? 'pointer' : 'not-allowed',
                borderRadius: 'var(--radius-lg)',
              }}
            >
              <Flame size={22} />
              <span>Confirm Elimination of {selectedSuspect ? selectedSuspect.name : 'Selected Player'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* SECRET BALLOT MODE */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 24px' }}>
          {!ballotReady ? (
            <div style={{ maxWidth: '480px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Secret Ballot {ballotVoterIndex + 1} of {alivePlayers.length}
              </span>
              <h3 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '8px 0 16px' }}>
                Pass Device To: {alivePlayers[ballotVoterIndex]?.name}
              </h3>
              <p style={{ fontSize: '0.94rem', color: 'var(--text-secondary)', marginBottom: '28px', lineHeight: 1.5 }}>
                Ensure privacy so no other player can see who you vote for.
              </p>
              <button
                onClick={() => { sounds.playTap(); setBallotReady(true); }}
                className="btn-primary"
                style={{ padding: '16px 36px', fontSize: '1.05rem', fontWeight: 800 }}
              >
                I am {alivePlayers[ballotVoterIndex]?.name} — Vote
              </button>
            </div>
          ) : (
            <div className="animate-enter" style={{ maxWidth: '640px', margin: '0 auto' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Secret Ballot Interrogation
              </span>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 20px' }}>
                Who is the Undercover, {alivePlayers[ballotVoterIndex]?.name}?
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '12px',
              }}>
                {alivePlayers
                  .filter((p) => p.id !== alivePlayers[ballotVoterIndex]?.id)
                  .map((player) => (
                    <button
                      key={player.id}
                      onClick={() => handleCastBallotVote(player.id)}
                      className="btn-secondary"
                      style={{ padding: '16px 12px', minHeight: '48px', display: 'flex', flexDirection: 'column', gap: '6px', touchAction: 'manipulation' }}
                    >
                      <span style={{ fontWeight: 800, fontSize: '1rem' }}>{player.name}</span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--crimson-undercover)' }}>Vote Suspect</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dramatic Elimination Reveal Modal */}
      {revealingPlayer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.94)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px',
        }}>
          <div className="glass-panel animate-enter" style={{
            width: '100%',
            maxWidth: '520px',
            maxHeight: 'calc(100dvh - 28px)',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            textAlign: 'center',
            padding: 'clamp(24px, 5vw, 40px) 20px',
            border: `2px solid ${ROLE_INFO[revealingPlayer.role]?.border || 'var(--cyan-primary)'}`,
            boxShadow: `0 0 60px ${ROLE_INFO[revealingPlayer.role]?.color || '#06b6d4'}44`,
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Elimination Assessment
            </span>

            <h3 style={{ fontSize: 'clamp(1.8rem, 7vw, 2.5rem)', fontWeight: 900, margin: '8px 0 16px', color: '#ffffff' }}>
              {revealingPlayer.name}
            </h3>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              background: ROLE_INFO[revealingPlayer.role]?.bg,
              border: `1px solid ${ROLE_INFO[revealingPlayer.role]?.border}`,
              color: ROLE_INFO[revealingPlayer.role]?.color,
              fontWeight: 900,
              fontSize: '1.15rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '20px',
            }}>
              {revealingPlayer.role === ROLES.CIVILIAN && <Shield size={22} />}
              {revealingPlayer.role === ROLES.UNDERCOVER && <EyeOff size={22} />}
              {revealingPlayer.role === ROLES.MR_WHITE && <HelpCircle size={22} />}
              <span>{ROLE_INFO[revealingPlayer.role]?.name}</span>
            </div>

            <p style={{ fontSize: '0.96rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '28px' }}>
              {revealingPlayer.role === ROLES.CIVILIAN && 'An innocent civilian was wrongfully eliminated! The remaining infiltrators blend deeper into the shadows.'}
              {revealingPlayer.role === ROLES.UNDERCOVER && 'Undercover operative eliminated! One infiltrator has been apprehended by the civilians.'}
              {revealingPlayer.role === ROLES.MR_WHITE && 'Mr. White was exposed! But they are granted one final guess at the civilian secret word!'}
            </p>

            <button
              onClick={handleRevealDismiss}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', minHeight: '48px', fontSize: '1.05rem', fontWeight: 800, touchAction: 'manipulation' }}
            >
              Continue Mission
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
