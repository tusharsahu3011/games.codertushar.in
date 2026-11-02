export type Suit = 'SPADES' | 'HEARTS' | 'DIAMONDS' | 'CLUBS';

export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11=J, 12=Q, 13=K, 14=A

export interface Card {
  id: string; // e.g., "SPADES_14"
  suit: Suit;
  rank: Rank;
}

export interface Player {
  id: string; // Socket ID or User ID
  name: string;
  hand: Card[];
  isOut: boolean;
  seatIndex: number;
  avatar?: string;
  isBot?: boolean;
  connected?: boolean;
  handCount?: number; // for masked opponents
  exitRank?: number; // 1st to get away, 2nd to get away, etc.
}

export interface PlayedCard {
  playerId: string;
  playerName: string;
  card: Card;
  playedAt?: number;
}

export interface ActiveTrick {
  leadSuit: Suit | null;
  cards: PlayedCard[];
  leadPlayerId: string;
}

export enum GameStatus {
  LOBBY = 'LOBBY',
  IN_PROGRESS = 'IN_PROGRESS',
  FINISHED = 'FINISHED',
}

export interface GameLogEntry {
  id: string;
  text: string;
  timestamp: number;
  type: 'info' | 'thoko' | 'lead' | 'win' | 'exit' | 'bhabhi';
}

export interface CompletedTrickInfo {
  cards: PlayedCard[];
  leadSuit: Suit | null;
  winnerPlayerId?: string;
  winnerName?: string;
  penaltyPlayerId?: string;
  penaltyPlayerName?: string;
  completedAt: number;
  reason: 'win' | 'thoko';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameState {
  gameId: string;
  roomCode?: string;
  isSolo?: boolean;
  status: GameStatus;
  players: Player[];
  activeTrick: ActiveTrick;
  lastCompletedTrick?: CompletedTrickInfo;
  discardPile: Card[];
  currentTurnPlayerId: string;
  firstRound: boolean; // Tracks Ace of Spades requirement
  loserId: string | null; // Bhabhi
  lastAction?: string;
  logs: GameLogEntry[];
  chatMessages?: ChatMessage[];
  hostId: string;
  createdAt: number;
  winnerOrder: string[]; // playerIds in order of safe exits
}

export type BhabhiGameMode = 'single_player' | 'online_room' | 'pass_and_play';

export interface MoveValidationResult {
  valid: boolean;
  reason?: string;
}

// WebSocket / Network Protocol Payloads
export type BhabhiSocketEvent =
  | { type: 'CREATE_ROOM'; payload: { hostName: string; avatar?: string } }
  | { type: 'JOIN_ROOM'; payload: { roomCode: string; playerName: string; avatar?: string; playerId?: string } }
  | { type: 'START_GAME'; payload?: Record<string, never> }
  | { type: 'PLAY_CARD'; payload: { cardId: string } }
  | { type: 'SEND_CHAT'; payload: { text: string } }
  | { type: 'ADD_BOT'; payload?: Record<string, never> }
  | { type: 'REMOVE_BOT'; payload: { botId: string } }
  | { type: 'RESTART_GAME'; payload?: Record<string, never> }
  | { type: 'GAME_STATE'; payload: GameState }
  | { type: 'ERROR'; payload: { message: string } };
