// Game engine logic and role management in TypeScript

export const ROLES = {
  CIVILIAN: 'civilian' as const,
  UNDERCOVER: 'undercover' as const,
  MR_WHITE: 'mrwhite' as const,
};

export type RoleValue = typeof ROLES[keyof typeof ROLES];

export interface RoleMeta {
  name: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
  description: string;
}

export const ROLE_INFO: Record<RoleValue, RoleMeta> = {
  [ROLES.CIVILIAN]: {
    name: 'Civilian',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.15)',
    border: 'rgba(6, 182, 212, 0.4)',
    icon: 'Shield',
    description: 'You share the secret word with other civilians. Find the infiltrators!',
  },
  [ROLES.UNDERCOVER]: {
    name: 'Undercover',
    color: '#f43f5e',
    bg: 'rgba(244, 63, 94, 0.15)',
    border: 'rgba(244, 63, 94, 0.4)',
    icon: 'EyeOff',
    description: 'You have a slightly different word. Blend in and mislead the civilians!',
  },
  [ROLES.MR_WHITE]: {
    name: 'Mr. White',
    color: '#e2e8f0',
    bg: 'rgba(226, 232, 240, 0.15)',
    border: 'rgba(226, 232, 240, 0.4)',
    icon: 'HelpCircle',
    description: 'You have NO word at all! Bluff your way through and deduce the civilian word.',
  },
};

export interface RoleConfig {
  undercovers?: number;
  mrWhites?: number;
}

export interface RecommendedRoles {
  undercovers: number;
  mrWhites: number;
}

export function getRecommendedRoles(playerCount: number): RecommendedRoles {
  if (playerCount < 3) return { undercovers: 1, mrWhites: 0 };
  if (playerCount === 3) return { undercovers: 1, mrWhites: 0 };
  if (playerCount === 4) return { undercovers: 1, mrWhites: 0 };
  if (playerCount === 5) return { undercovers: 1, mrWhites: 1 };
  if (playerCount === 6) return { undercovers: 1, mrWhites: 1 };
  if (playerCount === 7) return { undercovers: 2, mrWhites: 1 };
  if (playerCount >= 8 && playerCount <= 10) return { undercovers: 2, mrWhites: 1 };
  return { undercovers: Math.max(2, Math.floor(playerCount / 4)), mrWhites: 1 };
}

export interface EnginePlayer {
  id: string;
  name: string;
  role: RoleValue;
  word: string | null;
  isAlive: boolean;
  eliminatedRound: number | null;
  votesReceived: number;
  hasSeenWord: boolean;
}

export function initializePlayers(
  playerNames: string[],
  wordPair: { civilianWord: string; undercoverWord: string },
  config: RoleConfig = {}
): EnginePlayer[] {
  const { undercovers = 1, mrWhites = 0 } = config;
  const count = playerNames.length;
  const civilians = count - undercovers - mrWhites;

  if (civilians < 1) {
    throw new Error('Not enough players for civilians');
  }

  const roles: RoleValue[] = [
    ...Array(civilians).fill(ROLES.CIVILIAN),
    ...Array(undercovers).fill(ROLES.UNDERCOVER),
    ...Array(mrWhites).fill(ROLES.MR_WHITE),
  ];

  // Fisher-Yates shuffle
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = roles[i];
    roles[i] = roles[j];
    roles[j] = temp;
  }

  return playerNames.map((name, idx) => {
    const role = roles[idx];
    let word: string | null = '';
    if (role === ROLES.CIVILIAN) {
      word = wordPair.civilianWord;
    } else if (role === ROLES.UNDERCOVER) {
      word = wordPair.undercoverWord;
    } else {
      word = null;
    }

    return {
      id: `p-${idx + 1}-${Date.now().toString(36)}`,
      name: name.trim(),
      role,
      word,
      isAlive: true,
      eliminatedRound: null,
      votesReceived: 0,
      hasSeenWord: false,
    };
  });
}

export interface GameStatusEvaluation {
  isOver: boolean;
  winner: 'civilians' | 'undercover' | 'mrwhite' | null;
  reason: string;
}

export function evaluateGameStatus(players: EnginePlayer[]): GameStatusEvaluation {
  const alivePlayers = players.filter((p) => p.isAlive);
  const aliveCivilians = alivePlayers.filter((p) => p.role === ROLES.CIVILIAN);
  const aliveUndercovers = alivePlayers.filter((p) => p.role === ROLES.UNDERCOVER);
  const aliveMrWhites = alivePlayers.filter((p) => p.role === ROLES.MR_WHITE);

  const totalThreats = aliveUndercovers.length + aliveMrWhites.length;

  if (totalThreats === 0) {
    return {
      isOver: true,
      winner: 'civilians',
      reason: 'All Undercover agents and impostors have been eliminated!',
    };
  }

  if (aliveUndercovers.length >= aliveCivilians.length) {
    return {
      isOver: true,
      winner: 'undercover',
      reason: 'The Undercover agents have overrun the civilians!',
    };
  }

  if (aliveCivilians.length <= 1 && totalThreats >= 1 && aliveUndercovers.length === 0) {
    return {
      isOver: true,
      winner: 'mrwhite',
      reason: 'Mr. White successfully confused the remaining players and survived to the end!',
    };
  }

  return { isOver: false, winner: null, reason: '' };
}

export function checkMrWhiteGuess(guess: string, secretWord: string): boolean {
  if (!guess || !secretWord) return false;
  const cleanGuess = guess.trim().toLowerCase();
  const cleanSecret = secretWord.trim().toLowerCase();

  if (cleanGuess === cleanSecret) return true;
  if (cleanSecret.includes(cleanGuess) && cleanGuess.length >= 3) return true;
  if (cleanGuess.includes(cleanSecret) && cleanSecret.length >= 3) return true;

  return false;
}
