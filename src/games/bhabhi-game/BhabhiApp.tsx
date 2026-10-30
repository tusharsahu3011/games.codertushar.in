import { useState, useEffect, useCallback, useRef } from 'react';
import type { UserProfile } from '../../types/sso';
import { ssoAuth } from '../../services/ssoAuth';
import { GameStatus } from './types';
import { bhabhiMultiplayer, BhabhiSnapshot } from './utils/multiplayer';
import { bhabhiSounds } from './utils/sound';
import { webrtcVoice, type VoiceSnapshot } from '../undercover-game/utils/webrtcVoice';
import BhabhiModeSelect from './components/BhabhiModeSelect';
import BhabhiLobby from './components/BhabhiLobby';
import BhabhiTable from './components/BhabhiTable';
import CardHand from './components/CardHand';
import RulesModal from './components/RulesModal';
import BhabhiGameOverModal from './components/BhabhiGameOverModal';
import {
  Volume2,
  VolumeX,
  BookOpen,
  ArrowLeft,
  Wifi,
  Sparkles,
  RefreshCw,
  Mic,
  MicOff,
  MessageSquare,
  Settings,
  PlayingCards,
} from 'lucide-react';
import InGameChat from '../../components/common/InGameChat';
import GameSettingsModal from '../../components/common/GameSettingsModal';

export interface BhabhiAppProps {
  initialMode?: 'mode_select' | 'solo' | 'online';
  initialRoomCode?: string;
  onBackToHub?: () => void;
  onSwitchMode?: () => void;
}

export default function BhabhiApp({
  initialMode = 'mode_select',
  initialRoomCode,
  onBackToHub,
  onSwitchMode,
}: BhabhiAppProps) {
  const [snapshot, setSnapshot] = useState<BhabhiSnapshot>(() => bhabhiMultiplayer.getSnapshot());
  const [view, setView] = useState<'mode_select' | 'active_game'>(
    initialRoomCode || initialMode === 'solo' || initialMode === 'online'
      ? 'active_game'
      : 'mode_select'
  );
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(bhabhiSounds.isMuted());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [voiceState, setVoiceState] = useState<VoiceSnapshot>({
    hasPermission: webrtcVoice.hasPermission,
    isMuted: webrtcVoice.isMuted,
    isSpeaking: webrtcVoice.isSpeaking,
    currentVolume: webrtcVoice.currentVolume,
    peerStates: webrtcVoice.peerStates,
  });

  const hasAutoJoinedRef = useRef(false);
  const ssoUser = ssoAuth.user;

  // Subscribe to multiplayer engine
  useEffect(() => {
    const unsubscribe = bhabhiMultiplayer.subscribe((newSnapshot) => {
      setSnapshot(newSnapshot);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to WebRTC voice state
  useEffect(() => {
    const unsubVoice = webrtcVoice.subscribe((v) => {
      setVoiceState(v);
    });
    return () => unsubVoice();
  }, []);

  // Show dynamic toast banner
  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 3200);
  }, []);

  // Auto-join room from URL parameter if provided (guarded against duplicate runs)
  useEffect(() => {
    if (initialRoomCode && !hasAutoJoinedRef.current) {
      hasAutoJoinedRef.current = true;
      const pName = ssoUser.displayName || ssoUser.username || 'Dost Yaar';
      bhabhiMultiplayer
        .joinRoom(initialRoomCode, pName, ssoUser.avatar)
        .then(() => {
          setView('active_game');
        })
        .catch((err) => {
          triggerToast(err.message || 'Failed to join room.');
          setView('mode_select');
        });
    }
  }, [initialRoomCode, ssoUser, triggerToast]);

  // Toggle audio
  const handleToggleMute = () => {
    const muted = bhabhiSounds.toggleMute();
    setIsMuted(muted);
    try {
      localStorage.setItem('fwd_sfx_muted', String(muted));
    } catch {}
  };

  // Toggle Microphone
  const handleToggleMic = async () => {
    if (!voiceState.hasPermission) {
      const res = await webrtcVoice.requestMicrophone();
      if (!res.success) {
        triggerToast('Could not enable microphone. Please check browser permissions.');
        return;
      }
      triggerToast('Microphone enabled & unmuted!');
    } else {
      webrtcVoice.toggleMute();
      triggerToast(webrtcVoice.isMuted ? 'Mic Muted' : 'Mic Live & Active');
    }
  };

  const handleRequestMic = async () => {
    const res = await webrtcVoice.requestMicrophone();
    if (!res.success) {
      triggerToast('Microphone permission denied.');
    } else {
      triggerToast('Microphone connected successfully!');
    }
  };

  // Launch Solo Match vs AI Bots
  const handleStartSolo = async () => {
    bhabhiSounds.playTap();
    const pName = ssoUser.displayName || ssoUser.username || 'Player 1';
    await bhabhiMultiplayer.createRoom(pName, ssoUser.avatar);

    // Add 3 AI Bots for a standard 4-player game
    bhabhiMultiplayer.addBot();
    bhabhiMultiplayer.addBot();
    bhabhiMultiplayer.addBot();

    // Start game immediately
    setTimeout(() => {
      try {
        bhabhiMultiplayer.startGame();
        setView('active_game');
      } catch (e: any) {
        triggerToast(e.message || 'Error starting match');
      }
    }, 150);
  };

  // Host Online Room
  const handleHostOnlineRoom = async (hostName: string) => {
    bhabhiSounds.playTap();
    try {
      await bhabhiMultiplayer.createRoom(hostName, ssoUser.avatar);
      setView('active_game');
    } catch (e: any) {
      triggerToast(e.message || 'Failed to create room');
    }
  };

  // Join Online Room
  const handleJoinOnlineRoom = async (code: string, pName: string) => {
    bhabhiSounds.playTap();
    try {
      await bhabhiMultiplayer.joinRoom(code, pName, ssoUser.avatar);
      setView('active_game');
    } catch (e: any) {
      triggerToast(e.message || 'Failed to join room');
    }
  };

  // Play a card
  const handlePlayCard = (cardId: string) => {
    try {
      bhabhiMultiplayer.playCard(cardId);
    } catch (err: any) {
      triggerToast(err.message || 'Invalid card selection');
    }
  };

  // Exit Room
  const handleLeaveRoom = () => {
    bhabhiMultiplayer.leaveRoom();
    setView('mode_select');
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      url.searchParams.delete('bhabhiroom');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  const room = snapshot.room;
  const myPlayerId = snapshot.myPlayerId || '';
  const myPlayer = snapshot.myPlayer;
  const isHost = snapshot.isHost;

  const isMyTurn = Boolean(
    room &&
    room.status === GameStatus.IN_PROGRESS &&
    room.currentTurnPlayerId === myPlayerId &&
    myPlayer &&
    !myPlayer.isOut
  );

  const prevMyTurnRef = useRef(false);
  useEffect(() => {
    if (isMyTurn && !prevMyTurnRef.current) {
      bhabhiSounds.playYourTurn();
    }
    prevMyTurnRef.current = isMyTurn;
  }, [isMyTurn]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 0%, #06241a 0%, #030712 70%)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* TOP UTILITY HEADER */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          background: 'rgba(15, 23, 42, 0.75)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        {/* Left: Branding & Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={view === 'active_game' ? handleLeaveRoom : onBackToHub}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={15} />
            <span>{view === 'active_game' ? 'Lobby / Exit' : 'Portal Hub'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PlayingCards size={20} color="#f59e0b" />
            <span style={{ fontSize: '1.05rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#ffffff' }}>
              BHABHI
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              GET AWAY
            </span>
          </div>
        </div>

        {/* Center: Toast Message */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 800,
              padding: '5px 16px',
              borderRadius: '999px',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
              animation: 'fadeIn 0.2s ease',
            }}
          >
            {toastMessage}
          </div>
        )}

        {/* Right: Controls (Mic, Sound, Rules, Mode Switcher) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {room?.roomCode && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#38bdf8',
              }}
            >
              <Wifi size={13} />
              <span>ROOM: {room.roomCode}</span>
            </div>
          )}

          {/* WebRTC Live Mic Toggle */}
          <button
            type="button"
            onClick={handleToggleMic}
            title={
              voiceState.hasPermission
                ? voiceState.isMuted
                  ? 'Unmute Microphone'
                  : 'Mute Microphone'
                : 'Enable Live Voice Chat'
            }
            style={{
              background: !voiceState.hasPermission
                ? 'rgba(255, 255, 255, 0.06)'
                : voiceState.isMuted
                ? 'rgba(239, 68, 68, 0.15)'
                : 'rgba(16, 185, 129, 0.18)',
              border: !voiceState.hasPermission
                ? '1px solid rgba(255, 255, 255, 0.1)'
                : voiceState.isMuted
                ? '1px solid rgba(239, 68, 68, 0.4)'
                : '1px solid rgba(16, 185, 129, 0.5)',
              color: !voiceState.hasPermission
                ? '#94a3b8'
                : voiceState.isMuted
                ? '#f87171'
                : '#34d399',
              padding: '7px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              fontWeight: 700,
              transition: 'all 0.15s ease',
            }}
          >
            {voiceState.hasPermission && !voiceState.isMuted ? (
              <Mic size={15} />
            ) : (
              <MicOff size={15} />
            )}
            <span className="hide-mobile">
              {!voiceState.hasPermission
                ? 'Mic Off'
                : voiceState.isMuted
                ? 'Muted'
                : 'Voice Live'}
            </span>
          </button>

          {/* In-Game Text Chat Button */}
          {room && (
            <button
              type="button"
              onClick={() => setIsChatOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#34d399',
                padding: '6px 11px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Open In-Room Text Chat"
            >
              <MessageSquare size={14} />
              <span>Chat ({room.chatMessages?.length || 0})</span>
            </button>
          )}

          {/* Settings Menu Gear Button */}
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              cursor: 'pointer',
            }}
            title="Audio & Game Settings"
          >
            <Settings size={15} />
          </button>

          <button
            type="button"
            onClick={() => setIsRulesOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <BookOpen size={14} />
            <span>Rules</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        {view === 'mode_select' || !room ? (
          <BhabhiModeSelect
            onStartSolo={handleStartSolo}
            onHostOnlineRoom={handleHostOnlineRoom}
            onJoinOnlineRoom={handleJoinOnlineRoom}
            onOpenRules={() => setIsRulesOpen(true)}
            onBackToHub={onBackToHub || (() => {})}
            ssoUser={ssoUser}
          />
        ) : room.status === GameStatus.LOBBY ? (
          <BhabhiLobby
            room={room}
            myPlayerId={myPlayerId}
            isHost={isHost}
            voiceState={voiceState}
            onToggleMic={handleToggleMic}
            onRequestMic={handleRequestMic}
            onStartGame={() => {
              try {
                bhabhiMultiplayer.startGame();
              } catch (e: any) {
                triggerToast(e.message || 'Cannot start game');
              }
            }}
            onAddBot={() => bhabhiMultiplayer.addBot()}
            onRemoveBot={(botId) => bhabhiMultiplayer.removeBot(botId)}
            onLeaveRoom={handleLeaveRoom}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              flex: 1,
              width: '100%',
              padding: '12px 12px 16px',
            }}
          >
            {/* The Poker Card Table (Opponents + Center Trick + Logs) */}
            <BhabhiTable gameState={room} myPlayerId={myPlayerId} />

            {/* Player's Interactive Hand Tray */}
            {myPlayer && (
              <CardHand
                hand={myPlayer.hand}
                gameState={room}
                myPlayerId={myPlayerId}
                isMyTurn={isMyTurn}
                onPlayCard={handlePlayCard}
                onInvalidClick={(reason) => triggerToast(reason)}
              />
            )}

            {/* Game Over Modal when finished */}
            {room.status === GameStatus.FINISHED && (
              <BhabhiGameOverModal
                room={room}
                myPlayerId={myPlayerId}
                isHost={isHost}
                onRematch={() => bhabhiMultiplayer.restartGame()}
                onExit={handleLeaveRoom}
              />
            )}
          </div>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* In-Game Text Chat Drawer */}
      {room && (
        <InGameChat
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          messages={room.chatMessages || []}
          currentUserId={myPlayerId || ''}
          currentUserName={myPlayer?.name || 'Player'}
          onSendMessage={(txt) => bhabhiMultiplayer.sendChat(txt)}
          gameThemeColor="#10b981"
        />
      )}

      {/* Audio & Game Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor="#10b981"
      />
    </div>
  );
}
