import React, { useState } from 'react';
import { X, Shield, EyeOff, HelpCircle, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/sound';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'roles' | 'tips'>('rules');

  if (!isOpen) return null;

  const handleClose = () => {
    sounds.playTap();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px',
    }} onClick={handleClose}>
      <div
        className="glass-panel animate-enter"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: 'calc(100dvh - 24px)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          overscrollBehavior: 'contain',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={22} color="var(--cyan-primary)" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>How to Play Undercover</h2>
          </div>
          <button
            onClick={handleClose}
            className="btn-icon"
            style={{ width: '48px', height: '48px', minWidth: '48px', minHeight: '48px' }}
            aria-label="Close Rules"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '18px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '12px',
        }}>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('rules'); }}
            style={{
              padding: '10px 14px',
              minHeight: '44px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              background: activeTab === 'rules' ? 'var(--cyan-primary)' : 'transparent',
              color: activeTab === 'rules' ? '#fff' : 'var(--text-secondary)',
              touchAction: 'manipulation',
            }}
          >
            Gameplay & Flow
          </button>
          <button
            onClick={() => { sounds.playTap(); setActiveTab('roles'); }}
            style={{
              padding: '10px 14px',
              minHeight: '44px',
              borderRadius: '8px',
              fontSize: '0.86rem',
              fontWeight: 700,
              background: activeTab === 'roles' ? 'var(--cyan-primary)' : 'transparent',
              color: activeTab === 'roles' ? '#fff' : 'var(--text-secondary)',
              touchAction: 'manipulation',
            }}
          >
            Roles & Strategy
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeTab === 'rules' ? (
            <>
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: '12px',
                padding: '14px',
                fontSize: '0.9rem',
                color: '#e2e8f0',
                lineHeight: 1.5,
              }}>
                <strong style={{ color: 'var(--cyan-primary)' }}>The Core Premise:</strong> Most players are Civilians with the exact same secret word (e.g. <em>Coffee</em>). One or more Undercover agents receive a closely related word (e.g. <em>Tea</em>).
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--cyan-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>1</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Secret Peek</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Pass the device around. Each player holds down the screen scanner to secretly view their word.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--cyan-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>2</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Give One Clue</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Players take turns saying a single sentence or word describing their concept. Be vague enough not to give it away, but clear enough so other civilians trust you.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--cyan-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>3</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Discuss & Vote</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      Debate who sounded suspicious. Vote on which player to eliminate!
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: 'var(--cyan-primary)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>4</div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '2px' }}>Win Conditions</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      • <strong>Civilians Win:</strong> When all Undercover and Mr. White players are eliminated.<br />
                      • <strong>Undercover Wins:</strong> When Undercovers match or outnumber Civilians.<br />
                      • <strong>Mr. White Steals:</strong> If Mr. White is voted out, they get ONE guess at the civilian word to win instantly!
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <Shield size={18} color="#06b6d4" />
                  <strong style={{ color: '#38bdf8' }}>Civilian</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  You hold the majority word. Listen closely for teammates and spot anyone whose clue feels slightly off or overly generic.
                </p>
              </div>

              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <EyeOff size={18} color="#f43f5e" />
                  <strong style={{ color: '#fb7185' }}>Undercover Agent</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Your word is very similar to the civilians' word. Listen carefully to others' clues to deduce what their word is, and tailor your clues to avoid suspicion!
                </p>
              </div>

              <div style={{
                background: 'rgba(168, 85, 247, 0.1)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '12px',
                padding: '14px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <HelpCircle size={18} color="#a855f7" />
                  <strong style={{ color: '#c084fc' }}>Mr. White (Optional Role)</strong>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  You receive NO word at all! Bluff with confidence. If you get eliminated, you can guess the civilian word to pull off an undercover heist victory!
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleClose}
          className="btn-primary"
          style={{ marginTop: '20px', width: '100%' }}
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
}
