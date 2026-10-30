import { useState, useMemo } from 'react';
import type { GameItem, HubCategory } from '../../types/hub';
import GameCard from './GameCard';
import {
  Search,
  X,
  Sparkles,
  Flame,
  Layers,
  RotateCcw,
  PlayingCards,
  Eye,
  PartyPopper,
  Radio,
} from 'lucide-react';
import { sounds } from '../../games/undercover-game/utils/sound';
import GamePreviewModal from './GamePreviewModal';

export const CATALOG_GAMES: GameItem[] = [
  {
    id: 'undercover',
    title: 'Undercover',
    tagline: 'Social Deception & Word Deduction',
    description: 'Civilians receive the secret word while Undercover receives a slightly different word. Mr. White infiltrates with zero clues. Give subtle hints, interrogate suspects, and vote out impostors!',
    status: 'ACTIVE',
    genre: 'Social Deduction / Bluffing',
    category: 'deduction',
    playerRange: '3 - 20 Players',
    estimatedTime: '10 - 15 Min',
    accentColor: '#10b981',
    iconName: 'Eye',
    features: ['Pass & Play (Local)', 'Online Multiplayer', 'WebRTC Live Mic', '110+ Word Pairs', 'Room Codes'],
  },
  {
    id: 'spyfall',
    title: 'Spyfall',
    tagline: 'Location Interrogation & Deduction',
    description: 'All operatives are briefed on a secret location except the Spy. Ask tactical questions to unmask the spy before they figure out where you are!',
    status: 'ACTIVE',
    genre: 'Interrogation / Bluffing',
    category: 'deduction',
    playerRange: '3 - 12 Players',
    estimatedTime: '8 - 12 Min',
    accentColor: '#06b6d4',
    iconName: 'Compass',
    features: ['Pass & Play (Local)', 'Online Multiplayer', 'WebRTC Live Mic', '24+ Secret Locations', 'Interactive Matrix'],
  },
  {
    id: 'bhabhi',
    title: 'Bhabhi (Get Away)',
    tagline: 'Traditional Indian Card Game & Thoko',
    description: 'All 52 cards dealt! The holder of Ace of Spades leads. Follow suit or throw an off-suit Thoko to force the highest card holder to pick up the trick. Shed your cards to get away — don\'t become the Bhabhi!',
    status: 'ACTIVE',
    genre: 'Traditional Card / Evasion',
    category: 'cards',
    playerRange: '3 - 6 Players',
    estimatedTime: '10 - 15 Min',
    accentColor: '#f59e0b',
    iconName: 'Spade',
    features: ['Solo vs AI Bots', 'Online Multiplayer', 'Authoritative Sync', 'Thoko Penalty Pickup', '52-Card Deal'],
  },
  {
    id: 'decrypto',
    title: 'Decrypto',
    tagline: 'Encrypted Radio Transmission',
    description: 'Two rival teams transmit secret 3-digit numeric codes to their teammates without letting the enemy intercept team crack the encrypted keyword associations.',
    status: 'COMING_SOON',
    genre: 'Team Strategy / Words',
    category: 'words',
    playerRange: '4 - 8 Players',
    estimatedTime: '20 - 30 Min',
    accentColor: '#8b5cf6',
    iconName: 'Radio',
    features: ['Team vs Team', 'Interception Tokens', 'Keyword Encryption', 'Live Whiteboard'],
  },
  {
    id: 'codenames',
    title: 'Codenames',
    tagline: 'Grid Association & Spymasters',
    description: 'Two rival spymasters give one-word clues pointing to secret agent code words on a 25-card table grid. Avoid the deadly Assassin!',
    status: 'COMING_SOON',
    genre: 'Word Association',
    category: 'words',
    playerRange: '4 - 12 Players',
    estimatedTime: '15 - 20 Min',
    accentColor: '#f97316',
    iconName: 'Grid',
    features: ['Spymaster View', '25-Card Grid', 'Assassin Risk', 'Timed Clue Rounds'],
  },
  {
    id: 'avalon',
    title: 'Avalon: Secret Identities',
    tagline: 'Hidden Loyalty Quests',
    description: 'Loyal Servants of Arthur embark on epic quests while Minions of Mordred secretly sabotage missions from within. Deduce Merlin before the assassin strikes.',
    status: 'COMING_SOON',
    genre: 'Social Deduction / Quests',
    category: 'deduction',
    playerRange: '5 - 10 Players',
    estimatedTime: '25 - 35 Min',
    accentColor: '#f43f5e',
    iconName: 'Shield',
    features: ['Quest Voting', 'Merlin & Assassin', 'Role Bluffing', 'Zero Elimination'],
  },
  {
    id: 'secret_chancellor',
    title: 'Secret Chancellor',
    tagline: 'Government Intrigue & Policy Enactment',
    description: 'A tense political deduction game where Liberals and hidden Fascists fight for control of parliament. Elect presidents, pass state policies, and stop the Chancellor!',
    status: 'COMING_SOON',
    genre: 'Political Deduction',
    category: 'deduction',
    playerRange: '5 - 10 Players',
    estimatedTime: '30 - 45 Min',
    accentColor: '#ec4899',
    iconName: 'Crown',
    features: ['Policy Deck', 'Presidential Elections', 'Executive Veto', 'Secret Loyalty'],
  },
  {
    id: 'werewolf',
    title: 'Ultimate Werewolf',
    tagline: 'Village Trials & Nightly Horrors',
    description: 'Each night the Werewolves feed; each dawn the villagers awaken to mourn the fallen and vote to execute a suspect. Seers, Doctors, and Hunters work in secrecy.',
    status: 'COMING_SOON',
    genre: 'Party / Hidden Roles',
    category: 'deduction',
    playerRange: '6 - 24 Players',
    estimatedTime: '20 - 40 Min',
    accentColor: '#6366f1',
    iconName: 'Eye',
    features: ['Night Audio Narration', '15+ Unique Roles', 'Town Square Debates', 'Death Spectator Mode'],
  },
  {
    id: 'two_rooms',
    title: 'Two Rooms and a Boom',
    tagline: 'Fast-Paced Room Hostage Swaps',
    description: 'Two separate virtual rooms! The Blue Team must keep the President safe, while the Red Team tries to send the Bomber into the President\'s room at the final detonation countdown.',
    status: 'COMING_SOON',
    genre: 'High-Energy Party',
    category: 'party',
    playerRange: '6 - 30 Players',
    estimatedTime: '10 - 15 Min',
    accentColor: '#14b8a6',
    iconName: 'Flame',
    features: ['Virtual Room Shuffling', 'Leader Hostage Swaps', 'Card Share & Color Reveal', 'Ticking Bomb Timer'],
  },
  {
    id: 'wavelength',
    title: 'Wavelength',
    tagline: 'Telepathic Spectrum Guessing',
    description: 'A mind-reading party game where two teams compete to read each other\'s thoughts along a spectrum: Hot vs Cold, Overrated vs Underrated, Rough vs Smooth.',
    status: 'COMING_SOON',
    genre: 'Mind Reading / Party',
    category: 'party',
    playerRange: '4 - 12 Players',
    estimatedTime: '15 - 25 Min',
    accentColor: '#a855f7',
    iconName: 'Radio',
    features: ['Interactive Rotating Dial', 'Target Bullseye', 'Team Discussion Wheel', 'Custom Spectrum Topics'],
  },
  {
    id: 'teen_patti',
    title: 'Teen Patti Flush',
    tagline: 'Traditional Indian 3-Card Poker',
    description: 'Classic 3-card Indian showdown. Play Blind or Seen, raise the Chaal, call Sideshows, and take the pot with a Trail, Pure Sequence, or Color!',
    status: 'COMING_SOON',
    genre: 'Card / Wagering',
    category: 'cards',
    playerRange: '3 - 6 Players',
    estimatedTime: '10 - 15 Min',
    accentColor: '#eab308',
    iconName: 'Spade',
    features: ['Blind vs Chaal Stakes', 'Sideshow Requests', 'Trail & Pure Sequence Rules', 'Virtual Chip Banks'],
  },
];

export interface GameGridProps {
  onPlayGame: (gameId: string) => void;
  selectedCategory?: HubCategory;
  onSelectCategory?: (category: HubCategory) => void;
}

export default function GameGrid({
  onPlayGame,
  selectedCategory = 'all',
  onSelectCategory,
}: GameGridProps) {
  const [activeCategory, setActiveCategory] = useState<HubCategory>(selectedCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewGame, setPreviewGame] = useState<GameItem | null>(null);

  const currentCategory = onSelectCategory ? selectedCategory : activeCategory;

  const handleCategoryChange = (cat: HubCategory) => {
    sounds.playTap();
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setActiveCategory(cat);
    }
  };

  const handleClearSearch = () => {
    sounds.playTap();
    setSearchQuery('');
  };

  // Filtered games based on active category & search query
  const filteredGames = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CATALOG_GAMES.filter((game) => {
      // Category match
      let matchesCategory = true;
      if (currentCategory === 'cards') {
        matchesCategory = game.category === 'cards';
      } else if (currentCategory === 'deduction') {
        matchesCategory = game.category === 'deduction';
      } else if (currentCategory === 'party') {
        matchesCategory =
          game.category === 'party' ||
          game.id === 'undercover' ||
          game.id === 'spyfall' ||
          game.id === 'bhabhi' ||
          game.id === 'codenames' ||
          game.id === 'werewolf' ||
          game.id === 'two_rooms' ||
          game.id === 'wavelength';
      } else if (currentCategory === 'words') {
        matchesCategory = game.category === 'words';
      }

      if (!matchesCategory) return false;

      // Search query match
      if (!q) return true;
      const haystack = `${game.title} ${game.tagline} ${game.description} ${game.genre} ${game.playerRange} ${game.features.join(' ')}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [currentCategory, searchQuery]);

  const categories = [
    { id: 'all' as HubCategory, label: 'All Games', icon: Sparkles, color: '#10b981', count: CATALOG_GAMES.length },
    {
      id: 'cards' as HubCategory,
      label: 'Card Games',
      icon: PlayingCards,
      color: '#f59e0b',
      count: CATALOG_GAMES.filter((g) => g.category === 'cards').length,
    },
    {
      id: 'deduction' as HubCategory,
      label: 'Social Bluff & Deduction',
      icon: Eye,
      color: '#06b6d4',
      count: CATALOG_GAMES.filter((g) => g.category === 'deduction').length,
    },
    {
      id: 'party' as HubCategory,
      label: 'Party & Group Fun',
      icon: PartyPopper,
      color: '#ec4899',
      count: CATALOG_GAMES.filter(
        (g) =>
          g.category === 'party' ||
          g.id === 'undercover' ||
          g.id === 'spyfall' ||
          g.id === 'bhabhi' ||
          g.id === 'codenames' ||
          g.id === 'werewolf' ||
          g.id === 'two_rooms' ||
          g.id === 'wavelength'
      ).length,
    },
    {
      id: 'words' as HubCategory,
      label: 'Word & Spymasters',
      icon: Radio,
      color: '#8b5cf6',
      count: CATALOG_GAMES.filter((g) => g.category === 'words').length,
    },
  ];

  return (
    <section
      id="game-catalog-section"
      style={{
        maxWidth: '1240px',
        margin: '0 auto 60px',
        padding: '0 clamp(14px, 3vw, 24px)',
      }}
    >
      {/* SECTION HEADER & SEARCH BAR */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: '0.68rem',
                  fontWeight: 900,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                GAMES HUB
              </span>
              <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 600 }}>
                {CATALOG_GAMES.filter((g) => g.status === 'ACTIVE').length} Playable Now
              </span>
            </div>

            <h2
              style={{
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.025em',
                margin: 0,
              }}
            >
              Explore Available Games
            </h2>
          </div>

          {/* Search Box */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <Search
              size={18}
              color="#94a3b8"
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search games, bluff, cards, players..."
              className="search-input-box"
              aria-label="Search games"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY SELECTOR PILLS */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            overflowX: 'auto',
            paddingBottom: '6px',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {categories.map((cat) => {
            const isActive = currentCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`category-pill ${isActive ? 'active' : ''}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Icon size={16} color={isActive ? '#ffffff' : cat.color} />
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: '0.7rem',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    fontWeight: 800,
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER SEARCH STATUS (if searching) */}
      {searchQuery && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            color: '#e2e8f0',
            fontSize: '0.86rem',
            fontWeight: 700,
          }}
        >
          <span>
            Found {filteredGames.length} game{filteredGames.length === 1 ? '' : 's'} matching "{searchQuery}"
          </span>
          <button
            type="button"
            onClick={handleClearSearch}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#34d399',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <RotateCcw size={12} />
            <span>Reset Search</span>
          </button>
        </div>
      )}

      {/* EMPTY SEARCH STATE */}
      {filteredGames.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            background: '#0d131f',
            border: '1.5px dashed rgba(255, 255, 255, 0.12)',
            borderRadius: '24px',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
            No games found matching your search
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 20px' }}>
            Try searching for "bhabhi", "cards", "bluff", "undercover", or reset your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setSearchQuery('');
              handleCategoryChange('all');
            }}
            style={{
              background: '#10b981',
              border: 'none',
              color: '#ffffff',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
          >
            Show All Games
          </button>
        </div>
      ) : (
        /* COHESIVE UNIFIED GAME CATALOG GRID */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: '20px',
          }}
        >
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onPlay={onPlayGame}
              onPreview={(g) => setPreviewGame(g)}
            />
          ))}
        </div>
      )}

      {/* Interactive Modal for Previewing Upcoming Games */}
      <GamePreviewModal
        game={previewGame}
        isOpen={Boolean(previewGame)}
        onClose={() => setPreviewGame(null)}
      />
    </section>
  );
}
