import type {
  SpyfallLocation,
  SpyfallPlayer,
  SpyfallSettings,
  SpyfallOutcome,
} from '../types';
import { getRandomLocation } from '../data/locations';

export const AGENT_CODENAMES = [
  'Agent Falcon', 'Shadow Hawk', 'Operative Viper', 'Cipher',
  'Ghost Raven', 'Specter', 'Agent Lynx', 'Silver Fox',
  'Agent Phantom', 'Mirage', 'Echo Blue', 'Crimson Wolf',
  'Nightshade', 'Agent Apex', 'Black Lotus', 'Tracker',
];

export const AGENT_COLORS = [
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#e11d48', // Red
  '#84cc16', // Lime
  '#0284c7', // Sky
];

export interface SetupPlayerInput {
  id: string;
  name: string;
  avatarSeed?: string;
  color?: string;
}

export function initializeSpyfallGame(
  playerInputs: SetupPlayerInput[],
  settings: SpyfallSettings
): {
  players: SpyfallPlayer[];
  secretLocation: SpyfallLocation;
} {
  const secretLocation = getRandomLocation(settings.category);
  const totalPlayers = playerInputs.length;
  const numSpies = Math.min(settings.spyCount, Math.max(1, Math.floor(totalPlayers / 3)));

  // Randomly pick spy indices
  const allIndices = Array.from({ length: totalPlayers }, (_, i) => i);
  // Fisher-Yates shuffle
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }

  const spyIndices = new Set(allIndices.slice(0, numSpies));

  // Shuffle roles for operatives
  const shuffledRoles = [...secretLocation.roles];
  for (let i = shuffledRoles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
  }

  let roleCounter = 0;

  const players: SpyfallPlayer[] = playerInputs.map((p, idx) => {
    const isSpy = spyIndices.has(idx);
    const color = p.color || AGENT_COLORS[idx % AGENT_COLORS.length];
    const avatarSeed = p.avatarSeed || p.name || `agent_${idx + 1}`;

    if (isSpy) {
      return {
        id: p.id,
        name: p.name.trim() || `Agent ${idx + 1}`,
        isSpy: true,
        role: 'The Spy',
        roleDuty: 'Blend in, interrogate suspects without blowing cover, and deduce the secret location!',
        location: null,
        avatarSeed,
        color,
        hasViewedBriefing: false,
      };
    }

    const assignedRole = settings.rolesEnabled && shuffledRoles.length > 0
      ? shuffledRoles[roleCounter % shuffledRoles.length]
      : { title: 'Covert Operative', duty: `Observe behavior and confirm teammates at the ${secretLocation.name}.` };
    roleCounter++;

    return {
      id: p.id,
      name: p.name.trim() || `Agent ${idx + 1}`,
      isSpy: false,
      role: assignedRole.title,
      roleDuty: assignedRole.duty,
      location: secretLocation.name,
      avatarSeed,
      color,
      hasViewedBriefing: false,
    };
  });

  return { players, secretLocation };
}

export function evaluateAccusation(
  accusedPlayer: SpyfallPlayer,
  secretLocation: SpyfallLocation,
  allPlayers: SpyfallPlayer[]
): SpyfallOutcome {
  const spies = allPlayers.filter((p) => p.isSpy).map((p) => ({ id: p.id, name: p.name }));

  if (accusedPlayer.isSpy) {
    return {
      winner: 'operatives',
      reason: `Operatives unmasked the Spy (${accusedPlayer.name})! The classified location was secure at the ${secretLocation.name}.`,
      secretLocation,
      spies,
      guiltyPlayer: { id: accusedPlayer.id, name: accusedPlayer.name, isSpy: true },
    };
  } else {
    return {
      winner: 'spy',
      reason: `Wrongful conviction! ${accusedPlayer.name} was an innocent operative (${accusedPlayer.role}). The Spy slipped away undetected!`,
      secretLocation,
      spies,
      guiltyPlayer: { id: accusedPlayer.id, name: accusedPlayer.name, isSpy: false },
    };
  }
}

export function evaluateSpyGuess(
  spyPlayer: SpyfallPlayer,
  guessedLocation: SpyfallLocation,
  secretLocation: SpyfallLocation,
  allPlayers: SpyfallPlayer[]
): SpyfallOutcome {
  const spies = allPlayers.filter((p) => p.isSpy).map((p) => ({ id: p.id, name: p.name }));
  const isCorrect = guessedLocation.id === secretLocation.id;

  if (isCorrect) {
    return {
      winner: 'spy',
      reason: `Masterstroke! The Spy (${spyPlayer.name}) correctly identified the secret location as the ${secretLocation.name}!`,
      secretLocation,
      spies,
      guessedLocation,
      wasGuessCorrect: true,
    };
  } else {
    return {
      winner: 'operatives',
      reason: `Failed infiltration! The Spy (${spyPlayer.name}) guessed ${guessedLocation.name}, but the true classified location was ${secretLocation.name}!`,
      secretLocation,
      spies,
      guessedLocation,
      wasGuessCorrect: false,
    };
  }
}
