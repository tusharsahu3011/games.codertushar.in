import { useState, useEffect } from 'react';
import {
  Clock,
  Pause,
  Play,
  AlertTriangle,
  Compass,
  HelpCircle,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Users,
  Search,
  MessageSquare,
} from 'lucide-react';
import type { SpyfallPlayer, SpyfallLocation, SpyfallSettings } from '../types';
import { spySounds } from '../utils/sound';
import LocationReferenceModal from './LocationReferenceModal';

export interface SpyfallInterrogationScreenProps {
  players: SpyfallPlayer[];
  secretLocation: SpyfallLocation;
  settings: SpyfallSettings;
  onAccusePlayer: (accused: SpyfallPlayer) => void;
  onSpyGuessLocation: () => void;
  onTimeExpired: () => void;
  onAbortGame: () => void;
}

const SAMPLE_QUESTIONS = [
  'What is the dress code or uniform at this location?',
  'What does the ambient air smell or feel like here?',
  'How did you travel to arrive at this location today?',
  'Are there armed guards or security checkpoints around?',
  'What is the noise level like in this environment?',
  'How much money did you spend to be here right now?',
  'Is it dangerous or safe for children here?',
  'What kind of food or drinks are served here?',
];

export default function SpyfallInterrogationScreen({
  players,
  secretLocation,
  settings,
  onAccusePlayer,
  onSpyGuessLocation,
  onTimeExpired,
  onAbortGame,
}: SpyfallInterrogationScreenProps) {
  const initialDuration = settings.roundDurationSeconds || 420;
  const [timeLeft, setTimeLeft] = useState<number>(initialDuration);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isLocationMatrixOpen, setIsLocationMatrixOpen] = useState<boolean>(false);
  const [firstQuestioner, setFirstQuestioner] = useState<SpyfallPlayer>(() => {
    const randomIndex = Math.floor(Math.random() * players.length);
    return players[randomIndex];
  });
  const [activeInterrogator, setActiveInterrogator] = useState<SpyfallPlayer>(firstQuestioner);
  const [selectedAccuseTarget, setSelectedAccuseTarget] = useState<SpyfallPlayer | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (initialDuration === 0) return; // Untimed mode
    if (isPaused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          spySounds.playAlarm();
          onTimeExpired();
          return 0;
        }
        if (prev === 60 || prev === 30 || prev === 10) {
          spySounds.playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, initialDuration, onTimeExpired]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = initialDuration > 0 ? (timeLeft / initialDuration) * 100 : 100;

  return (
    <div style={{
      maxWidth: '960px',
      margin: '0 auto',
      padding: '20px 16px 80px',
    }}>
      {/* Top Bar with Cancel & Matrix Quick Link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          onClick={() => {
            spySounds.playTap();
            onAbortGame();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            fontSize: '0.82rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Abort Mission
        </button>

        <button
          onClick={() => {
            spySounds.playSelect();
            setIsLocationMatrixOpen(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            color: '#38bdf8',
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Compass size={16} />
          <span>Location Matrix (Cheatsheet)</span>
        </button>
      </div>

      {/* Hero Interrogation Clock */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(10, 15, 30, 0.98) 100%)',
        border: '1.5px solid rgba(6, 182, 212, 0.35)',
        borderRadius: '24px',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.15)',
        marginBottom: '28px',
      }}>
        {/* Status Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 14px',
          borderRadius: '999px',
          background: isPaused ? 'rgba(234, 179, 8, 0.15)' : 'rgba(6, 182, 212, 0.15)',
          border: isPaused ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(6, 182, 212, 0.4)',
          color: isPaused ? '#facc15' : '#38bdf8',
          fontSize: '0.78rem',
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: '16px',
        }}>
          <Clock size={14} />
          <span>{isPaused ? 'CLOCK PAUSED' : 'TACTICAL QUESTIONING IN PROGRESS'}</span>
        </div>

        {/* Digital Time Counter */}
        <div style={{
          fontSize: 'clamp(3.4rem, 8vw, 5.2rem)',
          fontWeight: 900,
          fontFamily: 'monospace',
          color: timeLeft <= 60 && initialDuration > 0 ? '#f43f5e' : '#ffffff',
          letterSpacing: '0.04em',
          lineHeight: 1,
          marginBottom: '16px',
          textShadow: timeLeft <= 60 && initialDuration > 0
            ? '0 0 25px rgba(244, 63, 94, 0.6)'
            : '0 0 25px rgba(6, 182, 212, 0.4)',
        }}>
          {initialDuration === 0 ? '∞:∞' : formatTime(timeLeft)}
        </div>

        {/* Timer Progress Bar */}
        {initialDuration > 0 && (
          <div style={{
            width: '100%',
            maxWidth: '400px',
            height: '6px',
            borderRadius: '3px',
            background: 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            marginBottom: '20px',
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: timeLeft <= 60 ? '#f43f5e' : 'linear-gradient(90deg, #06b6d4, #38bdf8)',
              transition: 'width 1s linear',
            }} />
          </div>
        )}

        {/* Timer Controls & First Questioner Prompt */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {initialDuration > 0 && (
            <button
              onClick={() => {
                spySounds.playTap();
                setIsPaused(!isPaused);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {isPaused ? <Play size={15} /> : <Pause size={15} />}
              <span>{isPaused ? 'Resume Clock' : 'Pause Clock'}</span>
            </button>
          )}

          {/* First Questioner Spotlight */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.1)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '0.85rem',
            color: '#e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <Sparkles size={15} color="#38bdf8" />
            <span>
              First Question: <strong style={{ color: '#38bdf8' }}>{firstQuestioner.name}</strong> asks anyone!
            </span>
          </div>
        </div>
      </div>

      {/* Two High-Stakes Action Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        {/* Accuse Suspect */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1.5px solid rgba(239, 68, 68, 0.35)',
          borderRadius: '18px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={20} color="#f87171" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Accuse a Suspect
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.45 }}>
              Think you caught the Spy slipping up? Call an emergency tribunal vote against any operative below.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <select
              onChange={(e) => {
                const target = players.find((p) => p.id === e.target.value) || null;
                setSelectedAccuseTarget(target);
              }}
              value={selectedAccuseTarget?.id || ''}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
              }}
            >
              <option value="" style={{ background: '#0f172a' }}>Select Suspect to Accuse...</option>
              {players.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              disabled={!selectedAccuseTarget}
              onClick={() => {
                if (selectedAccuseTarget) {
                  spySounds.playAlarm();
                  onAccusePlayer(selectedAccuseTarget);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: selectedAccuseTarget ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255, 255, 255, 0.05)',
                border: selectedAccuseTarget ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                color: selectedAccuseTarget ? '#ffffff' : '#64748b',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: selectedAccuseTarget ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: selectedAccuseTarget ? '0 6px 18px rgba(239, 68, 68, 0.4)' : 'none',
              }}
            >
              <AlertTriangle size={16} />
              <span>Launch Accusation Tribunal</span>
            </button>
          </div>
        </div>

        {/* Spy: Halt & Guess */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1.5px solid rgba(244, 63, 94, 0.35)',
          borderRadius: '18px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={20} color="#fb7185" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                The Spy: Stop & Guess
              </h3>
            </div>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0 0 16px', lineHeight: 1.45 }}>
              Are you the Spy and have figured out where everyone is? Stop the game and guess the location to win immediately!
            </p>
          </div>

          <button
            onClick={() => {
              spySounds.playDramaticSting();
              onSpyGuessLocation();
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #f43f5e, #be123c)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 18px rgba(244, 63, 94, 0.4)',
            }}
          >
            <span>🕵️ I Am the Spy — Guess Location</span>
          </button>
        </div>
      </div>

      {/* Operative Roster Strip */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.7)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '18px',
        padding: '20px',
        marginBottom: '28px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              Operative Roster ({players.length})
            </h3>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Tap suspect to select for accusation
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
        }}>
          {players.map((p, idx) => {
            const isSelected = selectedAccuseTarget?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  spySounds.playTap();
                  setSelectedAccuseTarget(isSelected ? null : p);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 900,
                  color: '#ffffff',
                }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    color: isSelected ? '#fca5a5' : '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {p.name}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested Questions Drawer */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '18px',
        padding: '18px 20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px',
        }}>
          <MessageSquare size={16} color="#06b6d4" />
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#e2e8f0', margin: 0 }}>
            Tactical Question Inspiration (For Operatives & Spies)
          </h4>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '8px',
        }}>
          {SAMPLE_QUESTIONS.map((q, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '0.8rem',
                color: '#94a3b8',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}
            >
              💬 "{q}"
            </div>
          ))}
        </div>
      </div>

      {/* Location Reference Modal */}
      <LocationReferenceModal
        isOpen={isLocationMatrixOpen}
        onClose={() => setIsLocationMatrixOpen(false)}
      />
    </div>
  );
}
