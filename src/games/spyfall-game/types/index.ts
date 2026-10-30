export type LocationCategory = 'classic' | 'urban' | 'adventure' | 'scifi' | 'all';

export interface LocationRole {
  title: string;
  duty: string;
}

export interface SpyfallLocation {
  id: string;
  name: string;
  category: 'classic' | 'urban' | 'adventure' | 'scifi';
  emoji: string;
  description: string;
  lore?: string;
  roles: LocationRole[];
}

export interface SpyfallPlayer {
  id: string;
  name: string;
  isSpy: boolean;
  role: string;
  roleDuty: string;
  location: string | null;
  avatarSeed: string;
  color: string;
  hasViewedBriefing?: boolean;
}

export interface SpyfallSettings {
  spyCount: number;
  roundDurationSeconds: number; // e.g. 300 (5m), 420 (7m), 480 (8m), 600 (10m)
  category: LocationCategory;
  rolesEnabled: boolean;
}

export type SpyfallGameStage =
  | 'mode_select'
  | 'setup'
  | 'reveal'
  | 'interrogation'
  | 'accusation'
  | 'spy_guess'
  | 'gameover'
  | 'online';

export interface SpyfallOutcome {
  winner: 'operatives' | 'spy' | null;
  reason: string;
  secretLocation: SpyfallLocation;
  spies: { id: string; name: string }[];
  guiltyPlayer?: { id: string; name: string; isSpy: boolean };
  guessedLocation?: SpyfallLocation;
  wasGuessCorrect?: boolean;
}

// Online Multiplayer Types
export interface SpyfallOnlinePlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  avatar: string;
  color: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
  // Private to client or revealed at debrief
  isSpy?: boolean;
  locationName?: string;
  roleName?: string;
  roleDuty?: string;
  hasViewedBriefing?: boolean;
}

export interface SpyfallOnlineAccusation {
  accuserPlayerId: string;
  accusedPlayerId: string;
  votes: Record<string, boolean>; // playerId -> true (guilty) / false (innocent)
  startedAt: number;
}

export interface SpyfallOnlineRoomData {
  code: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  phase: 'LOBBY' | 'BRIEFING' | 'INTERROGATION' | 'ACCUSATION' | 'SPY_GUESS' | 'DEBRIEF';
  round: number;
  settings: SpyfallSettings;
  players: SpyfallOnlinePlayer[];
  locationId?: string; // Stored in room state; sanitized in client views for spies
  locationName?: string;
  activeQuestionerId?: string;
  timerStartedAt?: number;
  timerDuration?: number; // seconds
  timerRemaining?: number;
  isTimerPaused?: boolean;
  accusation?: SpyfallOnlineAccusation | null;
  spyGuess?: {
    spyPlayerId: string;
    guessedLocationId: string;
  } | null;
  outcome?: SpyfallOutcome | null;
  chatMessages?: { id: string; senderId: string; senderName: string; text: string; timestamp: number }[];
}
