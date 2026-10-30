import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy, RotateCcw, Settings, Shield, EyeOff, HelpCircle,
  CheckCircle2, XCircle, Sparkles, ArrowRight, Share2, Check
} from 'lucide-react';
import { ROLES, ROLE_INFO, type EnginePlayer } from '../utils/gameEngine';
import { AGENT_COLORS } from './SetupScreen';
import { sounds } from '../utils/sound';

export interface GameOverScreenProps {
  winner: 'civilians' | 'undercover' | 'mrwhite' | string | null;
  reason: string;
  players: EnginePlayer[];
  wordPair: { civilianWord: string; undercoverWord: string; category?: string; pair?: string } | null;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export default function GameOverScreen({
  winner,
  reason,
  players,
  wordPair,
  onPlayAgain,
  onNewGame,
}: GameOverScreenProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    sounds.playVictory();

    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#06b6d4', '#f43f5e', '#a855f7', '#10b981', '#f59e0b'],
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 60,
          origin: { x: 0 },
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 60,
          origin: { x: 1 },
        });
      }, 350);

      return () => clearTimeout(timer);
    } catch (e) {}
  }, []);

  const getWinnerMeta = () => {
    switch (winner) {
      case 'civilians':
        return {
          title: 'CIVILIANS TRIUMPH!',
          subtitle: 'The infiltrators were unmasked and justice prevails.',
          color: '#06b6d4',
          bg: 'rgba(6, 182, 212, 0.14)',
          border: '1.5px solid #06b6d4',
          icon: <Shield size={44} color="#06b6d4" />,
        };
      case 'undercover':
        return {
          title: 'UNDERCOVER VICTORY!',
          subtitle: 'The undercover operatives blended in and outlasted the civilians.',
          color: '#f43f5e',
          bg: 'rgba(244, 63, 94, 0.14)',
          border: '1.5px solid #f43f5e',
          icon: <EyeOff size={44} color="#f43f5e" />,
        };
      case 'mrwhite':
        return {
          title: 'MR. WHITE STOLE THE WIN!',
          subtitle: 'Deduce the civilian secret word in an extraordinary bluff!',
          color: '#a855f7',
          bg: 'rgba(168, 85, 247, 0.14)',
          border: '1.5px solid #a855f7',
          icon: <HelpCircle size={44} color="#a855f7" />,
        };
      default:
        return {
          title: 'MISSION DEBRIEF',
          subtitle: reason,
          color: '#34d399',
          bg: 'rgba(16, 185, 129, 0.14)',
          border: '1.5px solid #10b981',
          icon: <Trophy size={44} color="#34d399" />,
        };
    }
  };

  const meta = getWinnerMeta();

  // Copy party debrief to clipboard
  const handleCopyDebrief = () => {
    sounds.playTap();
    const text = `🕵️‍♂️ UNDERCOVER PARTY DEBRIEF
🏆 Result: ${meta.title}
📜 Summary: ${reason || meta.subtitle}
🔑 Civilian Word: ${wordPair?.civilianWord}
🕵️ Undercover Word: ${wordPair?.undercoverWord}
👥 Operatives:
${players.map((p) => `• ${p.name}: ${p.role.toUpperCase()} (${p.isAlive ? 'Survived' : 'Eliminated'})`).join('\n')}`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '26px', width: '100%' }}>
      {/* Victory Header Card (Full Width) */}
      <div className="glass-panel" style={{
        textAlign: 'center',
        padding: '42px 28px',
        background: meta.bg,
        border: meta.border,
        boxShadow: `0 0 50px ${meta.color}33`,
      }}>
        <div style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 18px',
          border: `2px solid ${meta.color}`,
          boxShadow: `0 0 30px ${meta.color}44`,
        }}>
          {meta.icon}
        </div>

        <h2 style={{
          fontSize: '2.6rem',
          fontWeight: 900,
          color: '#ffffff',
          letterSpacing: '0.02em',
          marginBottom: '10px',
        }}>
          {meta.title}
        </h2>

        <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', maxWidth: '540px', margin: '0 auto 20px', lineHeight: 1.5 }}>
          {reason || meta.subtitle}
        </p>

        {/* Share Button */}
        <button
          onClick={handleCopyDebrief}
          className="btn-secondary"
          style={{ padding: '8px 18px', fontSize: '0.86rem', gap: '8px' }}
        >
          {copied ? <Check size={16} color="var(--emerald-success)" /> : <Share2 size={16} />}
          <span>{copied ? 'Debrief Copied to Clipboard!' : 'Copy Party Debrief'}</span>
        </button>
      </div>

      {/* Secret Words Side-by-Side Cards */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Secret Word Intelligence
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.12)',
            border: '1px solid rgba(6, 182, 212, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Civilian Secret Word
            </span>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#38bdf8', marginTop: '6px' }}>
              {wordPair?.civilianWord || 'N/A'}
            </div>
          </div>

          <div style={{
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '22px',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Undercover Secret Word
            </span>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#fb7185', marginTop: '6px' }}>
              {wordPair?.undercoverWord || 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* All Operatives Debrief Grid - Fixed Overflow Layout */}
      <div className="glass-panel">
        <h3 style={{ fontSize: '1.18rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-secondary)' }}>
          Operative Roster Debrief
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '14px',
        }}>
          {players.map((player, idx) => {
            const role = ROLE_INFO[player.role] || ROLE_INFO[ROLES.CIVILIAN];
            const colorMeta = AGENT_COLORS[idx % AGENT_COLORS.length];

            return (
              <div
                key={player.id}
                className="card-interactive"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '16px 18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${player.isAlive ? 'var(--border-glass)' : 'rgba(244, 63, 94, 0.25)'}`,
                  borderRadius: 'var(--radius-lg)',
                  gap: '12px',
                  minWidth: 0,
                  overflow: 'hidden',
                  boxSizing: 'border-box',
                }}
              >
                {/* Top Row: Avatar, Operative Name, and Status Badge */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  width: '100%',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: colorMeta.bg,
                      border: `1.5px solid ${colorMeta.border}`,
                      color: colorMeta.text,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      flexShrink: 0,
                    }}>
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        color: '#ffffff',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {player.name}
                      </div>
                    </div>
                  </div>

                  {/* Survived vs Eliminated Badge (Zero Overflow) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: player.isAlive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                    border: `1px solid ${player.isAlive ? 'rgba(16, 185, 129, 0.35)' : 'rgba(244, 63, 94, 0.35)'}`,
                    color: player.isAlive ? 'var(--emerald-success)' : 'var(--crimson-undercover)',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    letterSpacing: '0.04em',
                  }}>
                    {player.isAlive ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                    <span>{player.isAlive ? 'SURVIVED' : 'ELIMINATED'}</span>
                  </div>
                </div>

                {/* Bottom Row: Role Badge + Assigned Word */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  width: '100%',
                }}>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: role.bg,
                    color: role.color,
                    border: `1px solid ${role.border}`,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    flexShrink: 0,
                  }}>
                    {role.name}
                  </span>

                  <div style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-secondary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '190px',
                    textAlign: 'right',
                  }}>
                    Word: <strong style={{ color: '#ffffff' }}>{player.word || 'None (Mr. White)'}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '14px',
        flexWrap: 'wrap',
      }}>
        <button
          onClick={() => { sounds.playTap(); onNewGame(); }}
          className="btn-secondary"
          style={{ padding: '16px 28px', fontSize: '1.02rem', fontWeight: 700 }}
        >
          <Settings size={18} />
          <span>Setup Mission</span>
        </button>

        <button
          onClick={() => { sounds.playDramaticBoom(); onPlayAgain(); }}
          className="btn-launch"
          style={{ padding: '16px 36px', fontSize: '1.08rem', fontWeight: 800 }}
        >
          <RotateCcw size={18} />
          <span>Play Again with Same Squad</span>
        </button>
      </div>
    </div>
  );
}
