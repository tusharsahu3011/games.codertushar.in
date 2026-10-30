import { useState } from 'react';
import { X, Search, Check, Ban, HelpCircle, MapPin, Compass } from 'lucide-react';
import type { SpyfallLocation } from '../types';
import { SPYFALL_LOCATIONS } from '../data/locations';
import { spySounds } from '../utils/sound';

export interface LocationReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForGuess?: (location: SpyfallLocation) => void;
  isGuessMode?: boolean;
}

export default function LocationReferenceModal({
  isOpen,
  onClose,
  onSelectForGuess,
  isGuessMode = false,
}: LocationReferenceModalProps) {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [eliminatedIds, setEliminatedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleEliminate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    spySounds.playTap();
    const updated = new Set(eliminatedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setEliminatedIds(updated);
  };

  const filtered = SPYFALL_LOCATIONS.filter((loc) => {
    const matchesCategory = filterCategory === 'all' || loc.category === filterCategory;
    const matchesSearch =
      loc.name.toLowerCase().includes(search.toLowerCase()) ||
      loc.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}>
      <div style={{
        background: '#090e17',
        border: isGuessMode ? '2px solid #f43f5e' : '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '24px',
        maxWidth: '880px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isGuessMode
          ? '0 25px 50px -12px rgba(244, 63, 94, 0.4), 0 0 40px rgba(244, 63, 94, 0.2)'
          : '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(6, 182, 212, 0.15)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: isGuessMode ? 'rgba(244, 63, 94, 0.2)' : 'rgba(6, 182, 212, 0.15)',
              border: isGuessMode ? '1px solid #f43f5e' : '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Compass size={22} color={isGuessMode ? '#fb7185' : '#38bdf8'} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
                {isGuessMode ? 'Spy Location Guess — Pick Secret Location' : 'Classified Location Reference Matrix'}
              </h2>
              <span style={{ fontSize: '0.78rem', color: isGuessMode ? '#fb7185' : '#94a3b8' }}>
                {isGuessMode
                  ? 'Identify the location to win immediately! If incorrect, operatives win.'
                  : 'Tap the ⊘ button to cross out ruled-out locations during questioning.'}
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

        {/* Filter and Search Bar */}
        <div style={{
          padding: '14px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'rgba(15, 23, 42, 0.5)',
        }}>
          {/* Search Input */}
          <div style={{
            flex: '1 1 200px',
            position: 'relative',
          }}>
            <Search size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '10px' }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search locations..."
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'classic', label: 'Classic' },
              { id: 'urban', label: 'Urban' },
              { id: 'adventure', label: 'Adventure' },
              { id: 'scifi', label: 'Sci-Fi' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => { spySounds.playTap(); setFilterCategory(cat.id); }}
                style={{
                  background: filterCategory === cat.id ? '#06b6d4' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: filterCategory === cat.id ? '#030712' : '#94a3b8',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Location Grid */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '12px',
        }}>
          {filtered.map((loc) => {
            const isEliminated = eliminatedIds.has(loc.id);

            return (
              <div
                key={loc.id}
                onClick={() => {
                  if (isGuessMode && onSelectForGuess) {
                    spySounds.playSelect();
                    onSelectForGuess(loc);
                  }
                }}
                style={{
                  background: isEliminated
                    ? 'rgba(15, 23, 42, 0.3)'
                    : isGuessMode
                    ? 'rgba(244, 63, 94, 0.08)'
                    : 'rgba(15, 23, 42, 0.7)',
                  border: isEliminated
                    ? '1px dashed rgba(255, 255, 255, 0.08)'
                    : isGuessMode
                    ? '1.5px solid rgba(244, 63, 94, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isGuessMode ? 'pointer' : 'default',
                  opacity: isEliminated ? 0.45 : 1,
                  position: 'relative',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (isGuessMode) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = '#f43f5e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isGuessMode) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                  }
                }}
              >
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}>
                    <span style={{ fontSize: '1.6rem' }}>{loc.emoji}</span>

                    {!isGuessMode && (
                      <button
                        onClick={(e) => toggleEliminate(loc.id, e)}
                        style={{
                          background: isEliminated ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                          border: isEliminated ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.1)',
                          color: isEliminated ? '#f87171' : '#64748b',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title={isEliminated ? 'Restore location' : 'Cross out location'}
                      >
                        <Ban size={12} />
                        <span>{isEliminated ? 'Ruled Out' : 'Cross Out'}</span>
                      </button>
                    )}
                  </div>

                  <h4 style={{
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: isEliminated ? '#64748b' : '#ffffff',
                    margin: '0 0 4px',
                    textDecoration: isEliminated ? 'line-through' : 'none',
                  }}>
                    {loc.name}
                  </h4>

                  <p style={{
                    fontSize: '0.76rem',
                    color: '#94a3b8',
                    margin: 0,
                    lineHeight: 1.4,
                  }}>
                    {loc.description}
                  </p>
                </div>

                {isGuessMode && (
                  <div style={{
                    marginTop: '12px',
                    padding: '6px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.2)',
                    color: '#fb7185',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textAlign: 'center',
                  }}>
                    Click to Guess This Location
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.4)',
        }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Showing {filtered.length} locations • {eliminatedIds.size} crossed out
          </span>

          <button
            onClick={() => {
              spySounds.playTap();
              onClose();
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Close Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
