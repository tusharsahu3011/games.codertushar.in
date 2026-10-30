import { useState } from 'react';
import { GameState } from '../types';
import { bhabhiSounds } from '../utils/sound';
import type { VoiceSnapshot } from '../../undercover-game/utils/webrtcVoice';
import {
  Users,
  UserPlus,
  Play,
  Copy,
  Check,
  Trash2,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  Radio,
} from 'lucide-react';

export interface BhabhiLobbyProps {
  room: GameState;
  myPlayerId: string;
  isHost: boolean;
  voiceState?: VoiceSnapshot;
  onToggleMic?: () => void;
  onRequestMic?: () => void;
  onStartGame: () => void;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onLeaveRoom: () => void;
}

export default function BhabhiLobby({
  room,
  myPlayerId,
  isHost,
  voiceState,
  onToggleMic,
  onRequestMic,
  onStartGame,
  onAddBot,
  onRemoveBot,
  onLeaveRoom,
}: BhabhiLobbyProps) {
  const [copied, setCopied] = useState(false);
  const [testedSound, setTestedSound] = useState(false);

  // Defensively deduplicate players by id and ensure no ghost/empty entries
  const uniquePlayers = Array.from(
    new Map(
      (room.players || [])
        .filter((p) => Boolean(p && p.id && p.name && p.name.trim() !== ''))
        .map((p) => [p.id, p])
    ).values()
  );

  const playerCount = uniquePlayers.length;
  const canStart = playerCount >= 3 && playerCount <= 6;
  const canAddBot = isHost && playerCount < 6;

  const handleCopyLink = () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/game/bhabhi?room=${room.roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTestAudioFX = () => {
    bhabhiSounds.playTap();
    setTimeout(() => {
      bhabhiSounds.playCardSnap();
    }, 100);
    setTimeout(() => {
      bhabhiSounds.playTrickSweep();
      setTestedSound(true);
      setTimeout(() => setTestedSound(false), 2200);
    }, 280);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '780px',
        margin: '0 auto',
        padding: '20px clamp(12px, 3vw, 24px) 48px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '20px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={onLeaveRoom}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#cbd5e1',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft size={15} />
          <span>Exit Lobby</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '6px 14px',
            borderRadius: '999px',
          }}
        >
          <ShieldCheck size={14} />
          <span>Synchronized Room</span>
        </div>
      </div>

      {/* Room Code Card */}
      <div
        style={{
          width: '100%',
          background: '#0d131f',
          border: '1.5px solid rgba(16, 185, 129, 0.35)',
          borderRadius: '24px',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
          marginBottom: '20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.74rem',
          color: '#10b981',
          fontWeight: 800,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '8px',
          background: 'rgba(16, 185, 129, 0.1)',
          padding: '3px 10px',
          borderRadius: '999px',
        }}>
          <Radio size={12} />
          <span>Room Code • Share With Dost & Yaar</span>
        </div>

        <div
          style={{
            fontSize: 'clamp(2.4rem, 8vw, 3.2rem)',
            fontWeight: 900,
            letterSpacing: '0.14em',
            color: '#ffffff',
            margin: '0 0 16px',
            fontFamily: 'monospace',
          }}
        >
          {room.roomCode}
        </div>

        <button
          type="button"
          onClick={handleCopyLink}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: copied ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
            border: copied ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.18)',
            color: '#ffffff',
            padding: '9px 20px',
            borderRadius: '12px',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Invite Link Copied!' : 'Copy Shareable Invite Link'}</span>
        </button>
      </div>

      {/* AUDIO & MICROPHONE HARDWARE CHECK PANEL */}
      <div
        style={{
          width: '100%',
          background: '#0d131f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '18px',
          padding: '16px 20px',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mic size={17} color="#38bdf8" />
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>
              Microphone & Audio Check
            </span>
          </div>

          <span style={{ fontSize: '0.74rem', color: '#94a3b8', fontWeight: 600 }}>
            Real-time WebRTC Voice & Sound FX
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          {/* Mic Toggle / Test */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {voiceState?.hasPermission ? (
              <button
                type="button"
                onClick={onToggleMic}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: voiceState.isMuted ? 'rgba(239, 68, 68, 0.18)' : 'rgba(16, 185, 129, 0.18)',
                  border: voiceState.isMuted ? '1px solid #ef4444' : '1px solid #10b981',
                  color: voiceState.isMuted ? '#f87171' : '#34d399',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {voiceState.isMuted ? <MicOff size={15} /> : <Mic size={15} />}
                <span>{voiceState.isMuted ? 'Mic Muted (Click to Unmute)' : 'Mic Live & Active'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequestMic || onToggleMic}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Mic size={15} />
                <span>Test Microphone & Join Voice</span>
              </button>
            )}

            {/* Sound Effects Test Button */}
            <button
              type="button"
              onClick={handleTestAudioFX}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: testedSound ? '#34d399' : '#cbd5e1',
                padding: '7px 12px',
                borderRadius: '10px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Volume2 size={15} />
              <span>{testedSound ? '✓ Audio FX Working!' : 'Test Sound Effects'}</span>
            </button>
          </div>

          {/* Equalizer Visualizer Bars if mic is active */}
          {voiceState?.hasPermission && !voiceState.isMuted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '22px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginRight: '4px' }}>Input:</span>
              {[0.4, 0.7, 1.0, 0.6, 0.8].map((mult, idx) => {
                const vol = voiceState.currentVolume || 0;
                const barHeight = Math.max(4, Math.min(22, (vol * mult * 1.8) + 4));
                return (
                  <div
                    key={idx}
                    style={{
                      width: '4px',
                      height: `${barHeight}px`,
                      background: vol > 5 ? '#10b981' : '#475569',
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Players List Grid (3 to 6 seats) */}
      <div style={{ width: '100%', marginBottom: '24px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#10b981" />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>
              Players In Room ({playerCount} / 6)
            </span>
          </div>

          <span style={{ fontSize: '0.78rem', color: playerCount < 3 ? '#f59e0b' : '#10b981', fontWeight: 700 }}>
            {playerCount < 3 ? `Needs ${3 - playerCount} more player(s) to start` : 'Ready to deal cards!'}
          </span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
            gap: '12px',
          }}
        >
          {/* Active Player Slots (Strictly Deduplicated) */}
          {uniquePlayers.map((player) => {
            const isMe = player.id === myPlayerId;
            const isPlayerHost = player.id === room.hostId;

            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '16px',
                  background: isMe ? 'rgba(16, 185, 129, 0.12)' : '#0d131f',
                  border: isMe ? '1.5px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img
                    src={player.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${player.id}`}
                    alt={player.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#1e293b',
                      border: isMe ? '2px solid #10b981' : '1.5px solid rgba(255, 255, 255, 0.15)',
                    }}
                  />
                  <div>
                    <div
                      style={{
                        fontSize: '0.92rem',
                        fontWeight: 800,
                        color: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span>{player.name}</span>
                      {isMe && (
                        <span style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 800 }}>
                          (You)
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      {isPlayerHost && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#fbbf24',
                            background: 'rgba(245, 158, 11, 0.15)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          👑 HOST
                        </span>
                      )}
                      {player.isBot && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            color: '#60a5fa',
                            background: 'rgba(59, 130, 246, 0.15)',
                            padding: '1px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          🤖 BOT
                        </span>
                      )}
                      {!player.isBot && (
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            color: '#34d399',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          ● Online
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Host can kick / remove bot */}
                {isHost && player.isBot && (
                  <button
                    type="button"
                    onClick={() => onRemoveBot(player.id)}
                    title="Remove Bot"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      border: '1px solid rgba(239, 68, 68, 0.35)',
                      color: '#f87171',
                      padding: '6px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Empty Seats */}
          {Array.from({ length: Math.max(0, 6 - playerCount) }).map((_, i) => (
            <div
              key={`empty_${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                borderRadius: '16px',
                border: '1.5px dashed rgba(255, 255, 255, 0.1)',
                color: '#64748b',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: 'rgba(15, 23, 42, 0.25)',
              }}
            >
              Seat #{playerCount + i + 1} Open
            </div>
          ))}
        </div>
      </div>

      {/* Action Controls */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', gap: '12px', width: '100%', flexWrap: 'wrap' }}>
          {isHost && (
            <button
              type="button"
              disabled={!canAddBot}
              onClick={onAddBot}
              style={{
                flex: 1,
                minWidth: '160px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: canAddBot ? '#ffffff' : '#64748b',
                padding: '12px 18px',
                borderRadius: '14px',
                fontSize: '0.9rem',
                fontWeight: 700,
                cursor: canAddBot ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
              }}
            >
              <UserPlus size={17} />
              <span>+ Add AI Bot</span>
            </button>
          )}

          {isHost ? (
            <button
              type="button"
              disabled={!canStart}
              onClick={onStartGame}
              style={{
                flex: 2,
                minWidth: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: canStart ? '#10b981' : 'rgba(255, 255, 255, 0.05)',
                border: canStart ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.1)',
                color: canStart ? '#ffffff' : '#64748b',
                padding: '12px 24px',
                borderRadius: '14px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: canStart ? 'pointer' : 'not-allowed',
                boxShadow: canStart ? '0 4px 18px rgba(16, 185, 129, 0.35)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Play size={18} fill={canStart ? '#ffffff' : 'none'} />
              <span>Deal 52 Cards & Start Match</span>
            </button>
          ) : (
            <div
              style={{
                flex: 1,
                padding: '14px',
                borderRadius: '14px',
                background: '#0d131f',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: '0.86rem',
                fontWeight: 600,
              }}
            >
              ⏳ Waiting for room host to deal cards & start...
            </div>
          )}
        </div>

        {!canStart && isHost && (
          <span style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600 }}>
            Add at least {3 - playerCount} more player(s) or bot(s) to start.
          </span>
        )}
      </div>
    </div>
  );
}
