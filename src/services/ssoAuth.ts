/**
 * Adapter ensuring complete backwards-compatibility between legacy SSO references
 * and the modern full AuthService with persistent PostgreSQL/Supabase schemas.
 */

import { authService } from './authService';
import type { UserProfile, PlayerStats } from '../types/sso';
import type { UserAccount } from '../types/auth';

function accountToUserProfile(acc: UserAccount): UserProfile {
  return {
    id: acc.id,
    username: acc.username,
    displayName: acc.displayName,
    email: acc.email,
    avatar: acc.avatar,
    isGuest: acc.isGuest,
    tier: acc.tier,
    joinedAt: acc.createdAt,
  };
}

function accountToPlayerStats(acc: UserAccount): PlayerStats {
  return {
    gamesPlayed: acc.stats.gamesPlayed,
    wins: acc.stats.wins,
    losses: acc.stats.losses,
    winRate: acc.stats.winRate,
    civilianWins: acc.stats.civilianWins,
    undercoverWins: acc.stats.undercoverWins,
    mrWhiteBluffs: acc.stats.mrWhiteBluffs,
    rating: acc.rating,
  };
}

export type SSOListener = (user: UserProfile, stats: PlayerStats) => void;

class SSOAuthAdapter {
  public get user(): UserProfile {
    return accountToUserProfile(authService.currentUser);
  }

  public get stats(): PlayerStats {
    return accountToPlayerStats(authService.currentUser);
  }

  public updateDisplayName(newName: string): void {
    authService.updateDisplayName(newName);
  }

  public recordGameResult(role: 'civilian' | 'undercover' | 'mrwhite', hasWon: boolean): void {
    authService.recordMatchResult({
      gameId: 'undercover',
      gameName: 'Undercover',
      result: hasWon ? 'WIN' : 'LOSS',
      roleOrRank: role,
    });
  }

  public logout(): void {
    authService.logout();
  }

  public subscribe(listener: SSOListener): () => void {
    const unsub = authService.subscribe((acc) => {
      listener(accountToUserProfile(acc), accountToPlayerStats(acc));
    });
    return unsub;
  }
}

export const ssoAuth = new SSOAuthAdapter();
