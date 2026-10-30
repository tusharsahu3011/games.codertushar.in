import { useState, useEffect } from 'react';
import type { UserProfile, PlayerStats } from './types/sso';
import type { HubCategory } from './types/hub';
import { ssoAuth } from './services/ssoAuth';
import HubNavbar from './components/hub/HubNavbar';
import HubHero from './components/hub/HubHero';
import GameGrid from './components/hub/GameGrid';
import HubFooter from './components/hub/HubFooter';
import ModeSelectScreen from './games/undercover-game/components/ModeSelectScreen';
import UndercoverApp from './games/undercover-game/UndercoverApp';
import { sounds } from './games/undercover-game/utils/sound';

import SpyfallModeSelectScreen from './games/spyfall-game/components/ModeSelectScreen';
import SpyfallApp from './games/spyfall-game/SpyfallApp';
import { spySounds } from './games/spyfall-game/utils/sound';

import BhabhiApp from './games/bhabhi-game/BhabhiApp';
import { bhabhiSounds } from './games/bhabhi-game/utils/sound';
import ComingSoonToast from './components/common/ComingSoonToast';
import FaintGameBackground from './components/hub/FaintGameBackground';
import LandscapeOrientationLock from './components/common/LandscapeOrientationLock';
import UserProfileModal from './components/profile/UserProfileModal';
import AuthModal from './components/auth/AuthModal';

export type AppRoute =
  | 'hub'                    // /
  | 'undercover_mode_select' // /game/undercover
  | 'undercover_offline'     // /game/undercover/offline
  | 'undercover_online'      // /game/undercover/online
  | 'spyfall_mode_select'    // /game/spyfall
  | 'spyfall_offline'        // /game/spyfall/offline
  | 'spyfall_online'         // /game/spyfall/online
  | 'bhabhi_mode_select'     // /game/bhabhi
  | 'bhabhi_game';           // /game/bhabhi/play or /game/bhabhi/online

function getRouteFromLocation(): AppRoute {
  if (typeof window === 'undefined') return 'hub';
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(window.location.search);

  // If ?bhabhiroom=CODE or ?room=BHABHI-... or /game/bhabhi with ?room= exists
  if (params.get('bhabhiroom') || (params.get('room') && params.get('room')?.toUpperCase().startsWith('BHABHI-')) || (pathname.includes('/game/bhabhi') && params.get('room'))) {
    const room = params.get('bhabhiroom') || params.get('room') || '';
    if (pathname !== '/game/bhabhi/play') {
      window.history.replaceState({}, '', `/game/bhabhi/play?bhabhiroom=${encodeURIComponent(room)}`);
    }
    return 'bhabhi_game';
  }

  // If ?spyroom=CODE or ?room=SPY-... exists
  if (params.get('spyroom') || (params.get('room') && params.get('room')?.toUpperCase().startsWith('SPY-'))) {
    const room = params.get('spyroom') || params.get('room') || '';
    if (pathname !== '/game/spyfall/online') {
      window.history.replaceState({}, '', `/game/spyfall/online?spyroom=${encodeURIComponent(room)}`);
    }
    return 'spyfall_online';
  }

  // If ?room=CODE exists on any route or root, route directly to undercover online room
  if (params.get('room')) {
    if (pathname !== '/game/undercover/online') {
      const room = params.get('room') || '';
      window.history.replaceState({}, '', `/game/undercover/online?room=${encodeURIComponent(room)}`);
    }
    return 'undercover_online';
  }

  // Query parameter redirects
  if (params.get('game') === 'undercover') {
    window.history.replaceState({}, '', '/game/undercover');
    return 'undercover_mode_select';
  }
  if (params.get('game') === 'spyfall') {
    window.history.replaceState({}, '', '/game/spyfall');
    return 'spyfall_mode_select';
  }
  if (params.get('game') === 'bhabhi') {
    window.history.replaceState({}, '', '/game/bhabhi');
    return 'bhabhi_mode_select';
  }

  if (pathname === '/game/undercover/offline') return 'undercover_offline';
  if (pathname === '/game/undercover/online') return 'undercover_online';
  if (pathname === '/game/undercover') return 'undercover_mode_select';

  if (pathname === '/game/spyfall/offline') return 'spyfall_offline';
  if (pathname === '/game/spyfall/online') return 'spyfall_online';
  if (pathname === '/game/spyfall') return 'spyfall_mode_select';

  if (pathname === '/game/bhabhi/play') return 'bhabhi_game';
  if (pathname === '/game/bhabhi') return 'bhabhi_mode_select';

  return 'hub';
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => getRouteFromLocation());
  const [ssoUser, setSsoUser] = useState<UserProfile>(ssoAuth.user);
  const [ssoStats, setSsoStats] = useState<PlayerStats>(ssoAuth.stats);
  const [selectedCategory, setSelectedCategory] = useState<HubCategory>('all');
  const [showComingSoonToast, setShowComingSoonToast] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Synchronize route with browser Back/Forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setRoute(getRouteFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Subscribe to Player Profile updates
  useEffect(() => {
    const unsubscribe = ssoAuth.subscribe((user, stats) => {
      setSsoUser(user);
      setSsoStats(stats);
    });
    return () => unsubscribe();
  }, []);

  // Update dynamic page title according to active route
  useEffect(() => {
    if (typeof document === 'undefined') return;
    switch (route) {
      case 'undercover_mode_select':
        document.title = 'Undercover: Select Mode | Fun With Dost Yaar';
        break;
      case 'undercover_offline':
        document.title = 'Undercover: Pass & Play | Fun With Dost Yaar';
        break;
      case 'undercover_online':
        document.title = 'Undercover: Online Multiplayer | Fun With Dost Yaar';
        break;
      case 'spyfall_mode_select':
        document.title = 'Spyfall: Select Mode | Fun With Dost Yaar';
        break;
      case 'spyfall_offline':
        document.title = 'Spyfall: Pass & Play | Fun With Dost Yaar';
        break;
      case 'spyfall_online':
        document.title = 'Spyfall: Online Multiplayer | Fun With Dost Yaar';
        break;
      case 'bhabhi_mode_select':
        document.title = 'Bhabhi: Select Mode | Fun With Dost Yaar';
        break;
      case 'bhabhi_game':
        document.title = 'Bhabhi (Get Away) | Fun With Dost Yaar';
        break;
      case 'hub':
      default:
        document.title = 'Fun With Dost Yaar | Social & Party Game Hub';
        break;
    }
  }, [route]);

  const navigate = (toPath: string, options?: { replace?: boolean }) => {
    if (typeof window !== 'undefined') {
      if (options?.replace) {
        window.history.replaceState({}, '', toPath);
      } else {
        window.history.pushState({}, '', toPath);
      }
      setRoute(getRouteFromLocation());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProfileNotice = () => {
    sounds.playTap();
    setIsProfileModalOpen(true);
  };

  const handlePlayGame = (gameId: string) => {
    if (gameId === 'undercover') {
      sounds.playTap();
      navigate('/game/undercover');
    } else if (gameId === 'spyfall') {
      spySounds.playSelect();
      navigate('/game/spyfall');
    } else if (gameId === 'bhabhi') {
      bhabhiSounds.playTap();
      navigate('/game/bhabhi');
    }
  };

  const handleLaunchPassAndPlay = () => {
    sounds.playDramaticBoom();
    navigate('/game/undercover/offline');
  };

  const handleLaunchOnlineMultiplayer = () => {
    sounds.playDramaticBoom();
    navigate('/game/undercover/online');
  };

  const handleLaunchSpyfallPassAndPlay = () => {
    spySounds.playDramaticSting();
    navigate('/game/spyfall/offline');
  };

  const handleLaunchSpyfallOnlineMultiplayer = () => {
    spySounds.playDramaticSting();
    navigate('/game/spyfall/online');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--background, #07090e)',
        color: 'var(--foreground, #f8fafc)',
      }}
    >
      {/* ROUTE 1: / (Central Games Hub Landing Page) */}
      {route === 'hub' && (
        <>
          <FaintGameBackground />
          <HubNavbar
            ssoUser={ssoUser}
            ssoStats={ssoStats}
            onOpenSSOProfile={handleOpenProfileNotice}
            onNavigateHome={() => navigate('/')}
            onSelectCategory={(cat) => setSelectedCategory(cat as HubCategory)}
          />
          <main style={{ flex: 1 }}>
            <HubHero
              ssoStats={ssoStats}
              onExploreGames={() => {
                const section = document.getElementById('game-catalog-section');
                if (section) section.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <GameGrid
              onPlayGame={handlePlayGame}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
            />
          </main>
          <HubFooter />
        </>
      )}

      {/* ROUTE 2: /game/undercover (Mode Select: Offline vs Online) */}
      {route === 'undercover_mode_select' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <HubNavbar
            ssoUser={ssoUser}
            ssoStats={ssoStats}
            onOpenSSOProfile={handleOpenProfileNotice}
            onNavigateHome={() => navigate('/')}
          />
          <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>
            <ModeSelectScreen
              onSelectPassAndPlay={handleLaunchPassAndPlay}
              onSelectOnlineMultiplayer={handleLaunchOnlineMultiplayer}
              ssoUser={ssoUser}
              onBackToHub={() => navigate('/')}
            />
          </main>
          <HubFooter />
        </div>
      )}

      {/* ROUTE 3: /game/undercover/offline (Pass & Play on Single Device) */}
      {route === 'undercover_offline' && (
        <LandscapeOrientationLock gameTitle="Undercover: Pass & Play">
          <UndercoverApp
            initialMode="pass_and_play"
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/undercover')}
          />
        </LandscapeOrientationLock>
      )}

      {/* ROUTE 4: /game/undercover/online (Create / Join Custom Online Rooms) */}
      {route === 'undercover_online' && (
        <LandscapeOrientationLock gameTitle="Undercover: Online Multiplayer">
          <UndercoverApp
            initialMode="online"
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/undercover')}
          />
        </LandscapeOrientationLock>
      )}

      {/* ROUTE 5: /game/spyfall (Mode Select: Offline vs Online) */}
      {route === 'spyfall_mode_select' && (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <HubNavbar
            ssoUser={ssoUser}
            ssoStats={ssoStats}
            onOpenSSOProfile={handleOpenProfileNotice}
            onNavigateHome={() => navigate('/')}
          />
          <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 20px 48px' }}>
            <SpyfallModeSelectScreen
              onSelectPassAndPlay={handleLaunchSpyfallPassAndPlay}
              onSelectOnlineMultiplayer={handleLaunchSpyfallOnlineMultiplayer}
              ssoUser={ssoUser}
              onBackToHub={() => navigate('/')}
            />
          </main>
          <HubFooter />
        </div>
      )}

      {/* ROUTE 6: /game/spyfall/offline (Pass & Play on Single Device) */}
      {route === 'spyfall_offline' && (
        <LandscapeOrientationLock gameTitle="Spyfall: Pass & Play">
          <SpyfallApp
            initialMode="pass_and_play"
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/spyfall')}
          />
        </LandscapeOrientationLock>
      )}

      {/* ROUTE 7: /game/spyfall/online (Create / Join Custom Online Rooms) */}
      {route === 'spyfall_online' && (
        <LandscapeOrientationLock gameTitle="Spyfall: Online Multiplayer">
          <SpyfallApp
            initialMode="online"
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/spyfall')}
          />
        </LandscapeOrientationLock>
      )}

      {/* ROUTE 8: /game/bhabhi (Bhabhi Mode Selection) */}
      {route === 'bhabhi_mode_select' && (
        <LandscapeOrientationLock gameTitle="Bhabhi (Get Away)">
          <BhabhiApp
            initialMode="mode_select"
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/bhabhi')}
          />
        </LandscapeOrientationLock>
      )}

      {/* ROUTE 9: /game/bhabhi/play (Bhabhi Match / Custom Room) */}
      {route === 'bhabhi_game' && (
        <LandscapeOrientationLock gameTitle="Bhabhi (Get Away)">
          <BhabhiApp
            initialMode="solo"
            initialRoomCode={
              typeof window !== 'undefined'
                ? new URLSearchParams(window.location.search).get('bhabhiroom') ||
                  new URLSearchParams(window.location.search).get('room') ||
                  undefined
                : undefined
            }
            onBackToHub={() => navigate('/')}
            onSwitchMode={() => navigate('/game/bhabhi')}
          />
        </LandscapeOrientationLock>
      )}

      {/* Persistent User Profile & Achievements Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenAuthModal={() => {
          setIsProfileModalOpen(false);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Authentication Modal (Register with 6-digit Email Verification, Sign In, Guest Mode) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsProfileModalOpen(true);
        }}
      />

      {/* In-App Account 'Coming Soon' Toast */}
      <ComingSoonToast
        isOpen={showComingSoonToast}
        onClose={() => setShowComingSoonToast(false)}
      />
    </div>
  );
}
