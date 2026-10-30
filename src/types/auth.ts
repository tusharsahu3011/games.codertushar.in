/**
 * Authentication, User Profiles, Match History, and Achievements Schema
 * Designed for Supabase / PostgreSQL architecture with offline & guest persistence
 */

export interface MatchRecord {
  id: string;
  gameId: 'bhabhi' | 'undercover' | 'spyfall' | string;
  gameName: string;
  date: string;
  result: 'WIN' | 'LOSS';
  roleOrRank: string; // e.g. "Got Away #1", "Civilian", "Spy", "Mr. White"
  scoreOrRatingDelta: number; // e.g. +25
  roomCode: string;
  notes?: string;
}

export interface PlayerAchievement {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'undercover' | 'spyfall' | 'bhabhi';
  icon: string;
  unlockedAt?: string | null;
  progress?: number; // 0 to 100
  maxProgress?: number;
}

export interface UserAccount {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  isEmailVerified: boolean;
  isGuest: boolean;
  tier: string;
  bio?: string;
  createdAt: string;
  lastLoginAt: string;
  rating: number;
  stats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    bhabhiEscapes: number;
    civilianWins: number;
    undercoverWins: number;
    spyWins: number;
    mrWhiteBluffs: number;
  };
  achievements: PlayerAchievement[];
  matchHistory: MatchRecord[];
}

export interface AuthSession {
  user: UserAccount | null;
  token?: string;
  isAuthenticated: boolean;
  isGuest: boolean;
}

export interface VerificationChallenge {
  email: string;
  code: string;
  expiresAt: number;
  createdAt: number;
}

