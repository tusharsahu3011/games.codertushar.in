import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Sparkles, Plus, Trash2,
  Utensils, Gamepad2, Compass, GraduationCap, Package, TreePine,
  Shield, EyeOff, HelpCircle, Shuffle, ChevronRight, Edit3, Check,
  AlertTriangle, X, UserMinus
} from 'lucide-react';
import { CATEGORIES, WORD_PAIRS } from '../data/wordPairs';
import { getRecommendedRoles } from '../utils/gameEngine';
import { sounds } from '../utils/sound';

const RANDOM_NAMES = [
  'Alex', 'Jordan', 'Maya', 'Liam', 'Chloe', 'Sam',
  'Leo', 'Zara', 'Ethan', 'Priya', 'Noah', 'Elena',
  'Marcus', 'Sophia', 'Rohan', 'Kai', 'Aria', 'Lucas'
];

export const AGENT_COLORS = [
  { bg: 'rgba(6, 182, 212, 0.22)', border: '#06b6d4', text: '#38bdf8' },
  { bg: 'rgba(244, 63, 94, 0.22)', border: '#f43f5e', text: '#fb7185' },
  { bg: 'rgba(168, 85, 247, 0.22)', border: '#a855f7', text: '#c084fc' },
  { bg: 'rgba(16, 185, 129, 0.22)', border: '#10b981', text: '#34d399' },
  { bg: 'rgba(245, 158, 11, 0.22)', border: '#f59e0b', text: '#fbbf24' },
  { bg: 'rgba(129, 140, 248, 0.22)', border: '#818cf8', text: '#a5b4fc' },
  { bg: 'rgba(236, 72, 153, 0.22)', border: '#ec4899', text: '#f472b6' },
  { bg: 'rgba(20, 184, 166, 0.22)', border: '#14b8a6', text: '#2dd4bf' },
];

// Rich, distinct thematic color accents for each category
const CATEGORY_THEMES: Record<string, { color: string; border: string; glow: string; bgActive: string; sample: string }> = {
  all: {
    color: '#c084fc',
    border: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.45)',
    bgActive: 'rgba(168, 85, 247, 0.2)',
    sample: 'Coffee/Tea, Marvel/DC, Paris/Rome...',
  },
  food: {
    color: '#fbbf24',
    border: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.45)',
    bgActive: 'rgba(245, 158, 11, 0.2)',
    sample: 'Pizza/Burger, Sushi/Sashimi, Pancake/Waffle...',
  },
  tech_pop: {
    color: '#f472b6',
    border: '#ec4899',
    glow: 'rgba(236, 72, 153, 0.45)',
    bgActive: 'rgba(236, 72, 153, 0.2)',
    sample: 'Netflix/YouTube, Batman/Spider-Man, Instagram/TikTok...',
  },
  places: {
    color: '#34d399',
    border: '#10b981',
    glow: 'rgba(16, 185, 129, 0.45)',
    bgActive: 'rgba(16, 185, 129, 0.2)',
    sample: 'Beach/Pool, Airport/Station, Forest/Jungle...',
  },
  college: {
    color: '#fb923c',
    border: '#f97316',
    glow: 'rgba(249, 115, 22, 0.45)',
    bgActive: 'rgba(249, 115, 22, 0.2)',
    sample: 'Canteen/Café, Assignment/Exam, Lecture/Seminar...',
  },
  objects: {
    color: '#38bdf8',
    border: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.45)',
    bgActive: 'rgba(6, 182, 212, 0.2)',
    sample: 'Pencil/Pen, Watch/Smartwatch, Umbrella/Raincoat...',
  },
  nature: {
    color: '#4ade80',
    border: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.45)',
    bgActive: 'rgba(34, 197, 94, 0.2)',
    sample: 'Lion/Tiger, Dolphin/Whale, Wolf/Fox...',
  },
};

const MIN_PLAYERS_REQUIRED = 3;

export interface SetupMissionConfig {
  playerNames: string[];
  category: string;
  undercovers: number;
  hasMrWhite: boolean;
  customWords: { civilianWord: string; undercoverWord: string } | null;
}

export interface SetupScreenProps {
  onStartGame: (config: SetupMissionConfig) => void;
}

export default function SetupScreen({ onStartGame }: SetupScreenProps) {
  const [playerNames, setPlayerNames] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('undercover_players');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['Alex', 'Jordan', 'Maya', 'Sam'];
  });

  const [newName, setNewName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customMode, setCustomMode] = useState(false);
  const [customWordA, setCustomWordA] = useState('');
  const [customWordB, setCustomWordB] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const recommended = getRecommendedRoles(playerNames.length);
  const [undercovers, setUndercovers] = useState(recommended.undercovers);
  const [hasMrWhite, setHasMrWhite] = useState(recommended.mrWhites > 0);

  useEffect(() => {
    if (playerNames.length >= 3) {
      const maxAllowed = Math.max(1, Math.floor((playerNames.length - (hasMrWhite ? 2 : 1)) / 2));
      setUndercovers((prev) => Math.min(prev, Math.max(1, maxAllowed)));
    } else {
      setUndercovers(1);
    }
  }, [playerNames.length, hasMrWhite]);

  useEffect(() => {
    try {
      localStorage.setItem('undercover_players', JSON.stringify(playerNames));
    } catch (e) {}
  }, [playerNames]);

  const handleAddPlayer = (e?: React.FormEvent) => {
    e?.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    if (playerNames.some((n) => n.toLowerCase() === clean.toLowerCase())) {
      setErrorMessage('An operative with that name already exists in the roster!');
      sounds.playEliminated();
      return;
    }
    sounds.playTap();
    setErrorMessage('');
    setPlayerNames([...playerNames, clean]);
    setNewName('');
  };

  const handleAddRandomName = () => {
    sounds.playSelect();
    setErrorMessage('');
    const available = RANDOM_NAMES.filter(
      (n) => !playerNames.some((p) => p.toLowerCase() === n.toLowerCase())
    );
    if (available.length > 0) {
      const chosen = available[Math.floor(Math.random() * available.length)];
      setPlayerNames([...playerNames, chosen]);
    } else {
      setPlayerNames([...playerNames, `Agent ${playerNames.length + 1}`]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    sounds.playTap();
    setErrorMessage('');
    setPlayerNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAllPlayers = () => {
    sounds.playTap();
    setErrorMessage('');
    setPlayerNames([]);
  };

  const handlePreset = (count: number) => {
    sounds.playSelect();
    setErrorMessage('');
    const chosen = RANDOM_NAMES.slice(0, count);
    setPlayerNames(chosen);
    const rec = getRecommendedRoles(count);
    setUndercovers(rec.undercovers);
    setHasMrWhite(rec.mrWhites > 0);
  };

  const handleCategorySelect = (id: string) => {
    sounds.playSelect();
    setSelectedCategory(id);
  };

  const handleUndercoverSelect = (num: number) => {
    sounds.playSelect();
    setUndercovers(num);
  };

  const handleToggleMrWhite = () => {
    sounds.playSelect();
    setHasMrWhite(!hasMrWhite);
  };

  const handleToggleCustomMode = () => {
    sounds.playTap();
    setCustomMode(!customMode);
  };

  const civiliansCount = Math.max(0, playerNames.length - undercovers - (hasMrWhite ? 1 : 0));

  const handleStart = () => {
    setErrorMessage('');

    if (playerNames.length < MIN_PLAYERS_REQUIRED) {
      sounds.playEliminated();
      setErrorMessage(`Please add at least ${MIN_PLAYERS_REQUIRED} players to start the mission.`);
      return;
    }

    if (civiliansCount < 1) {
      sounds.playEliminated();
      setErrorMessage('You must have at least 1 Civilian operative in the mission. Add more players or reduce Undercover agents.');
      return;
    }

    if (customMode) {
      if (!customWordA.trim() || !customWordB.trim()) {
        sounds.playEliminated();
        setErrorMessage('Please enter both custom words for Civilians and Undercover!');
        return;
      }
    }

    sounds.playDramaticBoom();

    onStartGame({
      playerNames,
      category: selectedCategory,
      undercovers,
      hasMrWhite,
      customWords: customMode
        ? { civilianWord: customWordA.trim(), undercoverWord: customWordB.trim() }
        : null,
    });
  };

  const getCategoryIcon = (iconName: string, color: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils size={18} color={color} />;
      case 'Gamepad2': return <Gamepad2 size={18} color={color} />;
      case 'Compass': return <Compass size={18} color={color} />;
      case 'GraduationCap': return <GraduationCap size={18} color={color} />;
      case 'Package': return <Package size={18} color={color} />;
      case 'TreePine': return <TreePine size={18} color={color} />;
      default: return <Sparkles size={18} color={color} />;
    }
  };

  return (
    <div className="animate-enter" style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Full-width Responsive Grid: Left Column (Operatives) & Right Column (Config & Topics) */}
      <div className="layout-grid-2col">
        {/* LEFT COLUMN: Operatives & Party Presets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Mission Briefing Hero Banner with Solid Espionage Accent */}
          <div style={{
            background: 'rgba(18, 27, 49, 0.85)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-xl)',
            padding: '24px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: 'var(--shadow-card)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge badge-emerald" style={{ fontSize: '0.74rem' }}>Pass & Play</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Single Device Party Mode</span>
              </div>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '2px 0 6px', color: '#ffffff' }}>
                Operative Roster
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.45 }}>
                Gather your squad around. Enter custom player names or tap a quick party preset below.
              </p>
            </div>

            {/* Vibrant Quick Presets */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handlePreset(4)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  background: playerNames.length === 4 ? 'rgba(16, 185, 129, 0.24)' : 'rgba(30, 41, 59, 0.7)',
                  borderColor: playerNames.length === 4 ? 'var(--emerald-accent)' : 'var(--border-glass)',
                  color: playerNames.length === 4 ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: playerNames.length === 4 ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none',
                }}
              >
                4 Players
              </button>

              <button
                onClick={() => handlePreset(6)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  background: playerNames.length === 6 ? 'rgba(139, 92, 246, 0.24)' : 'rgba(30, 41, 59, 0.7)',
                  borderColor: playerNames.length === 6 ? 'var(--violet-accent)' : 'var(--border-glass)',
                  color: playerNames.length === 6 ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: playerNames.length === 6 ? '0 0 15px rgba(139, 92, 246, 0.3)' : 'none',
                }}
              >
                6 Players
              </button>

              <button
                onClick={() => handlePreset(8)}
                className="btn-secondary"
                style={{
                  padding: '8px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  background: playerNames.length === 8 ? 'rgba(245, 158, 11, 0.24)' : 'rgba(30, 41, 59, 0.7)',
                  borderColor: playerNames.length === 8 ? 'var(--amber-accent)' : 'var(--border-glass)',
                  color: playerNames.length === 8 ? '#ffffff' : 'var(--text-secondary)',
                  boxShadow: playerNames.length === 8 ? '0 0 15px rgba(245, 158, 11, 0.3)' : 'none',
                }}
              >
                8 Party
              </button>
            </div>
          </div>

          {/* Operatives Roster Card */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={22} color="var(--emerald-accent)" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                  Active Operatives ({playerNames.length})
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {playerNames.length > 0 && (
                  <button
                    onClick={handleClearAllPlayers}
                    className="btn-secondary"
                    style={{
                      padding: '7px 12px',
                      fontSize: '0.8rem',
                      gap: '5px',
                      color: 'var(--text-muted)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                    title="Remove all players"
                  >
                    <UserMinus size={14} /> Clear All
                  </button>
                )}
                {/* Warm Amber Quick Add Button */}
                <button
                  onClick={handleAddRandomName}
                  style={{
                    padding: '8px 16px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    background: 'rgba(245, 158, 11, 0.14)',
                    border: '1.5px solid rgba(245, 158, 11, 0.45)',
                    color: '#fbbf24',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 0 12px rgba(245, 158, 11, 0.15)',
                  }}
                  title="Add a random agent name"
                >
                  <Shuffle size={14} /> Quick Add Agent
                </button>
              </div>
            </div>

            {/* Input Form with Energetic Add Button */}
            <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '10px', marginBottom: '18px' }}>
              <input
                type="text"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="Type player name and hit Enter..."
                maxLength={20}
                style={{
                  flex: 1,
                  padding: '13px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.96rem',
                }}
              />
              <button
                type="submit"
                className="btn-add"
                style={{ flexShrink: 0 }}
              >
                <Plus size={18} /> Add
              </button>
            </form>

            {/* Players Grid or Clean Empty State */}
            {playerNames.length === 0 ? (
              <div style={{
                padding: '36px 20px',
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1.5px dashed rgba(255, 255, 255, 0.12)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}>
                  <Users size={22} color="var(--text-muted)" />
                </div>
                <span style={{ fontSize: '1rem', color: '#ffffff', fontWeight: 700 }}>
                  No operatives in roster
                </span>
                <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', maxWidth: '340px', lineHeight: 1.4 }}>
                  Type a name above, tap <strong>"Quick Add Agent"</strong>, or pick a party preset (4, 6, 8) to get started.
                </span>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '10px',
                maxHeight: '260px',
                overflowY: 'auto',
                paddingRight: '6px',
              }}>
                {playerNames.map((name, index) => {
                  const colorMeta = AGENT_COLORS[index % AGENT_COLORS.length];
                  return (
                    <div
                      key={index}
                      className="card-interactive"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        minHeight: '48px',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1.5px solid ${colorMeta.border}55`,
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.92rem',
                        fontWeight: 600,
                        gap: '8px',
                        boxShadow: `0 0 14px ${colorMeta.border}1a`,
                        touchAction: 'manipulation',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: colorMeta.bg,
                          border: `1.5px solid ${colorMeta.border}`,
                          color: colorMeta.text,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.78rem',
                          fontWeight: 800,
                          flexShrink: 0,
                        }}>
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {name}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRemovePlayer(index)}
                        style={{
                          background: 'transparent',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: '38px',
                          minHeight: '38px',
                          padding: '6px',
                          borderRadius: '6px',
                          transition: 'color 0.15s ease',
                          touchAction: 'manipulation',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--crimson-accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Remove operative"
                        aria-label={`Remove operative ${name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Roles & Categories */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Role Configuration */}
          <div className="glass-panel">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '18px' }}>
              Role Distribution
            </h3>

            {/* Live Role Breakdown Badges with Vibrant Hues */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '12px',
              marginBottom: '22px',
            }}>
              {/* Civilians: Cyan */}
              <div
                className="card-interactive"
                style={{
                  background: 'rgba(6, 182, 212, 0.14)',
                  border: '1.5px solid rgba(6, 182, 212, 0.45)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 10px',
                  textAlign: 'center',
                  boxShadow: '0 0 16px rgba(6, 182, 212, 0.15)',
                }}
              >
                <Shield size={24} color="#06b6d4" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#38bdf8' }}>{civiliansCount}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Civilians</div>
              </div>

              {/* Undercovers: Crimson */}
              <div
                className="card-interactive"
                style={{
                  background: 'rgba(244, 63, 94, 0.14)',
                  border: '1.5px solid rgba(244, 63, 94, 0.45)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 10px',
                  textAlign: 'center',
                  boxShadow: '0 0 16px rgba(244, 63, 94, 0.15)',
                }}
              >
                <EyeOff size={24} color="#f43f5e" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fb7185' }}>{playerNames.length > 0 ? undercovers : 0}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Undercover</div>
              </div>

              {/* Mr. White: Violet */}
              <div
                className="card-interactive"
                style={{
                  background: hasMrWhite && playerNames.length > 0 ? 'rgba(168, 85, 247, 0.16)' : 'rgba(255, 255, 255, 0.03)',
                  border: hasMrWhite && playerNames.length > 0 ? '1.5px solid rgba(168, 85, 247, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px 10px',
                  textAlign: 'center',
                  opacity: hasMrWhite && playerNames.length > 0 ? 1 : 0.45,
                  boxShadow: hasMrWhite && playerNames.length > 0 ? '0 0 16px rgba(168, 85, 247, 0.2)' : 'none',
                }}
              >
                <HelpCircle size={24} color={hasMrWhite ? "#c084fc" : "#64748b"} style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '1.7rem', fontWeight: 900, color: hasMrWhite && playerNames.length > 0 ? '#c084fc' : 'var(--text-muted)' }}>
                  {hasMrWhite && playerNames.length > 0 ? 1 : 0}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>Mr. White</div>
              </div>
            </div>

            {/* Undercover Selector with Solid Active State */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ fontWeight: 600 }}>Undercover Operatives:</span>
                <span style={{ fontWeight: 800, color: 'var(--crimson-accent)' }}>
                  {undercovers} {undercovers === 1 ? 'Agent' : 'Agents'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3].map((num) => {
                  const maxAllowed = Math.max(1, Math.floor((playerNames.length - (hasMrWhite ? 2 : 1)) / 2));
                  const isDisabled = playerNames.length < 3 || num > maxAllowed;
                  const isSelected = undercovers === num;

                  return (
                    <button
                      key={num}
                      disabled={isDisabled}
                      onClick={() => handleUndercoverSelect(num)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        background: isSelected
                          ? '#f43f5e'
                          : 'rgba(255, 255, 255, 0.05)',
                        color: isSelected ? '#fff' : isDisabled ? 'var(--text-muted)' : 'var(--text-secondary)',
                        opacity: isDisabled ? 0.35 : 1,
                        border: isSelected ? '1.5px solid #f43f5e' : '1.5px solid var(--border-glass)',
                        boxShadow: isSelected ? '0 0 18px rgba(244, 63, 94, 0.45)' : 'none',
                      }}
                    >
                      {num} {num === 1 ? 'Agent' : 'Agents'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mr White Toggle with Violet Ambient Accent */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: 'var(--radius-md)',
              border: hasMrWhite ? '1.5px solid rgba(168, 85, 247, 0.4)' : '1.5px solid var(--border-glass)',
              boxShadow: hasMrWhite ? '0 0 16px rgba(168, 85, 247, 0.15)' : 'none',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Mystery Role: Mr. White</span>
                  <span className="badge badge-violet" style={{ fontSize: '0.65rem' }}>Bonus</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Receives no word; wins immediately if they deduce the secret word!
                </div>
              </div>
              <button
                onClick={handleToggleMrWhite}
                style={{
                  width: '52px',
                  height: '28px',
                  borderRadius: '20px',
                  background: hasMrWhite ? '#a855f7' : 'rgba(255, 255, 255, 0.12)',
                  padding: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: hasMrWhite ? 'flex-end' : 'flex-start',
                  boxShadow: hasMrWhite ? '0 0 16px rgba(168, 85, 247, 0.6)' : 'none',
                }}
              >
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#ffffff',
                }} />
              </button>
            </div>
          </div>

          {/* Topics & Word Categories with Distinct Multi-Color Signature Badges */}
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                Category & Topic
              </h3>
              {/* Vibrant Violet Custom Mode Button */}
              <button
                onClick={handleToggleCustomMode}
                style={{
                  padding: '7px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  background: customMode ? 'rgba(168, 85, 247, 0.24)' : 'rgba(168, 85, 247, 0.1)',
                  border: customMode ? '1.5px solid #a855f7' : '1.5px solid rgba(168, 85, 247, 0.35)',
                  color: '#c084fc',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: customMode ? '0 0 15px rgba(168, 85, 247, 0.35)' : 'none',
                }}
              >
                <Edit3 size={14} /> {customMode ? 'Custom Words Active' : 'Custom Mode'}
              </button>
            </div>

            {!customMode ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '12px',
              }}>
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  const theme = CATEGORY_THEMES[cat.id] || CATEGORY_THEMES.all;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="card-interactive"
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = theme.border;
                          e.currentTarget.style.boxShadow = `0 4px 18px ${theme.glow}`;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'var(--border-glass)';
                          e.currentTarget.style.boxShadow = 'none';
                        }
                      }}
                      style={{
                        height: '96px',
                        minHeight: '96px',
                        maxHeight: '96px',
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: isSelected ? theme.bgActive : 'rgba(255, 255, 255, 0.04)',
                        border: isSelected ? `1.5px solid ${theme.border}` : '1.5px solid var(--border-glass)',
                        color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        textAlign: 'left',
                        boxShadow: isSelected ? `0 0 20px ${theme.glow}` : 'none',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {/* Fixed Top Row with Distinct Thematic Color Icon */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                        <div style={{ flexShrink: 0 }}>
                          {getCategoryIcon(cat.icon, isSelected ? theme.color : 'var(--text-muted)')}
                        </div>
                        <span style={{
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          flex: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                        }}>
                          {cat.label}
                        </span>
                        <div style={{ width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isSelected && <Check size={14} color={theme.color} />}
                        </div>
                      </div>

                      {/* Fixed 2-Line Sample Preview */}
                      <span style={{
                        fontSize: '0.72rem',
                        color: isSelected ? 'var(--text-secondary)' : 'var(--text-muted)',
                        lineHeight: 1.35,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        width: '100%',
                      }}>
                        {theme.sample}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Enter your custom secret pair for this round. Keep the screen private from other players!
                </p>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>
                    Civilian Word (Given to majority):
                  </label>
                  <input
                    type="text"
                    value={customWordA}
                    onChange={(e) => setCustomWordA(e.target.value)}
                    placeholder="e.g. Iron Man"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>
                    Undercover Word (Given to infiltrator):
                  </label>
                  <input
                    type="text"
                    value={customWordB}
                    onChange={(e) => setCustomWordB(e.target.value)}
                    placeholder="e.g. Batman"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--radius-md)' }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User-Friendly Inline Validation Alert Notification */}
      {errorMessage && (
        <div className="animate-enter" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 22px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(244, 63, 94, 0.16)',
          border: '1.5px solid rgba(244, 63, 94, 0.45)',
          color: '#fb7185',
          fontSize: '0.96rem',
          fontWeight: 700,
          boxShadow: '0 0 25px rgba(244, 63, 94, 0.25)',
        }}>
          <AlertTriangle size={22} color="#f43f5e" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, lineHeight: 1.4 }}>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            style={{
              background: 'transparent',
              color: '#fb7185',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
              borderRadius: '4px',
            }}
            title="Dismiss message"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Start Mission Launch Bar with Solid Espionage Accent */}
      <div style={{
        marginTop: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        background: 'rgba(15, 23, 42, 0.8)',
        padding: '20px 28px',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-glass-bright)',
        boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(16, 185, 129, 0.18)',
            border: '1.5px solid #10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(16, 185, 129, 0.25)',
          }}>
            <Sparkles size={22} color="var(--emerald-light)" />
          </div>
          <div>
            <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#ffffff' }}>
              Ready to Infiltrate?
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {playerNames.length} Operative{playerNames.length === 1 ? '' : 's'} • {civiliansCount} Civilian{civiliansCount === 1 ? '' : 's'} • {playerNames.length > 0 ? undercovers : 0} Undercover{hasMrWhite && playerNames.length > 0 ? ' • 1 Mr. White' : ''}
            </div>
          </div>
        </div>

        {/* High-Contrast Energetic Multi-Color Launch Button */}
        <button
          onClick={handleStart}
          className="btn-launch"
        >
          <span>Start Mission</span>
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
