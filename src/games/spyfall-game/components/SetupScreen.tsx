import { useState } from 'react';
import {
  Users,
  Clock,
  Shield,
  Plus,
  Trash2,
  Dice5,
  Play,
  ArrowLeft,
  Compass,
  Check,
  Sparkles,
} from 'lucide-react';
import type { SpyfallSettings, LocationCategory } from '../types';
import { AGENT_CODENAMES, AGENT_COLORS } from '../utils/gameEngine';
import { spySounds } from '../utils/sound';

export interface SetupPlayer {
  id: string;
  name: string;
  color: string;
}

export interface SpyfallSetupScreenProps {
  onStartGame: (players: SetupPlayer[], settings: SpyfallSettings) => void;
  onBackToModeSelect: () => void;
}

const CATEGORY_OPTIONS: { id: LocationCategory; label: string; icon: string; count: string }[] = [
  { id: 'all', label: 'All Classified Locations', icon: '🌐', count: '24+ Locs' },
  { id: 'classic', label: 'Classic Espionage', icon: '✈️', count: '10 Locs' },
  { id: 'urban', label: 'Urban & Everyday Life', icon: '🏙️', count: '8 Locs' },
  { id: 'adventure', label: 'Action & Adventure', icon: '🏴‍☠️', count: '6 Locs' },
  { id: 'scifi', label: 'Sci-Fi & Top Secret', icon: '🛸', count: '4 Locs' },
];

const TIMER_OPTIONS = [
  { seconds: 300, label: '5 Min' },
  { seconds: 420, label: '7 Min (Standard)' },
  { seconds: 480, label: '8 Min' },
  { seconds: 600, label: '10 Min' },
  { seconds: 0, label: 'Untimed' },
];

export default function SpyfallSetupScreen({
  onStartGame,
  onBackToModeSelect,
}: SpyfallSetupScreenProps) {
  const [players, setPlayers] = useState<SetupPlayer[]>([
    { id: 'p1', name: 'Agent Falcon', color: AGENT_COLORS[0] },
    { id: 'p2', name: 'Shadow Hawk', color: AGENT_COLORS[1] },
    { id: 'p3', name: 'Operative Viper', color: AGENT_COLORS[2] },
    { id: 'p4', name: 'Cipher', color: AGENT_COLORS[3] },
    { id: 'p5', name: 'Ghost Raven', color: AGENT_COLORS[4] },
  ]);

  const [spyCount, setSpyCount] = useState<number>(1);
  const [roundDuration, setRoundDuration] = useState<number>(420);
  const [category, setCategory] = useState<LocationCategory>('all');
  const [rolesEnabled, setRolesEnabled] = useState<boolean>(true);

  const handleAddPlayer = () => {
    if (players.length >= 12) return;
    spySounds.playTap();
    const nextIndex = players.length;
    const randomCodename = AGENT_CODENAMES[Math.floor(Math.random() * AGENT_CODENAMES.length)];
    const newPlayer: SetupPlayer = {
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      name: `${randomCodename} ${nextIndex + 1}`,
      color: AGENT_COLORS[nextIndex % AGENT_COLORS.length],
    };
    setPlayers([...players, newPlayer]);
  };

  const handleRemovePlayer = (id: string) => {
    if (players.length <= 3) return;
    spySounds.playTap();
    const filtered = players.filter((p) => p.id !== id);
    setPlayers(filtered);
    if (spyCount > Math.max(1, Math.floor(filtered.length / 3))) {
      setSpyCount(1);
    }
  };

  const handleUpdateName = (id: string, name: string) => {
    setPlayers(players.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const handleRandomizeNames = () => {
    spySounds.playSelect();
    const shuffledCodenames = [...AGENT_CODENAMES].sort(() => 0.5 - Math.random());
    setPlayers(
      players.map((p, i) => ({
        ...p,
        name: shuffledCodenames[i % shuffledCodenames.length] || `Operative ${i + 1}`,
      }))
    );
  };

  const handlePresetRoster = (count: number) => {
    spySounds.playSelect();
    const shuffledCodenames = [...AGENT_CODENAMES].sort(() => 0.5 - Math.random());
    const newRoster: SetupPlayer[] = [];
    for (let i = 0; i < count; i++) {
      newRoster.push({
        id: `p_${Date.now()}_${i}`,
        name: shuffledCodenames[i % shuffledCodenames.length] || `Agent ${i + 1}`,
        color: AGENT_COLORS[i % AGENT_COLORS.length],
      });
    }
    setPlayers(newRoster);
    if (spyCount > Math.max(1, Math.floor(count / 3))) {
      setSpyCount(1);
    }
  };

  const handleLaunch = () => {
    if (players.length < 3) return;
    spySounds.playDramaticSting();
    onStartGame(players, {
      spyCount,
      roundDurationSeconds: roundDuration,
      category,
      rolesEnabled,
    });
  };

  return (
    <div style={{
      maxWidth: '920px',
      margin: '0 auto',
      padding: '24px 16px 80px',
    }}>
      {/* Top Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px',
      }}>
        <button
          onClick={() => {
            spySounds.playTap();
            onBackToModeSelect();
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            padding: '8px 14px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          <ArrowLeft size={16} />
          <span>Mode Select</span>
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}>
            Pass & Play Setup
          </h1>
          <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>
            Configure Operatives & Tactical Parameters
          </span>
        </div>

        <div style={{ width: '100px' }} />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
      }}>
        {/* Left Column: Player Roster */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} color="#06b6d4" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Operatives ({players.length})
              </h2>
            </div>

            <button
              onClick={handleRandomizeNames}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                color: '#38bdf8',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
              title="Assign Random Agent Codenames"
            >
              <Dice5 size={14} />
              <span>Randomize</span>
            </button>
          </div>

          {/* Quick Roster Presets */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}>
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700 }}>PRESETS:</span>
            {[4, 5, 6, 8, 10].map((num) => (
              <button
                key={num}
                onClick={() => handlePresetRoster(num)}
                style={{
                  background: players.length === num ? 'rgba(6, 182, 212, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                  border: players.length === num ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: players.length === num ? '#38bdf8' : '#94a3b8',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {num}P
              </button>
            ))}
          </div>

          {/* Player List */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            maxHeight: '360px',
            overflowY: 'auto',
            paddingRight: '4px',
            marginBottom: '16px',
          }}>
            {players.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '12px',
                  padding: '8px 12px',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: p.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  flexShrink: 0,
                }}>
                  #{idx + 1}
                </div>

                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => handleUpdateName(p.id, e.target.value)}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    outline: 'none',
                  }}
                  placeholder={`Agent ${idx + 1}`}
                  maxLength={24}
                />

                {players.length > 3 && (
                  <button
                    onClick={() => handleRemovePlayer(p.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                    title="Remove operative"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Player Button */}
          {players.length < 12 && (
            <button
              onClick={handleAddPlayer}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px dashed rgba(255, 255, 255, 0.15)',
                color: '#cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
            >
              <Plus size={16} />
              <span>Add Operative ({players.length}/12)</span>
            </button>
          )}
        </div>

        {/* Right Column: Mission Parameters */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Spy Count */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Shield size={16} color="#f43f5e" />
                Number of Spies
              </span>
              <span style={{ fontSize: '0.82rem', color: '#f43f5e', fontWeight: 800 }}>
                {spyCount} {spyCount === 1 ? 'Infiltrator' : 'Infiltrators'}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { spySounds.playTap(); setSpyCount(1); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: spyCount === 1 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: spyCount === 1 ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: spyCount === 1 ? '#fb7185' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                1 Spy (Standard)
              </button>

              <button
                onClick={() => {
                  if (players.length < 6) return;
                  spySounds.playTap();
                  setSpyCount(2);
                }}
                disabled={players.length < 6}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  background: spyCount === 2 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: spyCount === 2 ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: players.length < 6 ? '#475569' : spyCount === 2 ? '#fb7185' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: players.length < 6 ? 'not-allowed' : 'pointer',
                }}
              >
                2 Spies (Requires 6+ Players)
              </button>
            </div>
          </div>

          {/* Round Clock */}
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '10px',
            }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={16} color="#06b6d4" />
                Interrogation Clock
              </span>
              <span style={{ fontSize: '0.82rem', color: '#06b6d4', fontWeight: 800 }}>
                {roundDuration === 0 ? 'Untimed' : `${Math.floor(roundDuration / 60)} Minutes`}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {TIMER_OPTIONS.map((t) => (
                <button
                  key={t.seconds}
                  onClick={() => { spySounds.playTap(); setRoundDuration(t.seconds); }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: roundDuration === t.seconds ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: roundDuration === t.seconds ? '1px solid #06b6d4' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: roundDuration === t.seconds ? '#38bdf8' : '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Category Pack */}
          <div>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Compass size={16} color="#10b981" />
              Location Pack
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CATEGORY_OPTIONS.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => { spySounds.playTap(); setCategory(cat.id); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: category === cat.id ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: category === cat.id ? '1px solid #10b981' : '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700, color: category === cat.id ? '#ffffff' : '#cbd5e1' }}>
                      {cat.label}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: category === cat.id ? '#34d399' : '#64748b', fontWeight: 700 }}>
                    {cat.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Specific Roles Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)',
          }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                Assigned Operative Roles
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Each operative receives a unique job (e.g., Captain, Doctor, Chef)
              </div>
            </div>

            <button
              onClick={() => { spySounds.playTap(); setRolesEnabled(!rolesEnabled); }}
              style={{
                width: '44px',
                height: '24px',
                borderRadius: '999px',
                background: rolesEnabled ? '#06b6d4' : '#334155',
                border: 'none',
                position: 'relative',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#ffffff',
                position: 'absolute',
                top: '3px',
                left: rolesEnabled ? '23px' : '3px',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>
        </div>
      </div>

      {/* Launch Mission CTA */}
      <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={handleLaunch}
          style={{
            minWidth: '280px',
            padding: '16px 36px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
            color: '#ffffff',
            border: 'none',
            fontSize: '1.15rem',
            fontWeight: 900,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            boxShadow: '0 12px 30px -5px rgba(6, 182, 212, 0.5)',
            letterSpacing: '0.02em',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 16px 35px -5px rgba(6, 182, 212, 0.7)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 12px 30px -5px rgba(6, 182, 212, 0.5)';
          }}
        >
          <Play size={22} />
          <span>Commence Briefing</span>
        </button>
      </div>
    </div>
  );
}
