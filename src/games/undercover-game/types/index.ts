export type RoleType = 'civilian' | 'undercover' | 'mrwhite';

export interface Player {
  id: string;
  name: string;
  role: RoleType;
  word: string;
  isAlive: boolean;
  color: string;
  avatarSeed: string;
}

export interface WordPair {
  civilian: string;
  undercover: string;
  hint: string;
}

export interface CustomWords {
  civilian: string;
  undercover: string;
}

export interface CategoryInfo {
  name: string;
  icon: string;
  description: string;
  pairs: WordPair[];
}

export type CategoryKey = 'food' | 'tech' | 'places' | 'college' | 'objects' | 'nature' | 'custom';

export type GameStage = 'mode_select' | 'setup' | 'reveal' | 'turn' | 'vote' | 'gameover' | 'online';

export type VotingMode = 'consensus' | 'secret';

export interface GameSettings {
  civilianCount: number;
  undercoverCount: number;
  mrWhiteCount: number;
  turnTimerSeconds: number;
  debateTimerSeconds: number;
  votingMode: VotingMode;
  category: CategoryKey;
}

export interface WinConditionResult {
  isOver: boolean;
  winner: 'civilians' | 'undercover' | 'mrwhite' | null;
  reason: string;
}

export interface OnlinePlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
  role?: RoleType;
  word?: string;
  color: string;
  avatar: string;
  isMuted?: boolean;
  isSpeaking?: boolean;
}

export interface OnlineRoomState {
  code: string;
  hostId: string;
  phase: 'LOBBY' | 'BRIEFING' | 'CLUES' | 'VOTING' | 'DEBRIEF';
  players: OnlinePlayer[];
  currentTurnIndex: number;
  roundNumber: number;
  category: CategoryKey;
  undercoverCount: number;
  mrWhiteCount: number;
  turnTimer: number;
  debateTimer: number;
  votes: Record<string, string>;
  winner?: 'civilians' | 'undercover' | 'mrwhite' | null;
  winReason?: string;
  civilianWord?: string;
  undercoverWord?: string;
}
