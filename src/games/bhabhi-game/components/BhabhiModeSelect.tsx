import { useState } from 'react';
import {
  Bot,
  Globe,
  Smartphone,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import type { UserProfile } from '../../../types/sso';
import { bhabhiSounds } from '../utils/sound';

export interface BhabhiModeSelectProps {
  onStartSolo: () => void;
  onHostOnlineRoom: (hostName: string) => void;
  onJoinOnlineRoom: (roomCode: string, playerName: string) => void;
  onOpenRules: () => void;
  onBackToHub: () => void;
  ssoUser?: UserProfile;
}

export default function BhabhiModeSelect({
  onStartSolo,
  onHostOnlineRoom,
  onJoinOnlineRoom,
  onOpenRules,
  onBackToHub,
  ssoUser,
}: BhabhiModeSelectProps) {
  const [joinCode, setJoinCode] = useState('');
  const [playerName, setPlayerName] = useState(ssoUser?.displayName || ssoUser?.username || 'Card Operative');
  const [isJoinActive, setIsJoinActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setErrorMsg('Please enter a 6-character room code.');
      return;
    }
    bhabhiSounds.playTap();
    onJoinOnlineRoom(joinCode.trim().toUpperCase(), playerName);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        padding: '32px 16px 64px',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Top Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginBottom: '28px',
        }}
      >
        <button
          type="button"
          onClick={onBackToHub}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            padding: '8px 14px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Fun With Dost Yaar</span>
        </button>

        <button
          type="button"
          onClick={onOpenRules}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.84rem',
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <BookOpen size={16} />
          <span>Game Rules & Guide</span>
        </button>
      </div>

      {/* Hero Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '4px 12px',
            borderRadius: '999px',
            marginBottom: '12px',
          }}
        >
          <Sparkles size={13} />
          <span>Traditional Indian Card Game • Get Away / Thoko</span>
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
            fontWeight: 900,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            margin: '0 0 10px',
            textShadow: '0 0 30px rgba(16, 185, 129, 0.35)',
          }}
        >
          BHABHI
        </h1>

        <p
          style={{
            fontSize: '1rem',
            color: '#94a3b8',
            maxWidth: '560px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          The classic evasion card game where everyone wins by shedding cards,
          and the last player holding cards becomes the <strong>Bhabhi</strong>!
        </p>
      </div>

      {/* Player Display Name Field */}
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          marginBottom: '32px',
          background: 'rgba(15, 23, 42, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <label
            htmlFor="player-name-input"
            style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}
          >
            Your Operative Name
          </label>
          <input
            id="player-name-input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            maxLength={20}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '0.98rem',
              fontWeight: 800,
              outline: 'none',
              marginTop: '2px',
            }}
          />
        </div>
      </div>

      {/* Mode Selection Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          width: '100%',
          marginBottom: '32px',
        }}
      >
        {/* CARD 1: Solo vs Smart Bots */}
        <div
          className="glass-panel card-interactive"
          onClick={() => {
            bhabhiSounds.playTap();
            onStartSolo();
          }}
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '24px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'all 0.25s ease',
          }}
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                marginBottom: '18px',
              }}
            >
              <Bot size={26} />
            </div>

            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#34d399',
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}
            >
              INSTANT PRACTICE
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
              Solo vs AI Bots
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 20px' }}>
              Jump straight into a 4-player game against intelligent AI bots (Kabir, Simran, Arjun).
              Zero waiting time.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#34d399' }}>
              Play Now
            </span>
            <ArrowRight size={18} color="#34d399" />
          </div>
        </div>

        {/* CARD 2: Online Multiplayer Custom Room */}
        <div
          className="glass-panel"
          style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1.5px solid rgba(56, 189, 248, 0.4)',
            borderRadius: '24px',
            padding: '28px 24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.25s ease',
          }}
        >
          <div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                marginBottom: '18px',
              }}
            >
              <Globe size={26} />
            </div>

            <div
              style={{
                fontSize: '0.76rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '0.04em',
                marginBottom: '6px',
              }}
            >
              REAL-TIME ROOMS
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', margin: '0 0 8px' }}>
              Online Multiplayer
            </h3>

            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.55, margin: '0 0 20px' }}>
              Host or join a custom room. Play with 3 to 6 friends across phones, laptops, and Wi-Fi networks.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                bhabhiSounds.playTap();
                onHostOnlineRoom(playerName);
              }}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                border: 'none',
                color: '#ffffff',
                padding: '11px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <span>Host New Room</span>
              <ArrowRight size={16} />
            </button>

            {!isJoinActive ? (
              <button
                type="button"
                onClick={() => setIsJoinActive(true)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#cbd5e1',
                  padding: '10px',
                  borderRadius: '12px',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Join with Room Code
              </button>
            ) : (
              <form onSubmit={handleJoin} style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <input
                  type="text"
                  placeholder="CODE (e.g. 8K2M9P)"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{
                    flex: 1,
                    background: '#0f172a',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '10px',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    outline: 'none',
                    textAlign: 'center',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#38bdf8',
                    border: 'none',
                    color: '#0f172a',
                    padding: '8px 16px',
                    borderRadius: '10px',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Join
                </button>
              </form>
            )}

            {errorMsg && (
              <span style={{ fontSize: '0.74rem', color: '#f87171', textAlign: 'center' }}>
                {errorMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
