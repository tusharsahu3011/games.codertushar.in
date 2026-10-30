import React, { useState, useEffect } from 'react';
import {
  X,
  Trophy,
  Award,
  History,
  ShieldCheck,
  User,
  LogOut,
  Sparkles,
  Flame,
  CheckCircle,
  Eye,
  Compass,
  Crown,
  Users,
  Clock,
  ArrowUpRight,
  TrendingUp,
  Key,
} from 'lucide-react';
import { authService } from '../../services/authService';
import type { UserAccount, MatchRecord, PlayerAchievement } from '../../types/auth';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onOpenAuthModal,
}: UserProfileModalProps) {
  const [account, setAccount] = useState<UserAccount>(() => authService.currentUser);
  const [activeTab, setActiveTab] = useState<'records' | 'achievements' | 'profile'>('records');
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState(account.displayName);

  useEffect(() => {
    const unsub = authService.subscribe((acc) => {
      setAccount(acc);
      setNewName(acc.displayName);
    });
    return () => unsub();
  }, []);

  if (!isOpen) return null;

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    if (newName.trim()) {
      authService.updateDisplayName(newName.trim());
      setEditingName(false);
    }
  };

  const handleRandomizeAvatar = () => {
    sounds.playTap();
    const seed = `${account.displayName}_${Math.floor(Math.random() * 9999)}`;
    authService.updateAvatar(`https://api.dicebear.com/7.x/bottts/svg?seed=${seed}`);
  };

  const handleLogout = () => {
    sounds.playTap();
    authService.logout();
    onClose();
  };

  const unlockedCount = account.achievements.filter((a) => a.unlockedAt).length;

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
          maxWidth: '640px',
          maxHeight: 'min(92vh, 760px)',
          background: '#0d131f',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Header Hero Area */}
        <div
          style={{
            padding: '24px 28px 18px',
            background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 23, 42, 0) 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <img
                src={account.avatar}
                alt={account.displayName}
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#07090e',
                  border: '2px solid #10b981',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.35)',
                }}
              />
              <button
                type="button"
                onClick={handleRandomizeAvatar}
                title="Randomize avatar"
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-4px',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#10b981',
                  color: '#ffffff',
                  border: '2px solid #0d131f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={12} />
              </button>
            </div>

            {/* Name & Tier */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {editingName ? (
                  <form onSubmit={handleSaveName} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      maxLength={24}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid #10b981',
                        color: '#ffffff',
                        fontSize: '1rem',
                        fontWeight: 800,
                        outline: 'none',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                      }}
                    >
                      Save
                    </button>
                  </form>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                      {account.displayName}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setEditingName(true)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      edit
                    </button>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    background: account.isGuest ? 'rgba(245, 158, 11, 0.18)' : 'rgba(16, 185, 129, 0.2)',
                    color: account.isGuest ? '#fbbf24' : '#34d399',
                    border: account.isGuest ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  }}
                >
                  {account.tier}
                </span>

                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#38bdf8' }}>
                  {account.rating} MMR
                </span>
              </div>
            </div>
          </div>

          {/* Close button */}
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

        {/* Quick Guest Upgrade Callout */}
        {account.isGuest && (
          <div
            style={{
              margin: '12px 20px 0',
              padding: '10px 16px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
              <strong style={{ color: '#38bdf8' }}>Playing in Guest Mode:</strong> Create an account to save your ratings & achievements permanently!
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuthModal?.();
              }}
              style={{
                flexShrink: 0,
                padding: '6px 14px',
                borderRadius: '8px',
                background: '#06b6d4',
                color: '#ffffff',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* Lifetime Quick Stats Ribbon */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            padding: '14px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          }}
        >
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>MATCHES</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff' }}>{account.stats.gamesPlayed}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>VICTORIES</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#10b981' }}>{account.stats.wins}</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>WIN RATE</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>{account.stats.winRate}%</div>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>MEDALS</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fbbf24' }}>{unlockedCount}/8</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 20px',
            gap: '16px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            style={{
              padding: '12px 6px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'records' ? '2px solid #10b981' : '2px solid transparent',
              color: activeTab === 'records' ? '#ffffff' : '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <History size={16} />
            <span>Match History ({account.matchHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('achievements')}
            style={{
              padding: '12px 6px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'achievements' ? '2px solid #fbbf24' : '2px solid transparent',
              color: activeTab === 'achievements' ? '#ffffff' : '#94a3b8',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Award size={16} />
            <span>Achievements ({unlockedCount})</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {/* TAB 1: MATCH RECORDS */}
          {activeTab === 'records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {account.matchHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 12px', color: '#64748b' }}>
                  <History size={36} color="#475569" style={{ margin: '0 auto 8px', display: 'block' }} />
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.94rem' }}>No matches recorded yet</p>
                  <span style={{ fontSize: '0.78rem' }}>Play a match in Undercover, Spyfall, or Bhabhi to track records!</span>
                </div>
              ) : (
                account.matchHistory.map((m) => {
                  const isWin = m.result === 'WIN';
                  return (
                    <div
                      key={m.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: isWin ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            background: isWin ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: isWin ? '#34d399' : '#f87171',
                          }}
                        >
                          {m.result}
                        </span>

                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#ffffff' }}>
                            {m.gameName} — {m.roleOrRank}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                            Room: {m.roomCode} • {new Date(m.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 900,
                          color: m.scoreOrRatingDelta >= 0 ? '#34d399' : '#f87171',
                        }}
                      >
                        {m.scoreOrRatingDelta >= 0 ? `+${m.scoreOrRatingDelta}` : m.scoreOrRatingDelta} MMR
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: ACHIEVEMENTS */}
          {activeTab === 'achievements' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {account.achievements.map((ach) => {
                const isUnlocked = Boolean(ach.unlockedAt);
                return (
                  <div
                    key={ach.id}
                    style={{
                      padding: '14px',
                      borderRadius: '14px',
                      background: isUnlocked ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                      border: isUnlocked ? '1.5px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(255, 255, 255, 0.06)',
                      opacity: isUnlocked ? 1 : 0.65,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Award size={18} color={isUnlocked ? '#fbbf24' : '#64748b'} />
                          <span style={{ fontWeight: 800, fontSize: '0.88rem', color: isUnlocked ? '#ffffff' : '#94a3b8' }}>
                            {ach.title}
                          </span>
                        </div>

                        {isUnlocked && (
                          <span style={{ fontSize: '0.66rem', fontWeight: 900, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '0.76rem', color: '#94a3b8', margin: '0 0 8px', lineHeight: 1.4 }}>
                        {ach.description}
                      </p>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: isUnlocked ? '#fbbf24' : '#64748b', fontWeight: 600 }}>
                      {isUnlocked
                        ? `Unlocked on ${new Date(ach.unlockedAt!).toLocaleDateString()}`
                        : '🔒 Locked — Complete objective to unlock'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.95)',
          }}
        >
          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '0.84rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            <span>{account.isGuest ? 'Reset Guest Profile' : 'Sign Out'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
            style={{
              padding: '8px 20px',
              fontSize: '0.86rem',
              fontWeight: 800,
              background: '#10b981',
              borderRadius: '10px',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

