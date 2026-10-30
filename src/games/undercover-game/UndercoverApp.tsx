import { useState, useEffect } from 'react';
import Header from './components/Header';
import RulesModal from './components/RulesModal';
import ModeSelectScreen from './components/ModeSelectScreen';
import OnlineRoomScreen from './components/OnlineRoomScreen';
import SetupScreen, { type SetupMissionConfig } from './components/SetupScreen';
import RevealScreen from './components/RevealScreen';
import TurnPhaseScreen from './components/TurnPhaseScreen';
import VoteScreen from './components/VoteScreen';
import MrWhiteGuessModal from './components/MrWhiteGuessModal';
import GameOverScreen from './components/GameOverScreen';
import ComingSoonToast from '../../components/common/ComingSoonToast';
import UserProfileModal from '../../components/profile/UserProfileModal';
import AuthModal from '../../components/auth/AuthModal';

import { getRandomWordPair } from './data/wordPairs';
import {
  ROLES,
  initializePlayers,
  evaluateGameStatus,
  type EnginePlayer,
} from './utils/gameEngine';
import { sounds } from './utils/sound';
import { ssoAuth } from '../../services/ssoAuth';
import type { UserProfile, PlayerStats } from '../../types/sso';

export interface UndercoverAppProps {
  initialMode?: 'pass_and_play' | 'online' | 'mode_select';
  onBackToHub?: () => void;
  onSwitchMode?: () => void;
}

export default function UndercoverApp({
  initialMode = 'pass_and_play',
  onBackToHub,
  onSwitchMode,
}: UndercoverAppProps) {
  const [gameMode, setGameMode] = useState<'pass_and_play' | 'online' | 'mode_select'>(() => {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search);
      if (p.get('room')) return 'online';
    }
    return initialMode;
  });

  useEffect(() => {
    setGameMode(initialMode);
  }, [initialMode]);

  const [phase, setPhase] = useState<'setup' | 'reveal' | 'turn' | 'vote' | 'gameover'>('setup');
  const [round, setRound] = useState(1);
  const [players, setPlayers] = useState<EnginePlayer[]>([]);
  const [wordPair, setWordPair] = useState<{ civilianWord: string; undercoverWord: string; category?: string; pair?: string } | null>(null);
  const [lastConfig, setLastConfig] = useState<SetupMissionConfig | null>(null);

  // SSO user & statistics
  const [ssoUser, setSsoUser] = useState<UserProfile>(ssoAuth.user);
  const [ssoStats, setSsoStats] = useState<PlayerStats>(ssoAuth.stats);

  // Modals state
  const [isSSOProfileOpen, setIsSSOProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sound state
  const [soundMuted, setSoundMuted] = useState(() => {
    try {
      return localStorage.getItem('undercover_sound_muted') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Mr White guess modal state
  const [mrWhiteCandidate, setMrWhiteCandidate] = useState<EnginePlayer | null>(null);

  // Final game outcome
  const [gameOutcome, setGameOutcome] = useState<{ winner: 'civilians' | 'undercover' | 'mrwhite' | string | null; reason: string }>({ winner: null, reason: '' });

  // Sync sound muted state
  useEffect(() => {
    sounds.setMuted(soundMuted);
    try {
      localStorage.setItem('undercover_sound_muted', soundMuted.toString());
    } catch (e) {}
  }, [soundMuted]);

  // Subscribe to SSO auth updates
  useEffect(() => {
    const unsubscribe = ssoAuth.subscribe((user, stats) => {
      setSsoUser(user);
      setSsoStats(stats);
    });
    return () => unsubscribe();
  }, []);

  const handleStartGame = (config: SetupMissionConfig) => {
    setLastConfig(config);

    let pair: { civilianWord: string; undercoverWord: string; category?: string; pair?: string };
    if (config.customWords) {
      pair = {
        civilianWord: config.customWords.civilianWord,
        undercoverWord: config.customWords.undercoverWord,
        category: 'custom',
        pair: `${config.customWords.civilianWord} & ${config.customWords.undercoverWord}`,
      };
    } else {
      pair = getRandomWordPair(config.category);
    }
    setWordPair(pair);

    const initialRoster = initializePlayers(config.playerNames, pair, {
      undercovers: config.undercovers,
      mrWhites: config.hasMrWhite ? 1 : 0,
    });

    setPlayers(initialRoster);
    setRound(1);
    setPhase('reveal');
  };

  const handleCompleteReveals = () => {
    setPhase('turn');
  };

  const handleProceedToVoting = () => {
    setPhase('vote');
  };

  const handleEliminatePlayer = (eliminatedPlayer: EnginePlayer) => {
    const updatedPlayers = players.map((p) =>
      p.id === eliminatedPlayer.id
        ? { ...p, isAlive: false, eliminatedRound: round }
        : p
    );
    setPlayers(updatedPlayers);

    if (eliminatedPlayer.role === ROLES.MR_WHITE) {
      setMrWhiteCandidate(eliminatedPlayer);
      return;
    }

    processGameStatus(updatedPlayers);
  };

  const handleMrWhiteGuessResult = (isCorrect: boolean) => {
    const candidate = mrWhiteCandidate;
    setMrWhiteCandidate(null);

    if (isCorrect && candidate && wordPair) {
      setGameOutcome({
        winner: 'mrwhite',
        reason: `${candidate.name} deduced the civilian word "${wordPair.civilianWord}" and pulled off the ultimate heist!`,
      });
      setPhase('gameover');
      ssoAuth.recordGameResult('mrwhite', true);
    } else {
      processGameStatus(players);
    }
  };

  const processGameStatus = (currentPlayers: EnginePlayer[]) => {
    const status = evaluateGameStatus(currentPlayers);
    if (status.isOver) {
      setGameOutcome({
        winner: status.winner,
        reason: status.reason,
      });
      setPhase('gameover');

      const myPlayer = currentPlayers.find((p) => p.name.toLowerCase() === ssoUser.displayName.toLowerCase());
      const myRole = (myPlayer ? myPlayer.role : 'civilian') as 'civilian' | 'undercover' | 'mrwhite';
      const myTeamWon =
        (status.winner === 'civilians' && myRole === 'civilian') ||
        (status.winner === 'undercover' && myRole === 'undercover') ||
        (status.winner === 'mrwhite' && myRole === 'mrwhite');

      ssoAuth.recordGameResult(myRole, myTeamWon);
    } else {
      setRound((prev) => prev + 1);
      setPhase('turn');
    }
  };

  const handlePlayAgain = () => {
    if (!lastConfig) {
      setPhase('setup');
      return;
    }
    handleStartGame(lastConfig);
  };

  const handleNewGame = () => {
    setPhase('setup');
  };

  return (
    <div className="app-container">
      <Header
        phase={phase}
        round={round}
        soundMuted={soundMuted}
        onToggleSound={() => setSoundMuted(!soundMuted)}
        onOpenRules={() => setIsRulesOpen(true)}
        onResetGame={handleNewGame}
        gameMode={gameMode === 'mode_select' ? 'pass_and_play' : gameMode}
        ssoUser={ssoUser}
        onOpenSSOProfile={() => setIsSSOProfileOpen(true)}
        onSwitchGameMode={() => { if (onSwitchMode) onSwitchMode(); else setGameMode('mode_select'); }}
        onBackToHub={onBackToHub}
      />

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
            onBackToModeSelect={() => { if (onSwitchMode) onSwitchMode(); else setGameMode('mode_select'); }}
          />
        )}

        {gameMode === 'pass_and_play' && (
          <>
            {phase === 'setup' && (
              <SetupScreen onStartGame={handleStartGame} />
            )}

            {phase === 'reveal' && (
              <RevealScreen
                players={players}
                onCompleteAllReveals={handleCompleteReveals}
              />
            )}

            {phase === 'turn' && (
              <TurnPhaseScreen
                round={round}
                players={players}
                onProceedToVoting={handleProceedToVoting}
              />
            )}

            {phase === 'vote' && (
              <VoteScreen
                round={round}
                players={players}
                onEliminatePlayer={handleEliminatePlayer}
              />
            )}

            {phase === 'gameover' && (
              <GameOverScreen
                winner={gameOutcome.winner}
                reason={gameOutcome.reason}
                players={players}
                wordPair={wordPair}
                onPlayAgain={handlePlayAgain}
                onNewGame={handleNewGame}
              />
            )}
          </>
        )}
      </main>

      {/* Rules Modal */}
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Mr. White Secret Word Deduction Guess Modal */}
      {mrWhiteCandidate && wordPair && (
        <MrWhiteGuessModal
          player={mrWhiteCandidate}
          civilianWord={wordPair.civilianWord}
          onSubmitResult={handleMrWhiteGuessResult}
        />
      )}

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
