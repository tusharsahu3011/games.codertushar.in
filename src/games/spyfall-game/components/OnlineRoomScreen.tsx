import { useState, useEffect } from 'react';
import {
  Users,
  Radio,
  Mic,
  MicOff,
  Copy,
  Check,
  Play,
  ArrowRight,
  Shield,
  ShieldAlert,
  Clock,
  Compass,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  Lock,
  MessageSquare,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { UserProfile } from '../../../types/sso';
import type {
  SpyfallOnlineRoomData,
  SpyfallOnlinePlayer,
  SpyfallLocation,
  LocationCategory,
} from '../types';
import { spyMultiplayer, type SpyfallMultiplayerSnapshot } from '../utils/multiplayerSocket';
import { webrtcVoice, type VoiceSnapshot } from '../../undercover-game/utils/webrtcVoice';
import { SPYFALL_LOCATIONS } from '../data/locations';
import { spySounds } from '../utils/sound';
import LocationReferenceModal from './LocationReferenceModal';
import InGameChat from '../../../components/common/InGameChat';
import GameSettingsModal from '../../../components/common/GameSettingsModal';

export interface SpyfallOnlineRoomScreenProps {
  ssoUser?: UserProfile;
  onBackToHub?: () => void;
  onSwitchMode?: () => void;
}

export default function SpyfallOnlineRoomScreen({
  ssoUser,
  onBackToHub,
  onSwitchMode,
}: SpyfallOnlineRoomScreenProps) {
  // Multiplayer session snapshot
  const [snapshot, setSnapshot] = useState<SpyfallMultiplayerSnapshot>(() => spyMultiplayer.getSnapshot());
  const [voiceState, setVoiceState] = useState<VoiceSnapshot>({
    hasPermission: webrtcVoice.hasPermission,
    isMuted: webrtcVoice.isMuted,
    isSpeaking: webrtcVoice.isSpeaking,
    currentVolume: webrtcVoice.currentVolume,
    peerStates: {},
  });

  // Local form state for Room Join/Create
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [hostName, setHostName] = useState(ssoUser?.username || 'Agent Host');
  const [joinCode, setJoinCode] = useState(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      return p.get('spyroom') || p.get('room') || '';
    }
    return '';
  });
  const [joinName, setJoinName] = useState(ssoUser?.username || '');
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [isLocationMatrixOpen, setIsLocationMatrixOpen] = useState(false);
  const [isSpyGuessOpen, setIsSpyGuessOpen] = useState(false);
  const [selectedAccuseTarget, setSelectedAccuseTarget] = useState<string>('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Subscribe to multiplayer socket state
  useEffect(() => {
    const unsub = spyMultiplayer.subscribe((snap) => {
      setSnapshot(snap);
    });
    return () => unsub();
  }, []);

  // Subscribe to WebRTC voice state
  useEffect(() => {
    const unsub = webrtcVoice.subscribe((v) => {
      setVoiceState(v);
    });
    return () => unsub();
  }, []);

  const room = snapshot.room;
  const isHost = snapshot.isHost;
  const myPlayer = snapshot.myPlayer;

  // Sound cues on phase changes
  useEffect(() => {
    if (!room) return;
    if (room.phase === 'BRIEFING') {
      spySounds.playDecrypted();
    } else if (room.phase === 'INTERROGATION') {
      spySounds.playSelect();
    } else if (room.phase === 'ACCUSATION') {
      spySounds.playAlarm();
    } else if (room.phase === 'DEBRIEF') {
      spySounds.playVictory();
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#8b5cf6', '#38bdf8'],
        });
      } catch (e) {}
    }
  }, [room?.phase]);

  // Create Room Action
  const handleCreateRoom = () => {
    setErrorMessage('');
    spySounds.playDramaticSting();
    spyMultiplayer.createRoom(hostName, ssoUser);
  };

  // Join Room Action
  const handleJoinRoom = async () => {
    if (!joinCode.trim()) {
      setErrorMessage('Please enter a 4-letter room code (e.g. SPY-XXXX).');
      return;
    }
    setErrorMessage('');
    spySounds.playSelect();
    const result = await spyMultiplayer.joinRoom(joinCode, joinName, ssoUser);
    if (!result.success) {
      setErrorMessage(result.error || 'Failed to join room.');
    }
  };

  // Copy Room Link Action
  const handleCopyLink = () => {
    if (!room) return;
    spySounds.playTap();
    const url = `${window.location.origin}/game/spyfall/online?spyroom=${room.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  // Toggle Mic
  const handleToggleMic = async () => {
    if (!voiceState.hasPermission) {
      await webrtcVoice.requestMicrophone();
    } else {
      webrtcVoice.toggleMute();
    }
  };

  // -------------------------------------------------------------
  // RENDER 1: NO ROOM (Create or Join Form)
  // -------------------------------------------------------------
  if (!room) {
    return (
      <div style={{
        maxWidth: '520px',
        margin: '0 auto',
        padding: '36px 16px 80px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header Badge */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            borderRadius: '999px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.4)',
            color: '#c084fc',
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.05em',
            marginBottom: '12px',
          }}>
            <Radio size={15} />
            <span>ENCRYPTED REAL-TIME MULTIPLAYER</span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px' }}>
            Multiplayer Spyfall
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
            Connect from multiple phones, tablets, or computers with live voice chat.
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '4px',
          marginBottom: '20px',
        }}>
          <button
            onClick={() => { spySounds.playTap(); setTab('create'); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: tab === 'create' ? '#8b5cf6' : 'transparent',
              color: tab === 'create' ? '#ffffff' : '#94a3b8',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Create New Room
          </button>

          <button
            onClick={() => { spySounds.playTap(); setTab('join'); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              background: tab === 'join' ? '#8b5cf6' : 'transparent',
              color: tab === 'join' ? '#ffffff' : '#94a3b8',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Join Existing Room
          </button>
        </div>

        {/* Card Body */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '20px',
          padding: '28px 24px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.15)',
        }}>
          {tab === 'create' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Your Host Codename
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="e.g. Agent Falcon"
                  maxLength={24}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              <button
                onClick={handleCreateRoom}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)',
                  marginTop: '8px',
                }}
              >
                <span>Generate Room & Invite Operatives</span>
                <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Room Code (e.g. SPY-XXXX)
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="SPY-1234"
                  maxLength={10}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                  Your Operative Codename
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Shadow Viper"
                  maxLength={24}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    outline: 'none',
                  }}
                />
              </div>

              {errorMessage && (
                <div style={{ fontSize: '0.84rem', color: '#f87171', textAlign: 'center' }}>
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleJoinRoom}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 8px 25px rgba(6, 182, 212, 0.4)',
                  marginTop: '8px',
                }}
              >
                <span>Connect to Classified Room</span>
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: ACTIVE ROOM (Lobby, Briefing, Interrogation, etc.)
  // -------------------------------------------------------------
  const uniquePlayers = Array.from(
    new Map(
      (room.players || [])
        .filter((p) => Boolean(p && p.id && p.name && p.name.trim() !== ''))
        .map((p) => [p.id, p])
    ).values()
  );

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '24px 16px 80px',
    }}>
      {/* Top Room Banner with Code and Voice Chat Bar */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '20px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '24px',
      }}>
        {/* Room Code & Copy */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.74rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
              ROOM CODE
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em' }}>
              {room.code}
            </div>
          </div>

          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c084fc',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
            <span>{isCopied ? 'Link Copied!' : 'Invite Link'}</span>
          </button>
        </div>

        {/* Action Controls: WebRTC Voice, Text Chat, Settings, Leave */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* WebRTC Live Voice Chat Controller */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(10, 15, 28, 0.8)',
            padding: '6px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <button
              onClick={handleToggleMic}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: voiceState.hasPermission && !voiceState.isMuted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                border: voiceState.hasPermission && !voiceState.isMuted ? '1px solid #10b981' : '1px solid #ef4444',
                color: voiceState.hasPermission && !voiceState.isMuted ? '#34d399' : '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title={voiceState.hasPermission ? (voiceState.isMuted ? 'Unmute Mic' : 'Mute Mic') : 'Enable Voice'}
            >
              {voiceState.hasPermission && !voiceState.isMuted ? <Mic size={16} /> : <MicOff size={16} />}
            </button>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#cbd5e1' }}>
                {voiceState.hasPermission ? (voiceState.isMuted ? 'Mic Muted' : 'Voice Active') : 'Live Voice Chat'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {voiceState.hasPermission ? (voiceState.isSpeaking ? '● Speaking...' : 'Quiet') : 'Tap mic to connect'}
              </div>
            </div>
          </div>

          {/* In-Game Text Chat Button */}
          <button
            onClick={() => setIsChatOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              color: '#c084fc',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
            title="Room Text Chat"
          >
            <MessageSquare size={16} />
            <span>Chat ({room.chatMessages?.length || 0})</span>
          </button>

          {/* Settings Menu Gear Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
            title="Audio & Game Settings"
          >
            <Settings size={16} />
          </button>

          {/* Leave Room Button */}
          <button
            onClick={() => {
              spySounds.playTap();
              spyMultiplayer.leaveRoom();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fb7185',
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '6px 10px',
            }}
          >
            Leave
          </button>
        </div>
      </div>

      {/* PHASE 1: LOBBY */}
      {room.phase === 'LOBBY' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Operative Roster */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} color="#8b5cf6" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Connected Operatives ({uniquePlayers.length}/12)
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Minimum 3 players</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
              {uniquePlayers.map((p) => (
                <div
                  key={p.id}
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
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: p.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      fontWeight: 900,
                    }}>
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#ffffff' }}>
                          {p.name}
                        </span>
                        {p.isHost && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: '#8b5cf6', color: '#ffffff', fontWeight: 800 }}>
                            HOST
                          </span>
                        )}
                        {p.id === myPlayer?.id && (
                          <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.1)', color: '#cbd5e1' }}>
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: p.isReady ? '#34d399' : '#94a3b8',
                  }}>
                    {p.isReady ? '● Ready' : 'Connecting...'}
                  </span>
                </div>
              ))}
            </div>

            {/* Ready Toggle for Non-Host */}
            {!isHost && (
              <button
                onClick={() => {
                  spySounds.playTap();
                  spyMultiplayer.setReady(!myPlayer?.isReady);
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '10px',
                  background: myPlayer?.isReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  border: myPlayer?.isReady ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.12)',
                  color: myPlayer?.isReady ? '#34d399' : '#cbd5e1',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                }}
              >
                {myPlayer?.isReady ? '✓ You Are Ready' : 'Click When Ready'}
              </button>
            )}
          </div>

          {/* Host Controls */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px' }}>
                Mission Rules & Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Interrogation Duration: <strong>{Math.floor((room.settings.roundDurationSeconds || 420) / 60)} Minutes</strong>
                  </label>
                  {isHost ? (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[300, 420, 600].map((sec) => (
                        <button
                          key={sec}
                          onClick={() => spyMultiplayer.updateSettings({ roundDurationSeconds: sec })}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            background: room.settings.roundDurationSeconds === sec ? '#8b5cf6' : 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {sec / 60}m
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      Controlled by Host
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#94a3b8', marginBottom: '6px' }}>
                    Spies Infiltrating: <strong>{room.settings.spyCount} Spy</strong>
                  </label>
                  {isHost && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {[1, 2].map((cnt) => (
                        <button
                          key={cnt}
                          onClick={() => spyMultiplayer.updateSettings({ spyCount: cnt })}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            background: room.settings.spyCount === cnt ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {cnt} {cnt === 1 ? 'Spy' : 'Spies'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Launch Game Button */}
            {isHost ? (
              <button
                disabled={room.players.length < 3}
                onClick={() => {
                  spySounds.playDramaticSting();
                  spyMultiplayer.startBriefing();
                }}
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: room.players.length >= 3 ? 'linear-gradient(135deg, #8b5cf6, #6366f1)' : 'rgba(255, 255, 255, 0.05)',
                  border: room.players.length >= 3 ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: room.players.length >= 3 ? '#ffffff' : '#64748b',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: room.players.length >= 3 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: room.players.length >= 3 ? '0 8px 25px rgba(139, 92, 246, 0.4)' : 'none',
                }}
              >
                <Play size={18} />
                <span>{room.players.length < 3 ? 'Waiting for 3+ Players' : 'Start Mission Briefing'}</span>
              </button>
            ) : (
              <div style={{ textAlign: 'center', fontSize: '0.88rem', color: '#94a3b8' }}>
                Waiting for host to commence mission...
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 2: BRIEFING (Private role card delivered to device) */}
      {room.phase === 'BRIEFING' && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: myPlayer?.isSpy ? '2px solid rgba(244, 63, 94, 0.5)' : '2px solid rgba(6, 182, 212, 0.5)',
          borderRadius: '24px',
          padding: '36px 24px',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {myPlayer?.isSpy ? (
            <div>
              <div style={{ fontSize: '3.6rem', marginBottom: '8px' }}>🕵️</div>
              <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#fb7185', margin: '0 0 8px' }}>
                YOU ARE THE SPY!
              </h2>
              <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 24px' }}>
                You have no location intelligence. Blend in with the other operatives and deduce where they are gathered!
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>
                CLASSIFIED LOCATION
              </div>
              <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
                {myPlayer?.locationName}
              </h2>
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '12px 18px',
                margin: '0 auto 24px',
                maxWidth: '420px',
                textAlign: 'left',
              }}>
                <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800 }}>YOUR OCCUPATION / ROLE:</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>{myPlayer?.roleName}</div>
                <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{myPlayer?.roleDuty}</div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => {
                spySounds.playSelect();
                setIsLocationMatrixOpen(true);
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Inspect Location Reference Matrix
            </button>

            {isHost ? (
              <button
                onClick={() => {
                  spySounds.playDramaticSting();
                  spyMultiplayer.startInterrogation();
                }}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 900,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 25px rgba(16, 185, 129, 0.4)',
                }}
              >
                Commence Tactical Interrogation Round
              </button>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '6px' }}>
                Memorize your identity. The host will start questioning shortly.
              </div>
            )}
          </div>
        </div>
      )}

      {/* PHASE 3: INTERROGATION */}
      {room.phase === 'INTERROGATION' && (
        <div>
          {/* Synchronized Timer Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1.5px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '24px',
            padding: '28px 24px',
            textAlign: 'center',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
              ROUND IN PROGRESS
            </div>

            <div style={{
              fontSize: '4.2rem',
              fontWeight: 900,
              fontFamily: 'monospace',
              color: '#ffffff',
              lineHeight: 1,
              marginBottom: '16px',
            }}>
              {Math.floor((room.timerDuration || 420) / 60)}:00
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  spySounds.playSelect();
                  setIsLocationMatrixOpen(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.35)',
                  color: '#38bdf8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Compass size={16} />
                <span>Location Matrix</span>
              </button>

              {myPlayer?.isSpy && (
                <button
                  onClick={() => setIsSpyGuessOpen(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #f43f5e, #be123c)',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>Spy: Guess Location</span>
                </button>
              )}
            </div>
          </div>

          {/* Peer Operatives & Accuse Target Grid */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 16px' }}>
              Interrogate Suspects — Call Accusation
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {room.players.map((p) => {
                const isMe = p.id === myPlayer?.id;
                return (
                  <div
                    key={p.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: p.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '0.8rem',
                        fontWeight: 900,
                      }}>
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>{p.name}</div>
                        {isMe && <div style={{ fontSize: '0.72rem', color: '#38bdf8' }}>You</div>}
                      </div>
                    </div>

                    {!isMe && (
                      <button
                        onClick={() => {
                          spySounds.playAlarm();
                          spyMultiplayer.launchAccusation(myPlayer!.id, p.id);
                        }}
                        style={{
                          width: '100%',
                          padding: '6px',
                          borderRadius: '8px',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#f87171',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        Accuse as Spy
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 4: ACCUSATION */}
      {room.phase === 'ACCUSATION' && room.accusation && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #ef4444',
          borderRadius: '24px',
          padding: '32px 24px',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
            EMERGENCY ACCUSATION
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', margin: '0 0 16px' }}>
            {room.players.find((p) => p.id === room.accusation?.accusedPlayerId)?.name} is Accused!
          </h2>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <button
              onClick={() => {
                spySounds.playTap();
                spyMultiplayer.castVote(myPlayer!.id, true);
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Vote Guilty
            </button>

            <button
              onClick={() => {
                spySounds.playTap();
                spyMultiplayer.castVote(myPlayer!.id, false);
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: '#10b981',
                color: '#ffffff',
                border: 'none',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Vote Innocent
            </button>
          </div>
        </div>
      )}

      {/* PHASE 5: DEBRIEF */}
      {room.phase === 'DEBRIEF' && room.outcome && (
        <div style={{
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '24px',
          padding: '36px 24px',
          textAlign: 'center',
          maxWidth: '680px',
          margin: '0 auto',
        }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
            {room.outcome.winner === 'operatives' ? 'Operatives Triumph!' : 'The Spy Wins!'}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: '0 0 24px' }}>
            {room.outcome.reason}
          </p>

          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '28px',
          }}>
            <div style={{ fontSize: '3rem' }}>{room.outcome.secretLocation.emoji}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff' }}>
              {room.outcome.secretLocation.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              {room.outcome.secretLocation.description}
            </div>
          </div>

          {isHost && (
            <button
              onClick={() => {
                spySounds.playSelect();
                spyMultiplayer.resetToLobby();
              }}
              style={{
                padding: '14px 28px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <RotateCcw size={18} />
              <span>Next Round (Return to Lobby)</span>
            </button>
          )}
        </div>
      )}

      {/* Location Matrix Modal */}
      <LocationReferenceModal
        isOpen={isLocationMatrixOpen}
        onClose={() => setIsLocationMatrixOpen(false)}
      />

      {/* Spy Guess Modal */}
      <LocationReferenceModal
        isOpen={isSpyGuessOpen}
        onClose={() => setIsSpyGuessOpen(false)}
        isGuessMode={true}
        onSelectForGuess={(loc) => {
          setIsSpyGuessOpen(false);
          spyMultiplayer.spyGuessLocation(myPlayer!.id, loc.id);
        }}
      />

      {/* In-Game Text Chat Drawer */}
      <InGameChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        messages={room.chatMessages || []}
        currentUserId={myPlayer?.id || ''}
        currentUserName={myPlayer?.name || 'Operative'}
        onSendMessage={(txt) => spyMultiplayer.sendChatMessage(txt)}
        gameThemeColor="#8b5cf6"
      />

      {/* Audio & Game Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor="#8b5cf6"
      />
    </div>
  );
}
