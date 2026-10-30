import React, { useState, useEffect } from 'react';
import {
  Mic, CheckCircle2, Clock, Play, Pause, RotateCcw,
  Users, ArrowRight, Sparkles, MessageSquare, Flame, HelpCircle
} from 'lucide-react';
import { AGENT_COLORS } from './SetupScreen';
import { sounds } from '../utils/sound';
import type { EnginePlayer } from '../utils/gameEngine';

export interface TurnPhaseScreenProps {
  round: number;
  players: EnginePlayer[];
  onProceedToVoting: () => void;
}

export default function TurnPhaseScreen({
  round,
  players,
  onProceedToVoting,
}: TurnPhaseScreenProps) {
  const alivePlayers = players.filter((p) => p.isAlive);

  // Turn index among alive players
  const [activeTurnIndex, setActiveTurnIndex] = useState(0);
  const [completedTurns, setCompletedTurns] = useState<string[]>([]);

  // Turn Timer
  const [timerDuration, setTimerDuration] = useState(30);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(true);

  const currentSpeaker = alivePlayers[activeTurnIndex];
  const allTurnsComplete = completedTurns.length >= alivePlayers.length;
  const currentSpeakerColor = currentSpeaker ? AGENT_COLORS[activeTurnIndex % AGENT_COLORS.length] : AGENT_COLORS[0];

  // Countdown timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            sounds.playTick();
          } else if (prev === 1) {
            sounds.playDramaticBoom();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const handleNextSpeaker = () => {
    sounds.playTap();
    if (currentSpeaker && !completedTurns.includes(currentSpeaker.id)) {
      setCompletedTurns([...completedTurns, currentSpeaker.id]);
    }

    if (activeTurnIndex < alivePlayers.length - 1) {
      setActiveTurnIndex((prev) => prev + 1);
      setTimeLeft(timerDuration);
      setIsTimerRunning(false);
    }
  };

  const resetTimer = () => {
    sounds.playTap();
    setTimeLeft(timerDuration);
    setIsTimerRunning(false);
  };

  const toggleTimer = () => {
    sounds.playTap();
    setIsTimerRunning(!isTimerRunning);
  };

  const handleChangeDuration = (sec: number) => {
    sounds.playSelect();
    setTimerDuration(sec);
    setTimeLeft(sec);
    setIsTimerRunning(false);
  };

  const handleStartVoting = () => {
    sounds.playDramaticBoom();
    onProceedToVoting();
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Round & Phase Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>
            Round {round} Mission
          </span>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Clue & Interrogation Phase</h2>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(255, 255, 255, 0.04)',
          padding: '8px 18px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-glass)',
        }}>
          <Users size={18} color="#10b981" />
          <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>
            {completedTurns.length} of {alivePlayers.length} Clues Given
          </span>
        </div>
      </div>

      {/* Full-width Responsive 2-Column Grid */}
      <div className="layout-grid-2col">
        {/* LEFT COLUMN: Speaker Spotlight & Controls (Dynamically Matches Active Speaker) */}
        <div className="glass-panel" style={{
          textAlign: 'center',
          padding: '36px 28px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: !allTurnsComplete ? `2px solid ${currentSpeakerColor.border}` : '1.5px solid rgba(16, 185, 129, 0.35)',
          boxShadow: !allTurnsComplete ? `0 0 35px ${currentSpeakerColor.border}44` : '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        }}>
          {!allTurnsComplete ? (
            <>
              {/* Animated Soundwave & Avatar */}
              <div style={{ position: 'relative', marginBottom: '18px' }}>
                <div style={{
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: currentSpeakerColor.bg,
                  border: `3px solid ${currentSpeakerColor.border}`,
                  color: currentSpeakerColor.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.2rem',
                  fontWeight: 900,
                  boxShadow: `0 0 30px ${currentSpeakerColor.border}55`,
                  margin: '0 auto',
                  animation: 'pulseGlow 2.5s infinite',
                }}>
                  {currentSpeaker?.name.charAt(0).toUpperCase()}
                </div>

                <div style={{
                  position: 'absolute',
                  bottom: '-4px',
                  right: '-4px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: currentSpeakerColor.border,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}>
                  <Mic size={16} />
                </div>
              </div>

              {/* Dynamic Soundwave bars animation matching active speaker */}
              <div className="soundwave-container" style={{ marginBottom: '14px' }}>
                {[1, 2, 3, 4, 5, 6].map((bar) => (
                  <div
                    key={bar}
                    className="soundwave-bar"
                    style={{ background: currentSpeakerColor.border }}
                  />
                ))}
              </div>

              <span style={{ fontSize: '0.82rem', color: currentSpeakerColor.text, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                Active Speaker
              </span>
              <h3 style={{
                fontSize: '2.3rem',
                fontWeight: 900,
                color: '#ffffff',
                margin: '4px 0 14px',
                textShadow: `0 0 20px ${currentSpeakerColor.border}66`,
              }}>
                {currentSpeaker?.name}
              </h3>

              <p style={{
                fontSize: '0.94rem',
                color: 'var(--text-secondary)',
                maxWidth: '440px',
                margin: '0 auto 24px',
                lineHeight: 1.5,
              }}>
                State <strong>one sentence or clue</strong> describing your secret word. Be subtle so infiltrators don't deduce it, but clear enough for allies to trust you!
              </p>

              {/* Turn Timer Panel */}
              {timerEnabled && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.35)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '20px',
                  border: '1px solid var(--border-glass)',
                  width: '100%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={20} color={timeLeft <= 5 ? '#f43f5e' : currentSpeakerColor.border} />
                    <span style={{
                      fontSize: '1.6rem',
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: timeLeft <= 5 ? '#f43f5e' : '#ffffff',
                      minWidth: '50px',
                    }}>
                      {timeLeft}s
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={toggleTimer}
                      className="btn-secondary"
                      style={{ padding: '8px 14px', fontSize: '0.85rem', minHeight: '44px' }}
                    >
                      {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
                      <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
                    </button>
                    <button
                      onClick={resetTimer}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', minHeight: '44px', minWidth: '44px' }}
                      title="Reset timer"
                      aria-label="Reset timer"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  {/* Preset timer durations */}
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {[20, 30, 45].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => handleChangeDuration(sec)}
                        style={{
                          background: timerDuration === sec ? currentSpeakerColor.bg : 'transparent',
                          color: timerDuration === sec ? currentSpeakerColor.text : 'var(--text-muted)',
                          padding: '6px 10px',
                          minHeight: '36px',
                          borderRadius: '6px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          border: timerDuration === sec ? `1px solid ${currentSpeakerColor.border}` : '1px solid rgba(255, 255, 255, 0.1)',
                          touchAction: 'manipulation',
                        }}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dynamic Active Speaker Clue Given Button */}
              <button
                onClick={handleNextSpeaker}
                style={{
                  background: currentSpeakerColor.border,
                  color: '#ffffff',
                  padding: '16px 28px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: `0 4px 20px ${currentSpeakerColor.border}66`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  maxWidth: '380px',
                  minHeight: '52px',
                  touchAction: 'manipulation',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = 'brightness(1.15)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(1)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Clue Given — Next Operative</span>
                <ArrowRight size={20} />
              </button>
            </>
          ) : (
            <div style={{ padding: '24px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1.5px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <CheckCircle2 size={32} color="#34d399" />
              </div>

              <h3 style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: '#E2E8F0',
                marginBottom: '10px',
                letterSpacing: '-0.01em',
              }}>
                All Operatives Have Spoken!
              </h3>
              <p style={{
                fontSize: '0.94rem',
                color: '#CBD5E1',
                maxWidth: '440px',
                margin: '0 auto 28px',
                lineHeight: 1.6,
              }}>
                Every player has delivered their clue for this round. Proceed to group interrogation and vote on who to eliminate.
              </p>

              <button
                onClick={handleStartVoting}
                className="btn-danger"
                style={{
                  padding: '16px 36px',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: '0 4px 18px rgba(244, 63, 94, 0.35)',
                }}
              >
                <Flame size={20} />
                <span>Enter Discussion & Voting</span>
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Roster Turn Order & Tactical Rules */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Turn Order Tracker */}
          <div className="glass-panel">
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
              Operative Speaking Order
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alivePlayers.map((player, idx) => {
                const isCurrent = idx === activeTurnIndex && !allTurnsComplete;
                const isDone = completedTurns.includes(player.id);
                const colorMeta = AGENT_COLORS[idx % AGENT_COLORS.length];

                return (
                  <div
                    key={player.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent
                        ? colorMeta.bg
                        : isDone
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: isCurrent
                        ? `1.5px solid ${colorMeta.border}`
                        : isDone
                        ? '1px solid rgba(16, 185, 129, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      boxShadow: isCurrent ? `0 0 20px ${colorMeta.border}44` : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: colorMeta.bg,
                        border: `1px solid ${colorMeta.border}`,
                        color: colorMeta.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 800,
                      }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isCurrent ? '#ffffff' : 'var(--text-primary)' }}>
                        {idx + 1}. {player.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDone && (
                        <span style={{ color: 'var(--emerald-success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                          <CheckCircle2 size={16} /> Clue Delivered
                        </span>
                      )}
                      {isCurrent && (
                        <span
                          style={{
                            background: colorMeta.bg,
                            color: colorMeta.text,
                            border: `1px solid ${colorMeta.border}`,
                            padding: '3px 10px',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          Now Speaking
                        </span>
                      )}
                      {!isDone && !isCurrent && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          Waiting Turn
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tactical Clue Tip Card (Solid Warm Amber Border & Accent) */}
          <div className="glass-panel" style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1.5px solid rgba(245, 158, 11, 0.35)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <HelpCircle size={18} color="#fbbf24" />
              <strong style={{ fontSize: '0.92rem', color: '#fbbf24' }}>Espionage Tactical Tip</strong>
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Pay attention to word choices that seem overly broad (e.g. "It is tasty", "You can find it outside"). Overly generic clues often signal an Undercover trying to stay safe without knowing the Civilian word!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
