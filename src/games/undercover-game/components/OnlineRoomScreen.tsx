import React, { useState, useEffect } from 'react';
import {
  Users, Globe, Copy, Check, LogOut, Play, Mic, MicOff,
  Clock, Shield, EyeOff, HelpCircle, ArrowRight, Flame, Trophy,
  AlertCircle, Radio, UserMinus, Crown, Lock, MessageSquare, Settings
} from 'lucide-react';
import { multiplayerSocket, type RoomData } from '../utils/multiplayerSocket';
import { webrtcVoice } from '../utils/webrtcVoice';
import { sounds } from '../utils/sound';
import { CATEGORIES } from '../data/wordPairs';
import { ROLES, ROLE_INFO } from '../utils/gameEngine';
import { AGENT_COLORS } from './SetupScreen';
import type { UserProfile } from '../../../types/sso';
import InGameChat from '../../../components/common/InGameChat';
import GameSettingsModal from '../../../components/common/GameSettingsModal';

export interface OnlineRoomScreenProps {
  ssoUser?: UserProfile | null;
  onBackToModeSelect: () => void;
}

export default function OnlineRoomScreen({ ssoUser, onBackToModeSelect }: OnlineRoomScreenProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomState, setRoomState] = useState<RoomData | null>(multiplayerSocket.currentRoom);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(multiplayerSocket.myPlayerId);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Form inputs
  const [hostName, setHostName] = useState(ssoUser?.displayName || 'Host Agent');
  const [joinName, setJoinName] = useState(ssoUser?.displayName || '');
  const [joinCode, setJoinCode] = useState('');

  // WebRTC Voice State
  const [voiceState, setVoiceState] = useState({
    hasPermission: webrtcVoice.hasPermission,
    isMuted: webrtcVoice.isMuted,
    isSpeaking: webrtcVoice.isSpeaking,
    currentVolume: webrtcVoice.currentVolume,
    peerStates: webrtcVoice.peerStates,
  });

  // Subscribe to multiplayer socket
  useEffect(() => {
    const unsubscribe = multiplayerSocket.subscribe((snapshot) => {
      setRoomState(snapshot.room ? { ...snapshot.room } : null);
      setMyPlayerId(snapshot.myPlayerId);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to WebRTC voice manager
  useEffect(() => {
    const unsubscribeVoice = webrtcVoice.subscribe((state) => {
      setVoiceState(state);
    });
    return () => unsubscribeVoice();
  }, []);

  // Check URL params for ?room=CODE
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !roomState) {
      setJoinCode(roomParam.toUpperCase());
      setActiveTab('join');
    }
  }, [roomState]);

  // Voice chat controls
  const handleToggleVoice = async () => {
    sounds.playTap();
    if (!voiceState.hasPermission) {
      const res = await webrtcVoice.requestMicrophone();
      if (!res.success) {
        alert('Could not enable microphone. Please check browser permissions.');
      }
    } else {
      webrtcVoice.toggleMute();
    }
  };

  // Create Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMessage('');
    try {
      const room = multiplayerSocket.createRoom({
        hostName: hostName.trim() || ssoUser?.displayName || 'Host Agent',
        hostId: ssoUser?.id,
        ssoUser,
      });
      setRoomState(room);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Join Room
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMessage('');
    if (!joinCode.trim()) {
      setErrorMessage('Please enter a valid Room Code.');
      return;
    }
    try {
      const room = await multiplayerSocket.joinRoom({
        code: joinCode.trim(),
        playerName: joinName.trim() || ssoUser?.displayName || 'Guest Agent',
        playerId: ssoUser?.id,
        ssoUser,
      });
      setRoomState(room);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  };

  // Copy Room Invite Link
  const handleCopyLink = () => {
    sounds.playTap();
    if (!roomState) return;
    const origin = typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : '';
    const url = `${origin}/game/undercover/online?room=${roomState.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  // Host starts online game
  const handleStartMission = () => {
    sounds.playDramaticBoom();
    if (!roomState) return;
    if (roomState.players.length < 3) {
      setErrorMessage('Online multiplayer requires at least 3 operatives to deploy.');
      return;
    }
    setErrorMessage('');
    multiplayerSocket.startOnlineGame();
  };

  // Leave room
  const handleLeaveRoom = () => {
    sounds.playTap();
    webrtcVoice.stop();
    multiplayerSocket.leaveRoom();
    setRoomState(null);
  };

  const isHost = roomState?.hostId === myPlayerId;
  const uniquePlayers = Array.from(
    new Map(
      (roomState?.players || [])
        .filter((p) => Boolean(p && p.id && p.name && p.name.trim() !== ''))
        .map((p) => [p.id, p])
    ).values()
  );
  const myPlayer = uniquePlayers.find((p) => p.id === myPlayerId);

  // -------------------------------------------------------------
  // VIEW 1: NOT IN ROOM (Create / Join Tabs)
  // -------------------------------------------------------------
  if (!roomState) {
    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        {/* Navigation Back Link */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onBackToModeSelect}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            ← Back to Mode Select
          </button>
          <span className="badge badge-cyan" style={{ fontSize: '0.74rem' }}>
            Multi-Device Protocol
          </span>
        </div>

        {/* Tab Toggle (Create vs Join) */}
        <div style={{
          display: 'flex',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '6px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('create'); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.95rem',
              background: activeTab === 'create' ? '#06b6d4' : 'transparent',
              color: activeTab === 'create' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'create' ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Create New Room
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('join'); }}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              fontWeight: 800,
              fontSize: '0.95rem',
              background: activeTab === 'join' ? '#06b6d4' : 'transparent',
              color: activeTab === 'join' ? '#ffffff' : 'var(--text-muted)',
              boxShadow: activeTab === 'join' ? '0 0 15px rgba(6, 182, 212, 0.4)' : 'none',
              transition: 'all 0.2s ease',
            }}
          >
            Join Existing Room
          </button>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.14)',
            border: '1.5px solid #f43f5e',
            color: '#fb7185',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Container */}
        <div className="glass-panel" style={{ padding: '32px 28px' }}>
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                  Host Operative Name:
                </label>
                <input
                  type="text"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  placeholder="Enter your codename"
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>

              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)',
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                ℹ️ As room host, you will generate a unique room code to invite friends across their own phones or computers. You will also control game settings, categories, and timers.
              </div>

              <button
                type="submit"
                className="btn-launch"
                style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 800, marginTop: '8px' }}
              >
                <span>Launch Secret Room</span>
                <ArrowRight size={20} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleJoinRoom} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                  Secret Room Code:
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A58291, K92014, Z10482"
                  maxLength={6}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    letterSpacing: '0.06em',
                    fontFamily: 'monospace',
                    textTransform: 'uppercase',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                  Your Operative Codename:
                </label>
                <input
                  type="text"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  placeholder="e.g. Shadow, Phoenix, Maya"
                  required
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)', fontSize: '1rem', fontWeight: 600 }}
                />
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ padding: '16px', fontSize: '1.05rem', fontWeight: 800, marginTop: '8px', background: '#06b6d4' }}
              >
                <span>Connect to Mission Room</span>
                <Globe size={20} />
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: IN ROOM LOBBY
  // -------------------------------------------------------------
  if (roomState.phase === 'lobby') {
    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Room Header & Telemetry Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '20px 28px',
          borderRadius: 'var(--radius-xl)',
          border: '1.5px solid rgba(6, 182, 212, 0.35)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                Online Custom Room
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Host: <strong>{roomState.hostName}</strong>
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '0.08em', color: '#38bdf8' }}>
                {roomState.code}
              </span>
              <button
                onClick={handleCopyLink}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem', gap: '6px' }}
                title="Copy Room Link"
              >
                {copiedLink ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                <span>{copiedLink ? 'Copied Link!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Live WebRTC Voice Bar */}
            <button
              onClick={handleToggleVoice}
              className="btn-secondary"
              style={{
                padding: '10px 18px',
                fontSize: '0.88rem',
                gap: '8px',
                borderColor: voiceState.hasPermission && !voiceState.isMuted ? '#10b981' : 'var(--border-glass)',
                background: voiceState.hasPermission && !voiceState.isMuted ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: voiceState.hasPermission && !voiceState.isMuted ? '#34d399' : 'var(--text-secondary)',
              }}
            >
              {voiceState.hasPermission && !voiceState.isMuted ? <Mic size={17} /> : <MicOff size={17} />}
              <span>{voiceState.hasPermission ? (voiceState.isMuted ? 'Mic Muted' : 'Live Mic Active') : 'Enable Voice Chat'}</span>
            </button>

            {/* In-Game Text Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="btn-secondary"
              style={{
                padding: '10px 16px',
                fontSize: '0.88rem',
                gap: '8px',
                background: 'rgba(6, 182, 212, 0.12)',
                borderColor: '#06b6d4',
                color: '#38bdf8',
              }}
              title="Open In-Game Text Chat"
            >
              <MessageSquare size={17} />
              <span>Chat ({roomState.chatMessages?.length || 0})</span>
            </button>

            {/* Audio & Game Settings Gear Button */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-secondary"
              style={{ padding: '10px 14px', fontSize: '0.88rem' }}
              title="Settings"
            >
              <Settings size={17} />
            </button>

            <button
              onClick={handleLeaveRoom}
              className="btn-secondary"
              style={{ padding: '10px 16px', fontSize: '0.88rem', color: '#fb7185', borderColor: 'rgba(244, 63, 94, 0.3)' }}
            >
              <LogOut size={16} />
              <span>Leave</span>
            </button>
          </div>
        </div>

        {/* Live Audio Visualizer Bar if Mic Enabled */}
        {voiceState.hasPermission && !voiceState.isMuted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#34d399', fontWeight: 600 }}>
              <Radio size={16} />
              <span>WebRTC Voice Active — Speaking to Room</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {[1, 2, 3, 4, 5, 6].map((bar) => {
                const height = voiceState.isSpeaking ? Math.min(24, Math.max(6, (voiceState.currentVolume / 100) * 28 * (bar * 0.4))) : 6;
                return (
                  <div
                    key={bar}
                    style={{
                      width: '4px',
                      height: `${height}px`,
                      background: voiceState.isSpeaking ? '#10b981' : 'rgba(16, 185, 129, 0.4)',
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.14)',
            border: '1.5px solid #f43f5e',
            color: '#fb7185',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
          }}>
            <AlertCircle size={18} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 2-Column Lobby Content */}
        <div className="layout-grid-2col">
          {/* Left Column: Connected Operatives Roster */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                Connected Operatives ({uniquePlayers.length})
              </h4>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>
                Ready
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {uniquePlayers.map((player, idx) => {
                const colorMeta = AGENT_COLORS[idx % AGENT_COLORS.length];
                const isMe = player.id === myPlayerId;

                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isMe ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                      border: isMe ? '1.5px solid #06b6d4' : '1px solid var(--border-glass)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: colorMeta.bg,
                        border: `1.5px solid ${colorMeta.border}`,
                        color: colorMeta.text,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                      }}>
                        {player.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.94rem', color: isMe ? '#ffffff' : 'var(--text-primary)' }}>
                          {player.name}
                        </span>
                        {isMe && (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(6, 182, 212, 0.25)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                            YOU
                          </span>
                        )}
                        {player.isHost && (
                          <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontWeight: 800 }}>
                            <Crown size={12} /> Host
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Host Kick Action */}
                      {isHost && !player.isHost && (
                        <button
                          onClick={() => multiplayerSocket.kickPlayer(player.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            padding: '4px',
                            cursor: 'pointer',
                          }}
                          title={`Kick ${player.name}`}
                        >
                          <UserMinus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Host Controls & Deployment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '24px 28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Clock size={18} color="#06b6d4" />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff' }}>
                  Mission Configuration
                </h4>
              </div>

              {/* Turn Duration */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                  Turn Clue Timer:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[15, 30, 45, 60].map((sec) => (
                    <button
                      key={sec}
                      disabled={!isHost}
                      onClick={() => multiplayerSocket.updateSettings({ turnDuration: sec })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        background: roomState.settings.turnDuration === sec ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                        color: roomState.settings.turnDuration === sec ? '#ffffff' : 'var(--text-secondary)',
                        border: roomState.settings.turnDuration === sec ? '1.5px solid #06b6d4' : '1px solid var(--border-glass)',
                        cursor: isHost ? 'pointer' : 'default',
                      }}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
              </div>

              {/* Undercover Count */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 700 }}>
                  Undercover Infiltrators:
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      disabled={!isHost}
                      onClick={() => multiplayerSocket.updateSettings({ undercovers: num })}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        background: roomState.settings.undercovers === num ? '#f43f5e' : 'rgba(255, 255, 255, 0.05)',
                        color: roomState.settings.undercovers === num ? '#ffffff' : 'var(--text-secondary)',
                        border: roomState.settings.undercovers === num ? '1.5px solid #f43f5e' : '1px solid var(--border-glass)',
                        cursor: isHost ? 'pointer' : 'default',
                      }}
                    >
                      {num} {num === 1 ? 'Agent' : 'Agents'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mr White Bonus Role */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-glass)',
              }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>Mystery Role: Mr. White</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Receives no word; wins on correct bluff guess</div>
                </div>
                <button
                  disabled={!isHost}
                  onClick={() => multiplayerSocket.updateSettings({ hasMrWhite: !roomState.settings.hasMrWhite })}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    background: roomState.settings.hasMrWhite ? '#a855f7' : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    border: 'none',
                    cursor: isHost ? 'pointer' : 'default',
                  }}
                >
                  {roomState.settings.hasMrWhite ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Launch / Wait Button */}
            {isHost ? (
              <button
                onClick={handleStartMission}
                className="btn-launch"
                style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 800 }}
              >
                <span>Deploy Online Mission</span>
                <Play size={20} />
              </button>
            ) : (
              <div style={{
                background: 'rgba(15, 23, 42, 0.85)',
                border: '1.5px solid var(--border-glass)',
                padding: '18px',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                fontSize: '0.92rem',
                color: 'var(--text-secondary)',
              }}>
                ⏳ Waiting for Host (<strong>{roomState.hostName}</strong>) to deploy the mission...
              </div>
            )}
          </div>
        </div>

        {/* In-Game Text Chat Drawer */}
        <InGameChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={roomState.chatMessages || []}
          currentUserId={myPlayerId || ''}
          currentUserName={myPlayer?.name || 'Agent'}
          onSendMessage={(txt) => multiplayerSocket.sendChatMessage(txt)}
          gameThemeColor="#06b6d4"
        />

        {/* Audio & Game Settings Modal */}
        <GameSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          accentColor="#06b6d4"
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: ONLINE BRIEFING PHASE (Private View on Your Own Device)
  // -------------------------------------------------------------
  if (roomState.phase === 'briefing') {
    const roleInfo = (myPlayer && myPlayer.role) ? ROLE_INFO[myPlayer.role] || ROLE_INFO[ROLES.CIVILIAN] : ROLE_INFO[ROLES.CIVILIAN];

    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '640px', margin: '0 auto', width: '100%' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '16px 24px',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-glass)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>
              Private Device View
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Room: {roomState.code}
            </span>
          </div>
          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399' }}>
            Operative: {myPlayer?.name}
          </span>
        </div>

        <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 18px',
            borderRadius: 'var(--radius-full)',
            background: roleInfo.bg,
            border: `1.5px solid ${roleInfo.border}`,
            color: roleInfo.color,
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '16px',
          }}>
            {myPlayer?.role === ROLES.CIVILIAN && <Shield size={16} />}
            {myPlayer?.role === ROLES.UNDERCOVER && <EyeOff size={16} />}
            {myPlayer?.role === ROLES.MR_WHITE && <HelpCircle size={16} />}
            <span>{roleInfo.name}</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
            Your Secret Identity Word
          </div>

          {myPlayer?.role !== ROLES.MR_WHITE ? (
            <div style={{
              fontSize: '2.8rem',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '0.03em',
              margin: '0 0 16px',
              textShadow: `0 0 25px ${roleInfo.color}66`,
            }}>
              {myPlayer?.word}
            </div>
          ) : (
            <div style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#c084fc',
              margin: '0 0 16px',
            }}>
              ❓ NO WORD ASSIGNED ❓
            </div>
          )}

          <p style={{ fontSize: '0.92rem', color: '#CBD5E1', maxWidth: '460px', margin: '0 auto 28px', lineHeight: 1.55 }}>
            {roleInfo.description}
          </p>

          {!myPlayer?.hasViewedSecret ? (
            <button
              onClick={() => {
                sounds.playPeek();
                if (myPlayerId) {
                  multiplayerSocket.markSecretViewed(myPlayerId);
                }
              }}
              className="btn-launch"
              style={{ padding: '15px 36px', fontSize: '1.05rem', fontWeight: 800 }}
            >
              <span>I Know My Secret — Ready</span>
              <Check size={18} />
            </button>
          ) : (
            <div style={{ fontSize: '0.9rem', color: '#34d399', fontWeight: 700 }}>
              ✓ Secret verified! Waiting for other operatives to confirm...
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 4: ONLINE CLUES / INTERROGATION PHASE
  // -------------------------------------------------------------
  if (roomState.phase === 'turn') {
    const alivePlayers = roomState.players.filter((p) => p.isAlive);
    const currentSpeaker = alivePlayers[roomState.activeTurnIndex] || alivePlayers[0];
    const isMyTurn = currentSpeaker?.id === myPlayerId;
    const speakerColor = AGENT_COLORS[roomState.activeTurnIndex % AGENT_COLORS.length];

    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span className="badge badge-emerald" style={{ marginBottom: '6px' }}>
              Online Round {roomState.round}
            </span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff' }}>
              Live Clue & Voice Interrogation
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Mic Button */}
            <button
              onClick={handleToggleVoice}
              className="btn-secondary"
              style={{
                padding: '8px 16px',
                fontSize: '0.85rem',
                borderColor: voiceState.hasPermission && !voiceState.isMuted ? '#10b981' : 'var(--border-glass)',
                color: voiceState.hasPermission && !voiceState.isMuted ? '#34d399' : 'var(--text-secondary)',
              }}
            >
              {voiceState.hasPermission && !voiceState.isMuted ? <Mic size={16} /> : <MicOff size={16} />}
              <span>{voiceState.hasPermission ? (voiceState.isMuted ? 'Muted' : 'Speaking') : 'Enable Mic'}</span>
            </button>

            <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              Room: <strong>{roomState.code}</strong>
            </span>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="layout-grid-2col">
          {/* Active Speaker Spotlight */}
          <div className="glass-panel" style={{
            textAlign: 'center',
            padding: '36px 28px',
            background: 'rgba(15, 23, 42, 0.92)',
            border: `2px solid ${speakerColor.border}`,
            boxShadow: `0 0 35px ${speakerColor.border}44`,
          }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: speakerColor.bg,
              border: `3px solid ${speakerColor.border}`,
              color: speakerColor.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.2rem',
              fontWeight: 900,
              boxShadow: `0 0 30px ${speakerColor.border}55`,
              margin: '0 auto 16px',
            }}>
              {currentSpeaker?.name.charAt(0).toUpperCase()}
            </div>

            <span style={{ fontSize: '0.82rem', color: speakerColor.text, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>
              {isMyTurn ? '🎙️ YOUR TURN TO SPEAK' : 'CURRENT SPEAKER'}
            </span>
            <h3 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 14px' }}>
              {currentSpeaker?.name}
            </h3>

            <p style={{ fontSize: '0.92rem', color: '#CBD5E1', maxWidth: '420px', margin: '0 auto 24px', lineHeight: 1.55 }}>
              {isMyTurn
                ? 'Unmute your mic and speak your clue aloud to the room. When finished, tap "Clue Given" below.'
                : 'Listen carefully to the clue spoken over voice chat. Detect any signs of infiltration!'}
            </p>

            {/* Advance Button (Speaker or Host) */}
            {(isMyTurn || isHost) && (
              <button
                onClick={() => {
                  sounds.playTap();
                  multiplayerSocket.advanceTurn();
                }}
                style={{
                  background: speakerColor.border,
                  color: '#ffffff',
                  padding: '16px 36px',
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: `0 4px 20px ${speakerColor.border}66`,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span>Clue Given — Next Operative</span>
                <ArrowRight size={20} />
              </button>
            )}
          </div>

          {/* Turn Order Tracker */}
          <div className="glass-panel" style={{ padding: '24px 28px' }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#ffffff', marginBottom: '16px' }}>
              Speaking Order Tracker
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {alivePlayers.map((player, idx) => {
                const isCurrent = idx === roomState.activeTurnIndex;
                const isDone = roomState.completedTurns.includes(player.id);
                const colorMeta = AGENT_COLORS[idx % AGENT_COLORS.length];

                return (
                  <div
                    key={player.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isCurrent ? colorMeta.bg : 'rgba(255, 255, 255, 0.04)',
                      border: isCurrent ? `1.5px solid ${colorMeta.border}` : '1px solid var(--border-glass)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: isCurrent ? '#ffffff' : 'var(--text-primary)' }}>
                        {idx + 1}. {player.name}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isDone && <span style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 700 }}>✓ Spoken</span>}
                      {isCurrent && (
                        <span style={{ background: colorMeta.bg, color: colorMeta.text, border: `1px solid ${colorMeta.border}`, padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 800 }}>
                          Speaking Now
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 5: ONLINE VOTING PHASE (Private Device Ballot)
  // -------------------------------------------------------------
  if (roomState.phase === 'vote') {
    const alivePlayers = roomState.players.filter((p) => p.isAlive);
    const hasVoted = Boolean(myPlayerId && roomState.votes[myPlayerId]);

    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '32px 28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(244, 63, 94, 0.15)',
            border: '2px solid #f43f5e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fb7185',
          }}>
            <Flame size={28} />
          </div>

          <h3 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#E2E8F0', marginBottom: '8px' }}>
            Elimination Ballot
          </h3>
          <p style={{ fontSize: '0.92rem', color: '#CBD5E1', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.55 }}>
            Cast your secret vote on your device for the operative you suspect is Undercover or Mr. White.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {alivePlayers.map((player) => {
              const isSelected = Boolean(myPlayerId && roomState.votes[myPlayerId] === player.id);
              const isMe = player.id === myPlayerId;

              return (
                <button
                  key={player.id}
                  disabled={hasVoted}
                  onClick={() => {
                    sounds.playTap();
                    if (myPlayerId) {
                      multiplayerSocket.castVote(myPlayerId, player.id);
                    }
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    background: isSelected ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected ? '2px solid #f43f5e' : '1px solid var(--border-glass)',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: '1rem',
                    cursor: hasVoted ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{player.name} {isMe ? '(You)' : ''}</span>
                  {isSelected && <Check size={18} color="#f43f5e" />}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Votes cast: {Object.keys(roomState.votes).length} of {alivePlayers.length}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW 6: ONLINE GAMEOVER / DEBRIEF PHASE
  // -------------------------------------------------------------
  if (roomState.phase === 'gameover') {
    return (
      <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px', margin: '0 auto', width: '100%' }}>
        <div className="glass-panel" style={{ textAlign: 'center', padding: '36px 28px' }}>
          <Trophy size={48} color="#34d399" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
            {roomState.outcome?.winner === 'civilians' ? 'CIVILIANS TRIUMPH!' : 'INFILTRATORS PREVAIL!'}
          </h3>
          <p style={{ fontSize: '0.95rem', color: '#CBD5E1', marginBottom: '24px' }}>
            {roomState.outcome?.reason}
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            {isHost && (
              <button
                onClick={handleStartMission}
                className="btn-launch"
                style={{ padding: '14px 28px' }}
              >
                Deploy Next Mission
              </button>
            )}
            <button
              onClick={handleLeaveRoom}
              className="btn-secondary"
              style={{ padding: '14px 24px' }}
            >
              Exit to Lobby
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
