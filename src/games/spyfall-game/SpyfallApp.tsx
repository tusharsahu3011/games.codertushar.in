import { useState, useEffect } from 'react';
import Header from './components/Header';
import RulesModal from './components/RulesModal';
import ModeSelectScreen from './components/ModeSelectScreen';
import SetupScreen, { type SetupPlayer } from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import InterrogationScreen from './components/InterrogationScreen';
import AccusationModal from './components/AccusationModal';
import SpyGuessModal from './components/SpyGuessModal';
import GameOverScreen from './components/GameOverScreen';
import OnlineRoomScreen from './components/OnlineRoomScreen';
import ComingSoonToast from '../../components/common/ComingSoonToast';
import UserProfileModal from '../../components/profile/UserProfileModal';
import AuthModal from '../../components/auth/AuthModal';

import type {
  SpyfallPlayer,
  SpyfallLocation,
  SpyfallSettings,
  SpyfallOutcome,
  SpyfallGameStage,
} from './types';
import {
  initializeSpyfallGame,
  evaluateAccusation,
  evaluateSpyGuess,
} from './utils/gameEngine';
import { spySounds } from './utils/sound';
import { ssoAuth } from '../../services/ssoAuth';
import type { UserProfile, PlayerStats } from '../../types/sso';

export interface SpyfallAppProps {
  initialMode?: 'pass_and_play' | 'online' | 'mode_select';
  onBackToHub?: () => void;
  onSwitchMode?: () => void;
}

export default function SpyfallApp({
  initialMode = 'pass_and_play',
  onBackToHub,
  onSwitchMode,
}: SpyfallAppProps) {
  const [gameMode, setGameMode] = useState<'pass_and_play' | 'online' | 'mode_select'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('spyroom') || p.get('room')) return 'online';
    }
    return initialMode;
  });

  useEffect(() => {
    setGameMode(initialMode);
  }, [initialMode]);

  // Stage in Pass & Play
  const [stage, setStage] = useState<SpyfallGameStage>('setup');

  // Game data
  const [players, setPlayers] = useState<SpyfallPlayer[]>([]);
  const [secretLocation, setSecretLocation] = useState<SpyfallLocation | null>(null);
  const [settings, setSettings] = useState<SpyfallSettings>({
    spyCount: 1,
    roundDurationSeconds: 420,
    category: 'all',
    rolesEnabled: true,
  });

  // Accusation & Guess Modals
  const [accusedPlayer, setAccusedPlayer] = useState<SpyfallPlayer | null>(null);
  const [isAccusationOpen, setIsAccusationOpen] = useState(false);
  const [isSpyGuessOpen, setIsSpyGuessOpen] = useState(false);
  const [outcome, setOutcome] = useState<SpyfallOutcome | null>(null);

  // Modals & UI state
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSSOProfileOpen, setIsSSOProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [ssoUser, setSsoUser] = useState<UserProfile>(ssoAuth.user);
  const [ssoStats, setSsoStats] = useState<PlayerStats>(ssoAuth.stats);
  const [soundMuted, setSoundMuted] = useState(() => {
    try {
      return localStorage.getItem('spyfall_sound_muted') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Sound mute sync
  useEffect(() => {
    spySounds.setMuted(soundMuted);
    try {
      localStorage.setItem('spyfall_sound_muted', soundMuted.toString());
    } catch (e) {}
  }, [soundMuted]);

  // SSO Auth updates
  useEffect(() => {
    const unsub = ssoAuth.subscribe((u, s) => {
      setSsoUser(u);
      setSsoStats(s);
    });
    return () => unsub();
  }, []);

  // START PASS & PLAY GAME
  const handleStartGame = (playerInputs: SetupPlayer[], newSettings: SpyfallSettings) => {
    setSettings(newSettings);
    const { players: initializedPlayers, secretLocation: selectedLoc } = initializeSpyfallGame(
      playerInputs,
      newSettings
    );
    setPlayers(initializedPlayers);
    setSecretLocation(selectedLoc);
    setStage('reveal');
  };

  // ALL OPERATIVES BRIEFED
  const handleAllBriefed = () => {
    setStage('interrogation');
  };

  // ACCUSE PLAYER
  const handleCallAccusation = (suspect: SpyfallPlayer) => {
    setAccusedPlayer(suspect);
    setIsAccusationOpen(true);
  };

  // CONFIRM CONVICTION
  const handleConfirmConviction = () => {
    if (!accusedPlayer || !secretLocation) return;
    const result = evaluateAccusation(accusedPlayer, secretLocation, players);
    setOutcome(result);
    setIsAccusationOpen(false);
    setStage('gameover');
  };

  // SPY GUESS LOCATION
  const handleConfirmSpyGuess = (guessedLoc: SpyfallLocation) => {
    if (!secretLocation) return;
    const spy = players.find((p) => p.isSpy) || players[0];
    const result = evaluateSpyGuess(spy, guessedLoc, secretLocation, players);
    setOutcome(result);
    setIsSpyGuessOpen(false);
    setStage('gameover');
  };

  // TIME EXPIRED
  const handleTimeExpired = () => {
    if (!secretLocation) return;
    // Default: Pick the first suspect or launch accusation
    const firstNonSpy = players[0];
    setAccusedPlayer(firstNonSpy);
    setIsAccusationOpen(true);
  };

  // REPLAY SAME PLAYERS
  const handlePlayAgain = () => {
    if (!settings || players.length < 3) {
      setStage('setup');
      return;
    }
    const { players: reinitialized, secretLocation: newLoc } = initializeSpyfallGame(
      players.map((p) => ({ id: p.id, name: p.name, color: p.color })),
      settings
    );
    setPlayers(reinitialized);
    setSecretLocation(newLoc);
    setStage('reveal');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--background, #030712)',
      color: 'var(--foreground, #f8fafc)',
    }}>
      {/* Top Header */}
      <Header
        gameMode={gameMode}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        onOpenRules={() => setIsRulesOpen(true)}
        onBackToHub={onBackToHub}
        onSwitchMode={onSwitchMode}
        ssoUser={ssoUser}
        onOpenSSOProfile={() => setIsSSOProfileOpen(true)}
      />

      {/* Main Game Screen */}
      <main style={{ flex: 1 }}>
        {gameMode === 'mode_select' && (
          <ModeSelectScreen
            onSelectPassAndPlay={() => setGameMode('pass_and_play')}
            onSelectOnlineMultiplayer={() => setGameMode('online')}
            ssoUser={ssoUser}
            onBackToHub={onBackToHub}
          />
        )}

        {gameMode === 'online' && (
          <OnlineRoomScreen
            ssoUser={ssoUser}
            onBackToHub={onBackToHub}
            onSwitchMode={onSwitchMode}
          />
        )}

        {gameMode === 'pass_and_play' && (
          <>
            {stage === 'setup' && (
              <SetupScreen
                onStartGame={handleStartGame}
                onBackToModeSelect={() => {
                  if (onSwitchMode) onSwitchMode();
                  else setGameMode('mode_select');
                }}
              />
            )}

            {stage === 'reveal' && secretLocation && (
              <RevealScreen
                players={players}
                secretLocation={secretLocation}
                onAllBriefed={handleAllBriefed}
                onAbortGame={() => setStage('setup')}
              />
            )}

            {stage === 'interrogation' && secretLocation && (
              <InterrogationScreen
                players={players}
                secretLocation={secretLocation}
                settings={settings}
                onAccusePlayer={handleCallAccusation}
                onSpyGuessLocation={() => setIsSpyGuessOpen(true)}
                onTimeExpired={handleTimeExpired}
                onAbortGame={() => setStage('setup')}
              />
            )}

            {stage === 'gameover' && outcome && (
              <GameOverScreen
                outcome={outcome}
                players={players}
                settings={settings}
                onPlayAgain={handlePlayAgain}
                onReconfigure={() => setStage('setup')}
                onBackToHub={onBackToHub || (() => {})}
              />
            )}
          </>
        )}
      </main>

      {/* Accusation Modal */}
      <AccusationModal
        isOpen={isAccusationOpen}
        accusedPlayer={accusedPlayer}
        allPlayers={players}
        onConfirmConviction={handleConfirmConviction}
        onCancelAccusation={() => setIsAccusationOpen(false)}
      />

      {/* Spy Guess Modal */}
      <SpyGuessModal
        isOpen={isSpyGuessOpen}
        onConfirmGuess={handleConfirmSpyGuess}
        onCancel={() => setIsSpyGuessOpen(false)}
      />

      {/* Rules & Manual Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* User Profile & Achievements Modal */}
      <UserProfileModal
        isOpen={isSSOProfileOpen}
        onClose={() => setIsSSOProfileOpen(false)}
        onOpenAuthModal={() => {
          setIsSSOProfileOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setIsAuthOpen(false);
          setIsSSOProfileOpen(true);
        }}
      />
    </div>
  );
}
