export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email?: string | null;
  avatar: string;
  role?: string;
  isGuest: boolean;
  tier: string;
  joinedAt?: string;
  token?: string;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  winRate: number;
  civilianWins: number;
  undercoverWins: number;
  mrWhiteBluffs: number;
  rating: number;
}

export interface GameResultPayload {
  role: 'civilian' | 'undercover' | 'mrwhite';
  won: boolean;
}
