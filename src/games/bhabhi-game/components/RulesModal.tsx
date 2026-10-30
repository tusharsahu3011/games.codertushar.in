import React from 'react';
import { X, BookOpen, AlertCircle, Sparkles, Flame, ShieldCheck, Crown } from 'lucide-react';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1.5px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '24px',
          padding: '28px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            paddingBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
              }}
            >
              <BookOpen size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f8fafc', margin: 0 }}>
                How to Play Bhabhi (Get Away / Thoko)
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Classic Indian Trick-Taking & Evasion Card Game
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: '#94a3b8',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Rules Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', color: '#cbd5e1' }}>
          {/* Rule 1: The Goal */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <ShieldCheck size={24} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                1. The Ultimate Objective: "Get Away!"
              </h4>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                Bhabhi has NO single winner — everyone wins as soon as they get rid of all their cards!
                The goal is to safely exit ("Get Away"). The last remaining player holding cards is the loser and is crowned the <strong>"Bhabhi"</strong>.
              </p>
            </div>
          </div>

          {/* Rule 2: Ace of Spades First Lead */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Sparkles size={24} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                2. Opening Lead: Ace of Spades (A♠)
              </h4>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                All 52 standard cards are dealt clockwise. The player who holds the <strong>Ace of Spades (A♠)</strong> MUST play it as the opening move of the game. Other players must follow suit with a Spade if they hold one.
              </p>
            </div>
          </div>

          {/* Rule 3: Following Suit */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <AlertCircle size={24} color="#38bdf8" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                3. Mandatory Follow Suit Rule
              </h4>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                On any trick, every player MUST play a card matching the suit of the lead card IF they have one in hand. You cannot play an off-suit card if you possess cards of the lead suit.
              </p>
            </div>
          </div>

          {/* Rule 4: THOKO / Trick Break (The Core Penalty) */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(239, 68, 68, 0.1)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Flame size={24} color="#f87171" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fca5a5', margin: '0 0 4px' }}>
                4. THOKO! (Trick Break & Pickup Penalty)
              </h4>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                If you do NOT have a card matching the lead suit, you can throw ANY card from another suit — this is called a <strong>Thoko</strong>!
                Playing an off-suit card immediately breaks the trick.
                <br />
                <strong>The Penalty:</strong> The player who played the highest card of the lead suit in that trick MUST pick up ALL cards played in the trick and add them back to their hand! They also lead the next trick.
              </p>
            </div>
          </div>

          {/* Rule 5: Trick Discard */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <Crown size={24} color="#a855f7" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', margin: '0 0 4px' }}>
                5. Normal Trick Completion
              </h4>
              <p style={{ fontSize: '0.86rem', lineHeight: 1.5, margin: 0 }}>
                If all active players successfully follow suit with no Thoko, the player with the highest card of the lead suit wins the trick. All cards are moved to the discard pile (trash) forever, and the winner leads the next trick!
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: '24px',
            width: '100%',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: 'none',
            color: '#ffffff',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '0.92rem',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          Got it! Let's Play
        </button>
      </div>
    </div>
  );
}
