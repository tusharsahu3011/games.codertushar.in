import { Users, Wifi, Shield, ArrowRight, ArrowLeft, Radio, Compass, Lock, Zap } from 'lucide-react';
import type { UserProfile } from '../../../types/sso';
import { spySounds } from '../utils/sound';

export interface SpyfallModeSelectScreenProps {
  onSelectPassAndPlay: () => void;
  onSelectOnlineMultiplayer: () => void;
  ssoUser?: UserProfile;
  onBackToHub?: () => void;
}

export default function SpyfallModeSelectScreen({
  onSelectPassAndPlay,
  onSelectOnlineMultiplayer,
  ssoUser,
  onBackToHub,
}: SpyfallModeSelectScreenProps) {
  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 16px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Top Banner / Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 16px',
        borderRadius: '999px',
        background: 'rgba(6, 182, 212, 0.1)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        color: '#38bdf8',
        fontSize: '0.82rem',
        fontWeight: 800,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginBottom: '20px',
      }}>
        <Compass size={15} />
        <span>CLASSIFIED MISSION PROTOCOL // SPYFALL</span>
      </div>

      <h1 style={{
        fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
        fontWeight: 900,
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: '-0.03em',
        margin: '0 0 12px',
        lineHeight: 1.15,
      }}>
        Select Espionage Mode
      </h1>

      <p style={{
        fontSize: 'clamp(1rem, 2vw, 1.15rem)',
        color: '#94a3b8',
        textAlign: 'center',
        maxWidth: '620px',
        margin: '0 0 44px',
        lineHeight: 1.6,
      }}>
        One player is the covert Spy with zero location intelligence. Operatives must interrogate suspects without leaking the secret location.
      </p>

      {/* Mode Selection Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        width: '100%',
        marginBottom: '36px',
      }}>
        {/* Card 1: Pass & Play */}
        <div
          onClick={() => {
            spySounds.playSelect();
            onSelectPassAndPlay();
          }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)',
            border: '1.5px solid rgba(6, 182, 212, 0.35)',
            borderRadius: '24px',
            padding: '36px 28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(6, 182, 212, 0.15)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.7)';
            e.currentTarget.style.boxShadow = '0 24px 50px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(6, 182, 212, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(6, 182, 212, 0.15)';
          }}
        >
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Users size={28} color="#38bdf8" />
              </div>

              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                color: '#38bdf8',
                letterSpacing: '0.04em',
              }}>
                SINGLE DEVICE
              </span>
            </div>

            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Pass & Play
            </h2>

            <p style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              lineHeight: 1.55,
              margin: '0 0 24px',
            }}>
              Pass a single phone or tablet around the party circle. Operatives discreetly view their role, followed by a shared tactical interrogation clock.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {[
                'Biometric Privacy Shield Reveal',
                'Customizable Round Clock (3 - 10 Min)',
                'Interactive Location Reference Matrix',
                'Instant Suspect Accusation Tribunal',
                'No internet or downloads needed',
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <Shield size={14} color="#06b6d4" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              spySounds.playSelect();
              onSelectPassAndPlay();
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              color: '#ffffff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px -4px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <span>Launch Pass & Play</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Card 2: Online Multiplayer */}
        <div
          onClick={() => {
            spySounds.playSelect();
            onSelectOnlineMultiplayer();
          }}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9) 0%, rgba(10, 15, 30, 0.95) 100%)',
            border: '1.5px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '24px',
            padding: '36px 28px',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.15)',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.7)';
            e.currentTarget.style.boxShadow = '0 24px 50px -15px rgba(0, 0, 0, 0.7), 0 0 35px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.35)';
            e.currentTarget.style.boxShadow = '0 20px 40px -15px rgba(0, 0, 0, 0.6), 0 0 25px rgba(139, 92, 246, 0.15)';
          }}
        >
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: '16px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Radio size={28} color="#c084fc" />
              </div>

              <span style={{
                fontSize: '0.74rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '999px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.4)',
                color: '#c084fc',
                letterSpacing: '0.04em',
              }}>
                MULTI-DEVICE LAN & WEB
              </span>
            </div>

            <h2 style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#ffffff',
              margin: '0 0 8px',
              letterSpacing: '-0.02em',
            }}>
              Online Multiplayer
            </h2>

            <p style={{
              fontSize: '0.92rem',
              color: '#94a3b8',
              lineHeight: 1.55,
              margin: '0 0 24px',
            }}>
              Every player connects using their own smartphone or computer via custom room code (e.g. <code>SPY-842</code>) with live WebRTC voice chat.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {[
                'Instant Room Codes & QR / Direct Links',
                'Live WebRTC Voice Bar with Mic Visualizer',
                'Zero-Leak Secret Location Deliveries',
                'Live Synchronized Timer & Accusation Ballot',
                'Works over Local Wi-Fi or Web',
              ].map((feat, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', color: '#cbd5e1' }}>
                  <Zap size={14} color="#a855f7" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              spySounds.playSelect();
              onSelectOnlineMultiplayer();
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              color: '#ffffff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 8px 20px -4px rgba(139, 92, 246, 0.4)',
              transition: 'all 0.2s',
            }}
          >
            <span>Create or Join Room</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {/* Back to Hub link */}
      {onBackToHub && (
        <button
          onClick={() => {
            spySounds.playTap();
            onBackToHub();
          }}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: '8px',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; }}
        >
          <ArrowLeft size={16} />
          <span>Return to Games Portal</span>
        </button>
      )}
    </div>
  );
}
