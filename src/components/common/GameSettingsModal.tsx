import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Radio,
  Sparkles,
  X,
  Check,
  Smartphone,
  Sliders,
  HelpCircle,
} from 'lucide-react';
import { webrtcVoice } from '../../games/undercover-game/utils/webrtcVoice';
import { sounds as undercoverSounds } from '../../games/undercover-game/utils/sound';
import { bhabhiSounds } from '../../games/bhabhi-game/utils/sound';
import { spySounds } from '../../games/spyfall-game/utils/sound';

export interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor?: string; // default emerald '#10b981'
}

export default function GameSettingsModal({
  isOpen,
  onClose,
  accentColor = '#10b981',
}: GameSettingsModalProps) {
  // Sound FX State
  const [sfxMuted, setSfxMuted] = useState(() => {
    try {
      return localStorage.getItem('fwd_sfx_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [sfxVolume, setSfxVolume] = useState(() => {
    try {
      const saved = localStorage.getItem('fwd_sfx_volume');
      return saved !== null ? Number(saved) : 80;
    } catch {
      return 80;
    }
  });

  // Voice Chat State
  const [voiceMuted, setVoiceMuted] = useState(() => {
    try {
      return localStorage.getItem('fwd_voice_muted') === 'true';
    } catch {
      return false;
    }
  });

  const [voiceLiveState, setVoiceLiveState] = useState({
    hasPermission: webrtcVoice.hasPermission,
    isMuted: webrtcVoice.isMuted,
    isSpeaking: webrtcVoice.isSpeaking,
    currentVolume: webrtcVoice.currentVolume,
  });

  const [testSoundPlayed, setTestSoundPlayed] = useState(false);
  const [micTesting, setMicTesting] = useState(false);

  // Subscribe to live WebRTC audio changes
  useEffect(() => {
    const unsub = webrtcVoice.subscribe((s) => {
      setVoiceLiveState({
        hasPermission: s.hasPermission,
        isMuted: s.isMuted,
        isSpeaking: s.isSpeaking,
        currentVolume: s.currentVolume,
      });
    });
    return () => unsub();
  }, []);

  // Sync SFX state globally
  useEffect(() => {
    try {
      localStorage.setItem('fwd_sfx_muted', String(sfxMuted));
      localStorage.setItem('fwd_sfx_volume', String(sfxVolume));
    } catch {}

    undercoverSounds.setMuted(sfxMuted);
    bhabhiSounds.setMuted(sfxMuted);
    bhabhiSounds.setVolume(sfxVolume / 100);
    spySounds.setMuted(sfxMuted);
  }, [sfxMuted, sfxVolume]);

  // Sync Voice state
  useEffect(() => {
    try {
      localStorage.setItem('fwd_voice_muted', String(voiceMuted));
    } catch {}
    if (webrtcVoice.hasPermission && webrtcVoice.isMuted !== voiceMuted) {
      webrtcVoice.toggleMute();
    }
  }, [voiceMuted]);

  if (!isOpen) return null;

  const handleTestSfx = () => {
    if (sfxMuted) {
      setSfxMuted(false);
    }
    bhabhiSounds.playCardSnap();
    setTimeout(() => bhabhiSounds.playThokoBoom(), 240);
    setTimeout(() => bhabhiSounds.playTrickSweep(), 680);
    setTestSoundPlayed(true);
    setTimeout(() => setTestSoundPlayed(false), 1600);
  };

  const handleToggleVoiceMic = async () => {
    if (!voiceLiveState.hasPermission) {
      setMicTesting(true);
      const res = await webrtcVoice.requestMicrophone();
      setMicTesting(false);
      if (!res.success) {
        alert('Could not access microphone. Please enable microphone permissions in your browser.');
        return;
      }
      setVoiceMuted(false);
    } else {
      const newMuted = !voiceMuted;
      setVoiceMuted(newMuted);
      webrtcVoice.toggleMute();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#0d131f',
          border: `1.5px solid rgba(255, 255, 255, 0.15)`,
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '22px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: `rgba(${accentColor === '#10b981' ? '16, 185, 129' : '6, 182, 212'}, 0.15)`,
                border: `1.5px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: accentColor,
              }}
            >
              <Settings size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                Audio & Game Settings
              </h3>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
                Fun With Dost Yaar Controls
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            title="Close Settings"
          >
            <X size={18} />
          </button>
        </div>

        {/* SECTION 1: Game Sound Effects */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {sfxMuted ? <VolumeX size={20} color="#f43f5e" /> : <Volume2 size={20} color="#10b981" />}
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#ffffff', display: 'block' }}>
                  Game Sound Effects
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Card snaps, victory bells, and turn pings
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={() => setSfxMuted(!sfxMuted)}
              style={{
                width: '46px',
                height: '26px',
                borderRadius: '999px',
                background: !sfxMuted ? '#10b981' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: !sfxMuted ? '23px' : '3px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>

          {/* Test Sound Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleTestSfx}
              className="btn-secondary"
              style={{
                padding: '6px 14px',
                fontSize: '0.78rem',
                gap: '6px',
                borderRadius: '8px',
                background: testSoundPlayed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                borderColor: testSoundPlayed ? '#10b981' : 'rgba(255, 255, 255, 0.12)',
                color: testSoundPlayed ? '#34d399' : '#cbd5e1',
              }}
            >
              <Sparkles size={13} color={testSoundPlayed ? '#34d399' : '#fbbf24'} />
              <span>{testSoundPlayed ? 'Sound Tested! 🎵' : 'Test Sound Effect'}</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Voice Chat Settings */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {voiceMuted || !voiceLiveState.hasPermission ? (
                <MicOff size={20} color="#f43f5e" />
              ) : (
                <Mic size={20} color="#06b6d4" />
              )}
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.94rem', color: '#ffffff', display: 'block' }}>
                  Live Voice Chat
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Microphone & WebRTC in-room voice
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              type="button"
              onClick={handleToggleVoiceMic}
              style={{
                width: '46px',
                height: '26px',
                borderRadius: '999px',
                background: voiceLiveState.hasPermission && !voiceMuted ? '#06b6d4' : 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  position: 'absolute',
                  top: '3px',
                  left: voiceLiveState.hasPermission && !voiceMuted ? '23px' : '3px',
                  transition: 'left 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              />
            </button>
          </div>

          {/* Equalizer Visualizer & Permission Status */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
              <Radio size={14} color={voiceLiveState.hasPermission && !voiceMuted ? '#38bdf8' : '#94a3b8'} />
              <span style={{ color: voiceLiveState.hasPermission && !voiceMuted ? '#38bdf8' : '#94a3b8', fontWeight: 600 }}>
                {voiceLiveState.hasPermission
                  ? voiceMuted
                    ? 'Microphone Muted'
                    : 'Mic Active & Transmitting'
                  : 'Microphone Inactive'}
              </span>
            </div>

            {/* Equalizer bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              {[1, 2, 3, 4, 5].map((bar) => {
                const active = voiceLiveState.hasPermission && !voiceMuted && voiceLiveState.isSpeaking;
                const h = active ? Math.min(18, Math.max(5, (voiceLiveState.currentVolume / 100) * 22 * (bar * 0.4))) : 5;
                return (
                  <div
                    key={bar}
                    style={{
                      width: '3.5px',
                      height: `${h}px`,
                      background: active ? '#06b6d4' : 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '2px',
                      transition: 'height 0.08s ease',
                    }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Close Confirmation Button */}
        <button
          onClick={onClose}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '0.94rem',
            fontWeight: 800,
            background: accentColor,
            borderRadius: '14px',
          }}
        >
          <Check size={16} />
          <span>Save & Return to Game</span>
        </button>
      </div>
    </div>
  );
}
