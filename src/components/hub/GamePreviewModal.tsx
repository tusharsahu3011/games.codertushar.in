import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Users,
  Clock,
  Hammer,
  Bell,
  Check,
  Shield,
  Layers,
  Radio,
  Grid,
  Crown,
  Eye,
  Compass,
} from 'lucide-react';
import type { GameItem } from '../../types/hub';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface GamePreviewModalProps {
  game: GameItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function GamePreviewModal({
  game,
  isOpen,
  onClose,
}: GamePreviewModalProps) {
  const [notified, setNotified] = useState(false);

  if (!isOpen || !game) return null;

  const handleNotify = () => {
    sounds.playTap();
    setNotified(true);
    setTimeout(() => setNotified(false), 3000);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
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
          maxWidth: '520px',
          background: '#0d131f',
          border: `1.5px solid ${game.accentColor}44`,
          borderRadius: '24px',
          padding: '24px 28px',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 900,
                letterSpacing: '0.04em',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                color: '#fbbf24',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Hammer size={12} />
              <span>IN ACTIVE DEVELOPMENT</span>
            </span>
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
          >
            <X size={18} />
          </button>
        </div>

        {/* Title & Tagline */}
        <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
          {game.title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: game.accentColor, fontWeight: 700, margin: '0 0 16px' }}>
          {game.tagline}
        </p>

        {/* Description */}
        <p style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 20px' }}>
          {game.description}
        </p>

        {/* Game Specs */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px',
            marginBottom: '20px',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#38bdf8" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>PLAYER CAPACITY</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>{game.playerRange}</div>
            </div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>ESTIMATED TIME</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#ffffff' }}>{game.estimatedTime}</div>
            </div>
          </div>
        </div>

        {/* Features Preview List */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em', marginBottom: '8px' }}>
            PLANNED GAMEPLAY FEATURES
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {game.features.map((feat) => (
              <span
                key={feat}
                style={{
                  fontSize: '0.78rem',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#f1f5f9',
                  fontWeight: 600,
                }}
              >
                ✓ {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button: Notify Me */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleNotify}
            className="btn-primary"
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: notified ? '#10b981' : game.accentColor,
              borderRadius: '12px',
              color: '#ffffff',
            }}
          >
            {notified ? (
              <>
                <Check size={16} />
                <span>You're on the early access list! 🎉</span>
              </>
            ) : (
              <>
                <Bell size={16} />
                <span>Notify Me When Playable</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

