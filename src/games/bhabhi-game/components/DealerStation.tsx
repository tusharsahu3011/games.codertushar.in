import React, { useEffect, useState } from 'react';
import { GameState, GameStatus } from '../types';
import { Volume2, VolumeX, Sparkles, MessageCircle } from 'lucide-react';

export interface DealerStationProps {
  gameState: GameState;
  myPlayerId: string;
}

export default function DealerStation({ gameState, myPlayerId }: DealerStationProps) {
  const [commentary, setCommentary] = useState<string>(
    'Welcome to the table! Let\'s see who leads with the Ace of Spades (A♠).'
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fwd_dealer_voice') === 'true';
    } catch {
      return false;
    }
  });

  const { activeTrick, currentTurnPlayerId, firstRound, lastCompletedTrick, status, winnerOrder, loserId } = gameState;

  // Speak commentary using Web Speech API if enabled
  const speakCommentary = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.15; // Pleasant friendly tone
      // Attempt to pick a female voice if available
      const voices = window.speechSynthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes('female') ||
          v.name.toLowerCase().includes('zira') ||
          v.name.toLowerCase().includes('samantha') ||
          v.name.toLowerCase().includes('google uk english female')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  // Dynamic context engine updating Dealer Riya's witty commentary
  useEffect(() => {
    if (status === GameStatus.LOBBY) {
      const msg = 'Waiting for players to take their seats. Game starts soon!';
      setCommentary(msg);
      return;
    }

    if (status === GameStatus.FINISHED) {
      const loser = gameState.players.find((p) => p.id === loserId);
      const loserName = loser ? (loser.id === myPlayerId ? 'You' : loser.name) : 'Someone';
      const msg = `Match completed! ${loserName} got caught holding the cards and is our BHABHI! 🃏`;
      setCommentary(msg);
      speakCommentary(msg);
      return;
    }

    // Check Thoko penalty
    if (lastCompletedTrick && lastCompletedTrick.reason === 'thoko') {
      const elapsed = Date.now() - lastCompletedTrick.completedAt;
      if (elapsed < 2400) {
        const penaltyName = lastCompletedTrick.penaltyPlayerName || 'A player';
        const msg = `💥 OUCH! THOKO! ${penaltyName} picks up all ${lastCompletedTrick.cards.length} penalty cards!`;
        setCommentary(msg);
        speakCommentary(msg);
        return;
      }
    }

    // Check Clean Trick Win
    if (lastCompletedTrick && lastCompletedTrick.reason !== 'thoko') {
      const elapsed = Date.now() - lastCompletedTrick.completedAt;
      if (elapsed < 2400) {
        const winName = lastCompletedTrick.winnerName || 'Winner';
        const msg = `✨ Clean trick! Won by ${winName}. Discarding ${lastCompletedTrick.cards.length} cards!`;
        setCommentary(msg);
        return;
      }
    }

    // Check First Round Ace of Spades requirement
    if (firstRound && activeTrick.cards.length === 0) {
      const starter = gameState.players.find((p) => p.id === currentTurnPlayerId);
      const isMe = currentTurnPlayerId === myPlayerId;
      const msg = isMe
        ? 'You hold the Ace of Spades (A♠)! Play it to open the game!'
        : `${starter?.name || 'A player'} holds the Ace of Spades (A♠) and must lead!`;
      setCommentary(msg);
      speakCommentary(msg);
      return;
    }

    // Active Turn announcement
    const turnPlayer = gameState.players.find((p) => p.id === currentTurnPlayerId);
    if (turnPlayer) {
      if (turnPlayer.id === myPlayerId) {
        const msg = activeTrick.leadSuit
          ? `Your turn! Follow ${activeTrick.leadSuit.toLowerCase()} or play off-suit if you're out!`
          : 'Your turn to lead! Pick your best strategic card.';
        setCommentary(msg);
        speakCommentary(msg);
      } else {
        const msg = `Watching ${turnPlayer.name}'s move...`;
        setCommentary(msg);
      }
    }
  }, [
    currentTurnPlayerId,
    status,
    firstRound,
    activeTrick.cards.length,
    lastCompletedTrick?.completedAt,
    loserId,
  ]);

  const toggleVoice = () => {
    const next = !isVoiceEnabled;
    setIsVoiceEnabled(next);
    try {
      localStorage.setItem('fwd_dealer_voice', String(next));
    } catch {}
    if (next) {
      speakCommentary(commentary);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div
      className="dealer-station"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        maxWidth: '720px',
        margin: '0 auto 8px',
        position: 'relative',
        zIndex: 15,
      }}
    >
      {/* Dealer Avatar & Shoe Graphic */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            padding: '2px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706, #ef4444)',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)',
          }}
        >
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=Riya&hair=long01&hairColor=2c1b18&eyes=variant04&mouth=variant08&skinColor=f2d3b1"
            alt="Dealer Riya"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#0f172a',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              background: '#10b981',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              border: '2px solid #0f172a',
            }}
            title="Dealer Active"
          />
        </div>

        <div
          style={{
            fontSize: '0.66rem',
            fontWeight: 800,
            color: '#fbbf24',
            marginTop: '2px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          Dealer Riya
        </div>
      </div>

      {/* Speech Bubble with Witty Commentary */}
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          border: '1.5px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '16px',
          padding: '8px 14px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '520px',
          position: 'relative',
        }}
      >
        {/* Left pointer notch */}
        <div
          style={{
            position: 'absolute',
            left: '-6px',
            top: '50%',
            transform: 'translateY(-50%) rotate(45deg)',
            width: '10px',
            height: '10px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderLeft: '1.5px solid rgba(245, 158, 11, 0.35)',
            borderBottom: '1.5px solid rgba(245, 158, 11, 0.35)',
          }}
        />

        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: 0,
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#f8fafc',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            {commentary}
          </p>
        </div>

        {/* Voice Speech Toggle */}
        <button
          type="button"
          onClick={toggleVoice}
          title={isVoiceEnabled ? 'Mute Dealer Voice' : 'Enable Dealer Voice Narration'}
          style={{
            background: isVoiceEnabled ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
            border: isVoiceEnabled ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)',
            color: isVoiceEnabled ? '#fbbf24' : '#94a3b8',
            borderRadius: '8px',
            padding: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>
      </div>
    </div>
  );
}
