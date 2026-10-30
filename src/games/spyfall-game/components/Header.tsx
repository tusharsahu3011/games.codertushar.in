import { useState } from 'react';
import { Compass, Volume2, VolumeX, HelpCircle, ArrowLeft, RefreshCw, UserCheck, Settings } from 'lucide-react';
import type { UserProfile } from '../../../types/sso';
import { spySounds } from '../utils/sound';
import GameSettingsModal from '../../../components/common/GameSettingsModal';

export interface SpyfallHeaderProps {
  gameMode: 'pass_and_play' | 'online' | 'mode_select';
  soundMuted: boolean;
  onToggleSound: () => void;
  onOpenRules: () => void;
  onBackToHub?: () => void;
  onSwitchMode?: () => void;
  ssoUser?: UserProfile;
  onOpenSSOProfile?: () => void;
}

export default function SpyfallHeader({
  gameMode,
  soundMuted,
  onToggleSound,
  onOpenRules,
  onBackToHub,
  onSwitchMode,
  ssoUser,
  onOpenSSOProfile,
}: SpyfallHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <header style={{
      width: '100%',
      padding: '12px clamp(12px, 3vw, 24px)',
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(6, 182, 212, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        {/* Left: Hub Back & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onBackToHub && (
            <button
              onClick={() => {
                spySounds.playTap();
                onBackToHub();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <ArrowLeft size={15} />
              <span className="hide-mobile">Hub</span>
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(6, 182, 212, 0.4)',
            }}>
              <Compass size={20} color="#ffffff" />
            </div>

            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  color: '#ffffff',
                }}>
                  SPYFALL
                </span>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'rgba(6, 182, 212, 0.15)',
                  border: '1px solid rgba(6, 182, 212, 0.4)',
                  color: '#38bdf8',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {gameMode === 'online' ? 'Online Room' : gameMode === 'pass_and_play' ? 'Pass & Play' : 'Mission'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions (Mode Switcher, Rules, Sound, Profile) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onSwitchMode && gameMode !== 'mode_select' && (
            <button
              onClick={() => {
                spySounds.playTap();
                onSwitchMode();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38bdf8',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              title="Switch Game Mode"
            >
              <RefreshCw size={13} />
              <span className="hide-mobile">Switch Mode</span>
            </button>
          )}

          <button
            onClick={() => {
              spySounds.playSelect();
              onOpenRules();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <HelpCircle size={15} />
            <span className="hide-mobile">Briefing Manual</span>
          </button>

          <button
            onClick={() => {
              spySounds.playTap();
              setIsSettingsOpen(true);
            }}
            style={{
              padding: '7px 10px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              color: '#38bdf8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Audio & Game Settings"
          >
            <Settings size={15} />
          </button>

          {ssoUser && (
            <button
              onClick={() => {
                spySounds.playTap();
                onOpenSSOProfile?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 10px 4px 6px',
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#f8fafc',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                fontSize: '0.7rem',
              }}>
                {ssoUser.avatar ? (
                  <img src={ssoUser.avatar} alt="avatar" style={{ width: '100%', height: '100%' }} />
                ) : (
                  <UserCheck size={14} color="#ffffff" />
                )}
              </div>
              <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ssoUser.username || 'Operative'}
              </span>
            </button>
          )}
        </div>
      </div>

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor="#0284c7"
      />
    </header>
  );
}
