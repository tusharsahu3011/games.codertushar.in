import React, { useState } from 'react';
import { Eye, Volume2, VolumeX, HelpCircle, RotateCcw, ChevronRight, Check, Layers, Globe, Smartphone, ArrowLeft, Settings, Gamepad2 } from 'lucide-react';
import { sounds } from '../utils/sound';
import type { UserProfile } from '../../../types/sso';
import GameSettingsModal from '../../../components/common/GameSettingsModal';

export interface HeaderProps {
  phase: string;
  round: number;
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onResetGame: () => void;
  gameMode?: 'pass_and_play' | 'online';
  ssoUser?: UserProfile | null;
  onOpenSSOProfile?: () => void;
  onSwitchGameMode?: () => void;
  onBackToHub?: () => void;
}

export default function Header({
  phase,
  round,
  soundMuted,
  onToggleSound,
  onOpenRules,
  onResetGame,
  gameMode = 'pass_and_play',
  ssoUser,
  onOpenSSOProfile,
  onSwitchGameMode,
  onBackToHub,
}: HeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSoundClick = () => {
    sounds.playTap();
    onToggleSound();
  };

  const handleRulesClick = () => {
    sounds.playTap();
    onOpenRules();
  };

  const handleResetClick = () => {
    sounds.playTap();
    if (window.confirm('Are you sure you want to exit the current mission?')) {
      onResetGame();
    }
  };

  const PHASES = [
    {
      id: 'setup',
      label: 'Setup',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.45)',
      activeBg: 'rgba(16, 185, 129, 0.22)',
      activeBorder: 'rgba(16, 185, 129, 0.55)',
      completedBg: 'rgba(16, 185, 129, 0.1)',
      completedBorder: 'rgba(16, 185, 129, 0.3)',
      text: '#34d399',
    },
    {
      id: 'reveal',
      label: 'Briefing',
      color: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.45)',
      activeBg: 'rgba(245, 158, 11, 0.22)',
      activeBorder: 'rgba(245, 158, 11, 0.55)',
      completedBg: 'rgba(245, 158, 11, 0.1)',
      completedBorder: 'rgba(245, 158, 11, 0.3)',
      text: '#fbbf24',
    },
    {
      id: 'turn',
      label: 'Clues',
      color: '#06b6d4',
      glow: 'rgba(6, 182, 212, 0.45)',
      activeBg: 'rgba(6, 182, 212, 0.22)',
      activeBorder: 'rgba(6, 182, 212, 0.55)',
      completedBg: 'rgba(6, 182, 212, 0.1)',
      completedBorder: 'rgba(6, 182, 212, 0.3)',
      text: '#38bdf8',
    },
    {
      id: 'vote',
      label: 'Voting',
      color: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.45)',
      activeBg: 'rgba(244, 63, 94, 0.22)',
      activeBorder: 'rgba(244, 63, 94, 0.55)',
      completedBg: 'rgba(244, 63, 94, 0.1)',
      completedBorder: 'rgba(244, 63, 94, 0.3)',
      text: '#fb7185',
    },
    {
      id: 'gameover',
      label: 'Debrief',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.45)',
      activeBg: 'rgba(168, 85, 247, 0.22)',
      activeBorder: 'rgba(168, 85, 247, 0.55)',
      completedBg: 'rgba(168, 85, 247, 0.1)',
      completedBorder: 'rgba(168, 85, 247, 0.3)',
      text: '#c084fc',
    },
  ];

  const currentPhaseIndex = PHASES.findIndex((p) => p.id === phase);

  return (
    <header style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      paddingBottom: '20px',
      marginBottom: '24px',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      {/* Topmost Portal & SSO Cross-Domain Utility Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '10px',
        fontSize: '0.8rem',
      }}>
        {/* Left side: Back to Central Games Hub */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onBackToHub && (
            <button
              onClick={() => { sounds.playTap(); onBackToHub(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(37, 99, 235, 0.12)',
                border: '1px solid rgba(37, 99, 235, 0.35)',
                color: '#60a5fa',
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.8rem',
                transition: 'all 0.2s ease',
              }}
              title="Return to Fun With Dost Yaar Hub"
            >
              <ArrowLeft size={14} />
              <Gamepad2 size={16} color="#60a5fa" />
              <span>Fun With Dost Yaar</span>
              <span style={{ fontSize: '0.68rem', background: 'rgba(37, 99, 235, 0.25)', padding: '1px 6px', borderRadius: '4px', color: '#93c5fd' }}>
                Hub
              </span>
            </button>
          )}
        </div>

        {/* Right side: Game Mode Switcher & SSO Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSwitchGameMode && (
            <button
              onClick={() => { sounds.playTap(); onSwitchGameMode(); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: gameMode === 'online' ? 'rgba(6, 182, 212, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: gameMode === 'online' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                color: gameMode === 'online' ? '#38bdf8' : '#34d399',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.76rem',
                cursor: 'pointer',
              }}
              title="Change Game Mode"
            >
              {gameMode === 'online' ? <Globe size={13} /> : <Smartphone size={13} />}
              <span>{gameMode === 'online' ? 'Mode: Online Rooms' : 'Mode: Pass & Play'}</span>
              <span style={{ opacity: 0.6 }}>⇄</span>
            </button>
          )}

          <button
            onClick={() => { sounds.playTap(); onOpenSSOProfile && onOpenSSOProfile(); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-glass)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.78rem',
            }}
            title="Player Profile"
          >
            <img
              src={ssoUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'}
              alt="Avatar"
              style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#070a13' }}
            />
            <span>{ssoUser?.displayName || 'Player'}</span>
            <span style={{ fontSize: '0.7rem', color: '#34d399' }}>● DOST</span>
          </button>
        </div>
      </div>

      {/* Main Bar: Brand, Info, and Control Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: '#0f172a',
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(16, 185, 129, 0.3)',
            flexShrink: 0,
          }}>
            <Eye size={26} color="#34d399" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{
              fontSize: 'clamp(1.35rem, 5.5vw, 2rem)',
              fontWeight: 900,
              letterSpacing: '0.07em',
              color: '#ffffff',
              margin: 0,
              lineHeight: 1.15,
              textTransform: 'uppercase',
              display: 'inline-block',
              paddingRight: '6px',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.5)',
            }}>
              UNDERCOVER
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
              <span
                className="badge"
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.45)',
                  letterSpacing: '0.06em',
                  fontWeight: 800,
                }}
              >
                PRO PARTY
              </span>

              <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.2)' }}>•</span>

              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}>
                {phase === 'setup' ? 'Social Deception Experience' : `Round ${round} Active Mission`}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {phase !== 'setup' && (
            <button
              onClick={handleResetClick}
              className="btn-icon"
              title="Reset / Abort Mission"
              aria-label="Reset Mission"
            >
              <RotateCcw size={18} />
            </button>
          )}

          <button
            onClick={handleRulesClick}
            className="btn-icon"
            title="How to Play / Rules"
            aria-label="How to Play"
          >
            <HelpCircle size={19} />
          </button>

          <button
            onClick={() => {
              sounds.playTap();
              setIsSettingsOpen(true);
            }}
            className="btn-icon"
            title="Audio & Game Settings"
            aria-label="Settings"
            style={{
              color: '#38bdf8',
              background: 'rgba(6, 182, 212, 0.12)',
              borderColor: 'rgba(6, 182, 212, 0.4)',
            }}
          >
            <Settings size={19} />
          </button>
        </div>
      </div>

      {/* Colorful & Vibrant Navigation Stepper Tracker */}
      <div
        className="no-scrollbar"
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10, 15, 28, 0.8)',
          padding: '8px 12px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          gap: '4px',
          width: '100%',
        }}
      >
        {PHASES.map((p, index) => {
          const isActive = p.id === phase;
          const isPassed = index < currentPhaseIndex;

          return (
            <React.Fragment key={p.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: isActive ? p.activeBg : isPassed ? p.completedBg : 'rgba(255, 255, 255, 0.02)',
                  border: isActive
                    ? `1.5px solid ${p.activeBorder}`
                    : isPassed
                    ? `1px solid ${p.completedBorder}`
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: isActive ? `0 0 16px ${p.glow}` : 'none',
                  color: isActive ? '#ffffff' : isPassed ? p.text : 'var(--text-muted)',
                  fontWeight: isActive ? 800 : isPassed ? 700 : 500,
                  fontSize: '0.84rem',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease',
                }}
              >
                <span style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: isActive
                    ? p.color
                    : isPassed
                    ? `rgba(255, 255, 255, 0.1)`
                    : 'rgba(255, 255, 255, 0.07)',
                  color: isActive ? '#ffffff' : isPassed ? p.text : 'var(--text-muted)',
                  border: isPassed ? `1px solid ${p.color}66` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
                  fontWeight: 900,
                  flexShrink: 0,
                }}>
                  {isPassed ? <Check size={11} strokeWidth={3} /> : index + 1}
                </span>

                <span>{p.label}</span>
              </div>

              {index < PHASES.length - 1 && (
                <ChevronRight
                  size={15}
                  color={isPassed ? `${PHASES[index + 1].color}88` : 'rgba(255, 255, 255, 0.12)'}
                  style={{ flexShrink: 0, margin: '0 2px' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor="#06b6d4"
      />
    </header>
  );
}
