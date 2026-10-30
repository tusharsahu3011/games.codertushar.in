import { Smartphone, Globe, Users, Mic, Shield, Sparkles, ChevronRight, Lock, Radio, ArrowLeft } from 'lucide-react';
import { sounds } from '../utils/sound';
import type { UserProfile } from '../../../types/sso';

export interface ModeSelectScreenProps {
  onSelectPassAndPlay: () => void;
  onSelectOnlineMultiplayer: () => void;
  ssoUser?: UserProfile | null;
  onBackToHub?: () => void;
}

export default function ModeSelectScreen({
  onSelectPassAndPlay,
  onSelectOnlineMultiplayer,
  ssoUser,
  onBackToHub,
}: ModeSelectScreenProps) {
  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      {/* Top back button if navigated from Central Hub */}
      {onBackToHub && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => {
              sounds.playTap();
              onBackToHub();
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              padding: '8px 16px',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.86rem',
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowLeft size={16} />
            <span>← Back to Games Hub</span>
          </button>
        </div>
      )}

      {/* Hero Mission Briefing */}
      <div style={{
        background: 'rgba(18, 27, 49, 0.85)',
        border: '1.5px solid rgba(255, 255, 255, 0.12)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
              Fun With Dost Yaar
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Social Deception Hub
            </span>
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#ffffff', margin: '4px 0 8px' }}>
            Choose Undercover Deployment
          </h2>
          <p style={{ fontSize: '0.94rem', color: '#CBD5E1', maxWidth: '560px', margin: 0, lineHeight: 1.55 }}>
            Deploy your undercover operation locally on a single device or launch custom online multiplayer rooms with synchronized roles and live WebRTC voice interrogation.
          </p>
        </div>

        {/* Operative SSO Profile Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(10, 15, 28, 0.75)',
          padding: '10px 18px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-glass)',
        }}>
          <img
            src={ssoUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=agent'}
            alt="Operative Avatar"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1.5px solid #10b981', background: '#0f172a' }}
          />
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ffffff' }}>
              {ssoUser?.displayName || 'Dost Yaar Agent'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: 600 }}>
              {ssoUser?.displayName || 'Dost Yaar'} • Party Game Player
            </div>
          </div>
        </div>
      </div>

      {/* 2 Dedicated Game Modes Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {/* MODE 1: Pass & Play (Local) */}
        <div
          onClick={() => {
            sounds.playSelect();
            onSelectPassAndPlay();
          }}
          className="glass-panel card-interactive"
          style={{
            padding: '32px 28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            background: 'rgba(15, 23, 42, 0.88)',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
              }}>
                <Smartphone size={28} />
              </div>
              <span className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                Single Device
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
              Pass & Play (Local Party)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.55, marginBottom: '22px' }}>
              Pass a single phone or laptop around the circle. Each player uses the tactile biometric fingerprint scanner to privately reveal their secret word.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Shield size={16} color="#34d399" />
                <span>Zero setup required — instant party play</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Lock size={16} color="#34d399" />
                <span>Hold-to-peek secret word privacy guarantee</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Users size={16} color="#34d399" />
                <span>Supports 3 to 20 local players</span>
              </div>
            </div>
          </div>

          <button
            className="btn-launch"
            style={{ width: '100%', padding: '14px', fontSize: '1.02rem' }}
          >
            <span>Launch Pass & Play</span>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* MODE 2: Online Multiplayer (Custom Rooms) */}
        <div
          onClick={() => {
            sounds.playSelect();
            onSelectOnlineMultiplayer();
          }}
          className="glass-panel card-interactive"
          style={{
            padding: '32px 28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: '1.5px solid rgba(6, 182, 212, 0.45)',
            background: 'rgba(15, 23, 42, 0.88)',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1.5px solid #06b6d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}>
                <Globe size={28} />
              </div>
              <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                Multi-Device Room
              </span>
            </div>

            <h3 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
              Online Multiplayer (Custom Rooms)
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.55, marginBottom: '22px' }}>
              Create or join private custom rooms with a unique room code. Everyone plays on their own device with real-time state sync and live WebRTC voice chat!
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Radio size={16} color="#38bdf8" />
                <span>Unique Room Codes & 1-click shareable join links</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Mic size={16} color="#38bdf8" />
                <span>WebRTC Live Voice Chat with active soundwaves</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <Sparkles size={16} color="#38bdf8" />
                <span>Private screen view — no shoulder surfing possible</span>
              </div>
            </div>
          </div>

          <button
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '1.02rem', background: '#06b6d4' }}
          >
            <span>Enter Multiplayer Rooms</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
