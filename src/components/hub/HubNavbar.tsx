import { useState } from 'react';
import {
  Menu,
  X,
  Gamepad2,
  Sparkles,
  User,
  Flame,
  HelpCircle,
  Settings,
  PlayingCards,
  Eye,
  PartyPopper,
} from 'lucide-react';
import type { UserProfile, PlayerStats } from '../../types/sso';
import { sounds } from '../../games/undercover-game/utils/sound';
import GameSettingsModal from '../common/GameSettingsModal';

export interface HubNavbarProps {
  ssoUser?: UserProfile | null;
  ssoStats?: PlayerStats | null;
  onOpenSSOProfile: () => void;
  onNavigateHome?: () => void;
  onSelectCategory?: (category: string) => void;
}

export default function HubNavbar({
  ssoUser,
  onOpenSSOProfile,
  onNavigateHome,
  onSelectCategory,
}: HubNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleProfileClick = () => {
    sounds.playTap();
    onOpenSSOProfile();
  };

  const navItems = [
    { label: 'All Games', category: 'all', icon: Gamepad2, color: '#10b981' },
    { label: 'Card Games', category: 'cards', icon: PlayingCards, color: '#f59e0b' },
    { label: 'Social Bluff', category: 'deduction', icon: Eye, color: '#06b6d4' },
    { label: 'Party Rooms', category: 'party', icon: PartyPopper, color: '#ec4899' },
  ];

  const handleNavClick = (category: string) => {
    sounds.playTap();
    setMobileMenuOpen(false);
    if (onSelectCategory) {
      onSelectCategory(category);
    }
    const section = document.getElementById('game-catalog-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        padding: '0 16px',
        marginBottom: '20px',
      }}
    >
      {/* Subtle backdrop strip blur */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '84px',
          background: 'rgba(7, 9, 14, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          maskImage: 'linear-gradient(to bottom, black 50%, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent)',
          zIndex: -1,
        }}
        aria-hidden="true"
      />

      {/* Floating Modern Header Pill */}
      <div
        style={{
          maxWidth: '1240px',
          margin: '12px auto 0',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: '16px',
          padding: '0 clamp(12px, 2.5vw, 20px)',
          background: '#0d131f',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Brand Logo & Title */}
        <a
          href="/"
          onClick={(e) => {
            if (onNavigateHome) {
              e.preventDefault();
              sounds.playTap();
              onNavigateHome();
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
              flexShrink: 0,
            }}
          >
            <Gamepad2 size={22} color="#ffffff" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                fontSize: 'clamp(1.05rem, 3.5vw, 1.25rem)',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
              }}
            >
              Fun With Dost Yaar
            </span>

            <span
              style={{
                background: '#10b981',
                color: '#ffffff',
                fontSize: '0.64rem',
                fontWeight: 900,
                padding: '2px 7px',
                borderRadius: '6px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
              className="hide-mobile"
            >
              PARTY HUB
            </span>
          </div>
        </a>

        {/* Desktop Category Navigation */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '8px',
          }}
          className="desktop-nav"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() => handleNavClick(item.category)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '7px 13px',
                  borderRadius: '10px',
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Icon size={16} color={item.color} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: User Avatar Button & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleProfileClick}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              padding: '6px 12px',
              borderRadius: '12px',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem',
              transition: 'all 0.2s ease',
            }}
            title="Profile & Accounts (Coming Soon)"
          >
            <img
              src={ssoUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=dostyaar'}
              alt="Avatar"
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#07090e',
                border: '1.5px solid #10b981',
              }}
            />
            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {ssoUser?.displayName || 'Dost Yaar'}
            </span>
            <span
              style={{
                fontSize: '0.64rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.18)',
                padding: '2px 6px',
                borderRadius: '4px',
                fontWeight: 800,
              }}
            >
              SOON
            </span>
          </button>

          {/* Settings Menu Gear Button */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setIsSettingsOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Audio & Game Settings"
          >
            <Settings size={18} />
          </button>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => {
              sounds.playTap();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="mobile-menu-trigger"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          className="animate-enter"
          style={{
            maxWidth: '1240px',
            margin: '8px auto 0',
            borderRadius: '16px',
            padding: '16px',
            background: '#0d131f',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
          }}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.category}
                type="button"
                onClick={() => handleNavClick(item.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#f8fafc',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${item.color}22`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={17} color={item.color} />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Modern 'Coming Soon' Toast when Avatar is clicked */}
      {showToast && (
        <div className="coming-soon-toast">
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: '#10b981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff' }}>
              Account System Coming Soon! 🚀
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Custom profiles, friend invites, and stats sync will launch in an upcoming update.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowToast(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              marginLeft: '8px',
              padding: '4px',
            }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 820px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-trigger {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>

      {/* Dedicated Audio & Voice Settings Modal */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        accentColor="#10b981"
      />
    </header>
  );
}
