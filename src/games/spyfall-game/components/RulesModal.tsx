import { X, Shield, Compass, Search, AlertTriangle, Eye, HelpCircle, CheckCircle2 } from 'lucide-react';
import { spySounds } from '../utils/sound';

export interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 23, 0.85)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#090e17',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '20px',
        maxWidth: '680px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(6, 182, 212, 0.15)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Compass size={20} color="#38bdf8" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Spyfall: Field Operative Manual
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Classified Briefing & Tactical Questioning Protocol
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              spySounds.playTap();
              onClose();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          fontSize: '0.92rem',
          color: '#cbd5e1',
          lineHeight: 1.6,
        }}>
          {/* Mission Objective */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.2)',
            borderRadius: '14px',
            padding: '16px 18px',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#38bdf8', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={18} />
              Mission Objective
            </h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              All operatives are gathered at a <strong>Secret Location</strong> (e.g. <em>Airplane, Casino, Submarine</em>) and assigned specific roles.
              However, <strong>The Spy</strong> receives no location briefing! The operatives must interrogate each other to uncover the spy, while the spy attempts to deduce the secret location.
            </p>
          </div>

          {/* Turn Flow */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="#06b6d4" />
              How Questioning Works
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <strong>Ask a Question:</strong> The starting operative asks any other player a question (e.g., <em>"What is the dress code here?"</em> or <em>"Do you hear strange noises?"</em>).
              </li>
              <li>
                <strong>Answer Carefully:</strong> The interrogated player must answer without making it too obvious for the spy or too vague for fellow operatives.
              </li>
              <li>
                <strong>Next Turn:</strong> The player who answered asks the next question to anyone <em>(except the player who just questioned them)</em>.
              </li>
            </ul>
          </div>

          {/* Winning Conditions */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ color: '#34d399', fontSize: '0.92rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                Operatives Win If:
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                1. Players unanimously vote to accuse the true Spy.<br />
                2. The Spy stops the game and makes an incorrect location guess.
              </p>
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.25)',
              borderRadius: '12px',
              padding: '14px',
            }}>
              <h4 style={{ color: '#fb7185', fontSize: '0.92rem', fontWeight: 800, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={16} />
                The Spy Wins If:
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                1. The Spy halts the clock at any time and correctly identifies the location.<br />
                2. Operatives falsely accuse an innocent teammate.
              </p>
            </div>
          </div>

          {/* Pro Tips */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            padding: '16px',
          }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Eye size={16} color="#38bdf8" />
              Tactical Espionage Tips
            </h4>
            <div style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>For Operatives:</strong> Avoid giving direct clues like "Is the airplane flying high?" Instead ask subtle questions about temperature, lighting, social status, or equipment.</div>
              <div><strong>For the Spy:</strong> Study the <em>Location Reference Board</em> during questioning. Listen to vague cues (e.g., loud sounds, wet floor, uniforms) to eliminate possibilities until only one remains!</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={() => {
              spySounds.playSelect();
              onClose();
            }}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Understood, Operative
          </button>
        </div>
      </div>
    </div>
  );
}
