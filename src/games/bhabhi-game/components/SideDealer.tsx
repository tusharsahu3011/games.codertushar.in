import { useEffect, useState, useRef } from 'react';
import { GameState, GameStatus } from '../types';
import { Volume2, VolumeX, Sparkles, Bot, MessageSquare } from 'lucide-react';

export interface SideDealerProps {
  gameState: GameState;
  myPlayerId: string;
}

// Engaging Hindi & Hinglish commentary templates
const HINDI_LINES = {
  welcome: [
    'Namaste dosto! Bhabhi shuru hone wala hai. Dekhte hain kaun banta hai aaj ka Bhabhi!',
    'Swagat hai Dost Yaar table par! Saare patte banta chuke hain, dhyan se khelna!',
  ],
  aceOfSpadesMe: [
    'Aapke paas Hukam ka Ikka (A♠) hai! Pehla patta chalo aur khel shuru karo!',
    'Shuruat aapko hi karni hai! Hukam ka Ikka (A♠) fenko table par!',
  ],
  aceOfSpadesOther: (name: string) => [
    `${name} ke paas Hukam ka Ikka (A♠) hai! Chal shuru karo bhai!`,
    `Pehla patta ${name} chalenge. A♠ ka intezaar hai!`,
  ],
  myTurnLead: [
    'Aapki baari hai! Nayi chaal shuru karo, sabko fasaane wala patta phenko!',
    'Leader ban gaye ho! Chalo koi tagda patta phenko!',
    'Aapki lead hai! Aisa rang chalo jisme doosre fas jayein!',
  ],
  myTurnFollow: (suit: string) => [
    `Aapki chaal hai! ${suit} ka patta chalo ya phir Thoko maaro!`,
    `${suit} follow karo! Agar nahi hai toh mauka hai Thoko maarne ka!`,
  ],
  botTurn: (name: string) => [
    `${name} soch rahe hain... Dekhte hain kya chaal aati hai!`,
    `${name} ki baari hai. Dhyan se dekhna!`,
  ],
  thoko: (penaltyPlayer: string, count: number) => [
    `💥 ARRE BAAP RE! THOKO LAG GAYA! ${penaltyPlayer} saare ${count} patte uthao!`,
    `💥 ZABARDAST THOKO! ${penaltyPlayer} ke paas aa gaye ${count} patte!`,
  ],
  cleanTrick: (winner: string) => [
    `✨ Shabash ${winner}! Saaf trick jeet gaye, patte discard pile mein gaye!`,
    `✨ Clean round! ${winner} trick le gaye! Agli chaal chalo!`,
  ],
  gotAway: (name: string) => [
    `🎉 Wah shabash ${name}! Saare patte khatam, bhabhi banne se bach gaye!`,
    `🎉 ${name} nikal gaye! Bhabhi banne ka khatra kam hua!`,
  ],
  bhabhiWinner: (loser: string) => [
    `🃏 KHEL KHATAM! ${loser} ban gaye aaj ke BHABHI! Thoko party kab de rahe ho?`,
    `🃏 Taaliyan bajao dosto! ${loser} pakde gaye aur ban gaye BHABHI!`,
  ],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function SideDealer({ gameState, myPlayerId }: SideDealerProps) {
  const [commentary, setCommentary] = useState<string>(
    'Namaste! Welcome to Bhabhi. Let the game begin!'
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('fwd_dealer_voice') === 'true';
    } catch {
      return false;
    }
  });

  const lastSpokenRef = useRef<string>('');

  const { activeTrick, currentTurnPlayerId, firstRound, lastCompletedTrick, status, loserId } = gameState;

  // Speak commentary using Web Speech API in Hindi (hi-IN)
  const speakHindi = (text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'hi-IN'; // Strict Hindi language tag
      utterance.rate = 1.0;
      utterance.pitch = 1.1;

      // Select female Hindi / Indian voice if available in browser
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('india') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('geeta') ||
          v.name.toLowerCase().includes('swara')
      );
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Trigger contextual commentary on game state transitions
  useEffect(() => {
    let newLine = '';

    if (status === GameStatus.LOBBY) {
      newLine = 'Khiladiyon ka intezaar hai. Khel jaldi shuru hoga!';
    } else if (status === GameStatus.FINISHED) {
      const loser = gameState.players.find((p) => p.id === loserId);
      const loserName = loser ? (loser.id === myPlayerId ? 'Aap' : loser.name) : 'Koi';
      newLine = pickRandom(HINDI_LINES.bhabhiWinner(loserName));
    } else if (lastCompletedTrick && Date.now() - lastCompletedTrick.completedAt < 2400) {
      if (lastCompletedTrick.reason === 'thoko') {
        const penName = lastCompletedTrick.penaltyPlayerName || 'Khiladi';
        newLine = pickRandom(HINDI_LINES.thoko(penName, lastCompletedTrick.cards.length));
      } else {
        const winName = lastCompletedTrick.winnerName || 'Khiladi';
        newLine = pickRandom(HINDI_LINES.cleanTrick(winName));
      }
    } else if (firstRound && activeTrick.cards.length === 0) {
      const isMe = currentTurnPlayerId === myPlayerId;
      if (isMe) {
        newLine = pickRandom(HINDI_LINES.aceOfSpadesMe);
      } else {
        const starter = gameState.players.find((p) => p.id === currentTurnPlayerId);
        newLine = pickRandom(HINDI_LINES.aceOfSpadesOther(starter?.name || 'Khiladi'));
      }
    } else {
      const turnPlayer = gameState.players.find((p) => p.id === currentTurnPlayerId);
      if (turnPlayer) {
        if (turnPlayer.id === myPlayerId) {
          if (!activeTrick.leadSuit) {
            newLine = pickRandom(HINDI_LINES.myTurnLead);
          } else {
            newLine = pickRandom(HINDI_LINES.myTurnFollow(activeTrick.leadSuit));
          }
        } else {
          newLine = pickRandom(HINDI_LINES.botTurn(turnPlayer.name));
        }
      }
    }

    if (newLine && newLine !== lastSpokenRef.current) {
      lastSpokenRef.current = newLine;
      setCommentary(newLine);
      speakHindi(newLine);
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
      speakHindi(commentary);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <aside
      className="side-dealer-station"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        position: 'relative',
        zIndex: 15,
        width: 'clamp(140px, 16vw, 190px)',
        flexShrink: 0,
        userSelect: 'none',
      }}
      aria-label="AI Card Dealer Riya"
    >
      {/* Dealer Persona Visual Representation */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Animated Avatar Frame */}
        <div
          style={{
            position: 'relative',
            width: 'clamp(44px, 5.5vw, 56px)',
            height: 'clamp(44px, 5.5vw, 56px)',
            borderRadius: '50%',
            padding: '2.5px',
            background: isSpeaking
              ? 'linear-gradient(135deg, #10b981, #3b82f6, #f59e0b)'
              : 'linear-gradient(135deg, #f59e0b, #d97706, #ef4444)',
            boxShadow: isSpeaking
              ? '0 0 24px rgba(16, 185, 129, 0.75), 0 4px 14px rgba(0,0,0,0.6)'
              : '0 0 16px rgba(245, 158, 11, 0.45), 0 4px 14px rgba(0,0,0,0.5)',
            transition: 'all 0.3s ease',
          }}
        >
          <img
            src="https://api.dicebear.com/7.x/adventurer/svg?seed=Riya&hair=long01&hairColor=2c1b18&eyes=variant04&mouth=variant08&skinColor=f2d3b1"
            alt="AI Dealer Riya"
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              background: '#0f172a',
            }}
          />

          {/* Speaking Audio Wave Pulse Ring */}
          {isSpeaking && (
            <div
              style={{
                position: 'absolute',
                inset: '-4px',
                borderRadius: '50%',
                border: '2px solid #10b981',
                animation: 'pulse 1.2s infinite',
                pointerEvents: 'none',
              }}
            />
          )}

          {/* Online Dealer Indicator */}
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
            title="Dealer Riya Active"
          />
        </div>

        {/* Dealer Name & Role Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '4px',
          }}
        >
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 900,
              color: '#fbbf24',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}
          >
            Dealer Riya
          </span>
          <span
            style={{
              fontSize: '0.6rem',
              fontWeight: 800,
              background: 'rgba(245, 158, 11, 0.2)',
              color: '#f59e0b',
              padding: '1px 5px',
              borderRadius: '4px',
              border: '1px solid rgba(245, 158, 11, 0.4)',
            }}
          >
            AI
          </span>
        </div>
      </div>

      {/* Dynamic Hindi Speech Bubble */}
      <div
        style={{
          width: '100%',
          background: 'rgba(15, 23, 42, 0.92)',
          border: isSpeaking
            ? '1.5px solid #10b981'
            : '1.5px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '14px',
          padding: '8px 10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          position: 'relative',
          transition: 'border-color 0.25s ease',
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 'clamp(0.72rem, 1.3vw, 0.78rem)',
            fontWeight: 600,
            color: '#f8fafc',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
            textAlign: 'center',
          }}
        >
          {commentary}
        </p>

        {/* Audio Toggle & Language indicator footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            paddingTop: '4px',
            marginTop: '2px',
          }}
        >
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: isSpeaking ? '#34d399' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            {isSpeaking ? (
              <>
                <Sparkles size={10} color="#34d399" />
                <span>Speaking Hindi...</span>
              </>
            ) : (
              <span>Hindi Voice</span>
            )}
          </span>

          <button
            type="button"
            onClick={toggleVoice}
            title={isVoiceEnabled ? 'Mute Hindi Dealer Voice' : 'Enable Hindi Dealer Voice (hi-IN)'}
            style={{
              background: isVoiceEnabled ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255, 255, 255, 0.06)',
              border: isVoiceEnabled ? '1px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.12)',
              color: isVoiceEnabled ? '#fbbf24' : '#94a3b8',
              borderRadius: '6px',
              padding: '3px 6px',
              fontSize: '0.66rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isVoiceEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
            <span>{isVoiceEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
