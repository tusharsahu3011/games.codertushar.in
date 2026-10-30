/**
 * Online Multiplayer Room & WebSocket Synchronization Engine in TypeScript
 */

import { getRandomWordPair } from '../data/wordPairs';
import { initializePlayers, evaluateGameStatus } from './gameEngine';
import type { UserProfile } from '../../../types/sso';
import { webrtcVoice } from './webrtcVoice';

export interface RoomPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isAlive: boolean;
  role: 'civilian' | 'undercover' | 'mrwhite' | null;
  word: string | null;
  hasViewedSecret: boolean;
  avatar: string;
}

export interface RoomSettings {
  turnDuration: number;
  undercovers: number;
  hasMrWhite: boolean;
  category: string;
  customWords: { civilianWord: string; undercoverWord: string } | null;
}

export interface RoomOutcome {
  winner: 'civilians' | 'undercover' | 'mrwhite' | null;
  reason: string;
}

export interface RoomData {
  code: string;
  hostId: string;
  hostName: string;
  createdAt: number;
  phase: 'lobby' | 'briefing' | 'turn' | 'vote' | 'gameover';
  round: number;
  settings: RoomSettings;
  players: RoomPlayer[];
  wordPair: { civilianWord: string; undercoverWord: string; category?: string; pair?: string } | null;
  activeTurnIndex: number;
  completedTurns: string[];
  eliminatedPlayers: string[];
  votes: Record<string, string>;
  outcome: RoomOutcome | null;
  chatMessages?: { id: string; senderId: string; senderName: string; text: string; timestamp: number }[];
}

export interface MultiplayerSnapshot {
  room: RoomData | null;
  myPlayerId: string | null;
  isHost: boolean;
  myPlayer: RoomPlayer | null;
}

export type MultiplayerListener = (snapshot: MultiplayerSnapshot) => void;

const BROADCAST_CHANNEL_NAME = 'fwd_undercover_multiplayer';
const ROOM_STORAGE_PREFIX = 'fwd_room_';

class MultiplayerSocketEngine {
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  public currentRoom: RoomData | null = null;
  public myPlayerId: string | null = null;
  private listeners: Set<MultiplayerListener> = new Set();

  constructor() {
    this.setupBroadcastChannel();
    this.restoreSavedSession();
  }

  private setupBroadcastChannel(): void {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    try {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      this.channel.onmessage = (event: MessageEvent) => {
        const { type, payload, roomCode } = event.data || {};
        if (this.currentRoom && this.currentRoom.code === roomCode) {
          this.handleIncomingAction(type, payload);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not supported in this context:', e);
    }
  }

  private syncToLanServer(room: RoomData | null): void {
    if (!room || typeof window === 'undefined') return;
    try {
      fetch('/api/multiplayer/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(room),
      }).catch(() => {});
    } catch (e) {}
  }

  private subscribeToLanEvents(code: string): void {
    if (typeof window === 'undefined' || !window.EventSource) return;
    this.disconnectLanEvents();
    try {
      this.eventSource = new EventSource(`/api/multiplayer/events?code=${encodeURIComponent(code)}`);
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.type === 'VOICE_SIGNAL' && data.payload) {
            const { fromPlayerId, targetPlayerId, signal } = data.payload;
            if (targetPlayerId === this.myPlayerId && fromPlayerId && signal) {
              webrtcVoice.handleIncomingSignal(fromPlayerId, signal);
            }
            return;
          }

          const room = data as RoomData;
          if (room && room.code === code) {
            this.currentRoom = room;
            this.saveLocalRoom(room);
            if (this.myPlayerId && room.players) {
              const otherPeers = room.players
                .filter((p) => p.id !== this.myPlayerId)
                .map((p) => p.id);
              webrtcVoice.syncPeers(otherPeers);
            }
            this.notify();
          }
        } catch (e) {
          console.warn('Failed parsing LAN room update', e);
        }
      };
    } catch (e) {
      console.warn('LAN EventSource setup failed:', e);
    }
  }

  private disconnectLanEvents(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private restoreSavedSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedCode = sessionStorage.getItem('fwd_active_room');
      const savedPlayerId = sessionStorage.getItem('fwd_active_player');
      if (savedCode) {
        const cleanCode = savedCode.trim().toUpperCase();
        const local = this.getLocalRoom(cleanCode);
        if (local) {
          this.currentRoom = local;
          this.myPlayerId = savedPlayerId || null;
          this.subscribeToLanEvents(cleanCode);
        } else {
          // Fetch from LAN server asynchronously
          fetch(`/api/multiplayer/room?code=${encodeURIComponent(cleanCode)}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
              const candidate = (json?.room || (json?.code ? json : null)) as RoomData | null;
              if (candidate && candidate.code?.toUpperCase() === cleanCode) {
                this.currentRoom = candidate;
                this.myPlayerId = savedPlayerId || null;
                this.saveLocalRoom(candidate);
                this.subscribeToLanEvents(cleanCode);
                this.notify();
              }
            })
            .catch(() => {});
        }
      }
    } catch (e) {}
  }

  public generateRoomCode(): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    const randomDigits = Math.floor(10000 + Math.random() * 90000).toString();
    return `${randomLetter}${randomDigits}`;
  }

  private saveLocalRoom(room: RoomData): void {
    try {
      localStorage.setItem(`${ROOM_STORAGE_PREFIX}${room.code.toUpperCase()}`, JSON.stringify(room));
    } catch (e) {}
  }

  public getLocalRoom(code: string): RoomData | null {
    try {
      const data = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${code.toUpperCase()}`);
      return data ? (JSON.parse(data) as RoomData) : null;
    } catch (e) {
      return null;
    }
  }

  private broadcast(type: string, payload: unknown): void {
    if (this.channel && this.currentRoom) {
      this.channel.postMessage({
        type,
        payload,
        roomCode: this.currentRoom.code,
      });
    }
  }

  private handleIncomingAction(type: string, payload: unknown): void {
    switch (type) {
      case 'ROOM_UPDATED':
      case 'GAME_STARTED': {
        const room = payload as RoomData;
        this.currentRoom = room;
        if (this.myPlayerId && room.players) {
          const otherPeers = room.players
            .filter((p) => p.id !== this.myPlayerId)
            .map((p) => p.id);
          webrtcVoice.syncPeers(otherPeers);
        }
        this.notify();
        break;
      }
      case 'VOICE_SIGNAL': {
        const { fromPlayerId, targetPlayerId, signal } = (payload || {}) as {
          fromPlayerId?: string;
          targetPlayerId?: string;
          signal?: unknown;
        };
        if (targetPlayerId === this.myPlayerId && fromPlayerId && signal) {
          webrtcVoice.handleIncomingSignal(fromPlayerId, signal);
        }
        break;
      }
      case 'VOICE_STATUS': {
        const { fromPlayerId, isMuted, isSpeaking, volume } = (payload || {}) as {
          fromPlayerId?: string;
          isMuted?: boolean;
          isSpeaking?: boolean;
          volume?: number;
        };
        if (fromPlayerId && fromPlayerId !== this.myPlayerId) {
          webrtcVoice.updatePeerState(fromPlayerId, {
            isMuted: Boolean(isMuted),
            isSpeaking: Boolean(isSpeaking),
            volume: Number(volume || 0),
          });
        }
        break;
      }
      default:
        break;
    }
  }

  public createRoom({ hostName, hostId, ssoUser }: { hostName?: string; hostId?: string; ssoUser?: UserProfile | null }): RoomData {
    const code = this.generateRoomCode();
    const myId = hostId || ssoUser?.id || `player_${Date.now()}`;
    this.myPlayerId = myId;

    const initialRoom: RoomData = {
      code,
      hostId: myId,
      hostName: hostName || ssoUser?.displayName || 'Host Agent',
      createdAt: Date.now(),
      phase: 'lobby',
      round: 1,
      settings: {
        turnDuration: 30,
        undercovers: 1,
        hasMrWhite: false,
        category: 'all',
        customWords: null,
      },
      players: [
        {
          id: myId,
          name: hostName || ssoUser?.displayName || 'Host Agent',
          isHost: true,
          isReady: true,
          isAlive: true,
          role: null,
          word: null,
          hasViewedSecret: false,
          avatar: ssoUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostName || 'host'}`,
        },
      ],
      wordPair: null,
      activeTurnIndex: 0,
      completedTurns: [],
      eliminatedPlayers: [],
      votes: {},
      outcome: null,
    };

    this.currentRoom = initialRoom;
    this.saveLocalRoom(initialRoom);
    try {
      sessionStorage.setItem('fwd_active_room', initialRoom.code);
      sessionStorage.setItem('fwd_active_player', myId);
    } catch (e) {}

    this.syncToLanServer(initialRoom);
    this.subscribeToLanEvents(code);

    webrtcVoice.setSignaling(
      myId,
      (targetPlayerId, signal) => {
        this.broadcast('VOICE_SIGNAL', { fromPlayerId: myId, targetPlayerId, signal });
        if (this.currentRoom) {
          fetch('/api/multiplayer/voice-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomCode: this.currentRoom.code,
              fromPlayerId: myId,
              targetPlayerId,
              signal,
            }),
          }).catch(() => {});
        }
      },
      (status) => {
        this.broadcast('VOICE_STATUS', { fromPlayerId: myId, ...status });
      }
    );

    this.notify();
    return initialRoom;
  }

  public async joinRoom({ code, playerName, playerId, ssoUser }: { code: string; playerName: string; playerId?: string; ssoUser?: UserProfile | null }): Promise<RoomData> {
    const cleanCode = (code || '').trim().toUpperCase();
    let existingRoom = this.getLocalRoom(cleanCode) || (this.currentRoom?.code?.toUpperCase() === cleanCode ? this.currentRoom : null);

    // If not found in local storage, query dev LAN server
    if (!existingRoom && typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/multiplayer/room?code=${encodeURIComponent(cleanCode)}`);
        if (res.ok) {
          const data = await res.json();
          const candidate = (data?.room || (data?.code ? data : null)) as RoomData | null;
          if (candidate && candidate.code?.toUpperCase() === cleanCode) {
            existingRoom = candidate;
            this.saveLocalRoom(existingRoom);
          }
        }
      } catch (e) {
        console.warn('LAN fetch room error:', e);
      }
    }

    if (!existingRoom) {
      throw new Error(`Room "${cleanCode}" not found. Verify the code or create a new room.`);
    }

    if (existingRoom.phase !== 'lobby') {
      throw new Error(`Mission "${cleanCode}" has already started! Cannot join active session.`);
    }

    const myId = playerId || ssoUser?.id || `player_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const cleanName = (playerName || '').trim();

    // Deduplicate: check if a player with this ID or matching name already exists
    const existingIndex = existingRoom.players.findIndex(
      (p) => p.id === myId || (cleanName && p.name.trim().toLowerCase() === cleanName.toLowerCase())
    );

    let updatedPlayers: RoomPlayer[];
    if (existingIndex !== -1) {
      // Re-use and update existing player slot — NEVER push a duplicate or ghost entry
      const existingPlayer = existingRoom.players[existingIndex];
      this.myPlayerId = existingPlayer.id;
      updatedPlayers = existingRoom.players.map((p, idx) => {
        if (idx === existingIndex) {
          return {
            ...p,
            name: cleanName || p.name,
            avatar: ssoUser?.avatar || p.avatar,
            isReady: true,
            isAlive: true,
          };
        }
        return p;
      });
    } else {
      this.myPlayerId = myId;
      const newPlayer: RoomPlayer = {
        id: myId,
        name: cleanName || `Agent_${existingRoom.players.length + 1}`,
        isHost: false,
        isReady: true,
        isAlive: true,
        role: null,
        word: null,
        hasViewedSecret: false,
        avatar: ssoUser?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName || myId}`,
      };
      updatedPlayers = [...existingRoom.players, newPlayer];
    }

    // Defensive deduplication across all entries
    const seen = new Map<string, RoomPlayer>();
    for (const p of updatedPlayers) {
      if (p && p.id && p.name && p.name.trim() !== '') {
        seen.set(p.id, p);
      }
    }
    updatedPlayers = Array.from(seen.values());

    const updatedRoom: RoomData = {
      ...existingRoom,
      players: updatedPlayers,
    };

    this.currentRoom = updatedRoom;
    this.saveLocalRoom(updatedRoom);
    try {
      sessionStorage.setItem('fwd_active_room', updatedRoom.code);
      sessionStorage.setItem('fwd_active_player', this.myPlayerId);
    } catch (e) {}

    this.syncToLanServer(updatedRoom);
    this.subscribeToLanEvents(cleanCode);
    this.broadcast('ROOM_UPDATED', updatedRoom);

    webrtcVoice.setSignaling(
      this.myPlayerId,
      (targetPlayerId, signal) => {
        this.broadcast('VOICE_SIGNAL', { fromPlayerId: this.myPlayerId, targetPlayerId, signal });
        if (this.currentRoom) {
          fetch('/api/multiplayer/voice-signal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomCode: this.currentRoom.code,
              fromPlayerId: this.myPlayerId,
              targetPlayerId,
              signal,
            }),
          }).catch(() => {});
        }
      },
      (status) => {
        this.broadcast('VOICE_STATUS', { fromPlayerId: this.myPlayerId, ...status });
      }
    );

    this.notify();
    return updatedRoom;
  }

  public sendChatMessage(text: string): void {
    const trimmed = (text || '').trim();
    if (!trimmed || !this.currentRoom || !this.myPlayerId) return;

    const me = this.currentRoom.players.find((p) => p.id === this.myPlayerId);
    const chatMsg = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      senderId: this.myPlayerId,
      senderName: me?.name || 'Agent',
      text: trimmed.substring(0, 160),
      timestamp: Date.now(),
    };

    const updatedMessages = [...(this.currentRoom.chatMessages || []), chatMsg];
    if (updatedMessages.length > 80) updatedMessages.shift();

    const updated: RoomData = {
      ...this.currentRoom,
      chatMessages: updatedMessages,
    };
    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public updateSettings(newSettings: Partial<RoomSettings>): void {
    if (!this.currentRoom) return;
    const updated: RoomData = {
      ...this.currentRoom,
      settings: {
        ...this.currentRoom.settings,
        ...newSettings,
      },
    };
    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public kickPlayer(playerIdToKick: string): void {
    if (!this.currentRoom) return;
    if (this.currentRoom.hostId !== this.myPlayerId) return;

    const updatedPlayers = this.currentRoom.players.filter((p) => p.id !== playerIdToKick);
    const updated: RoomData = {
      ...this.currentRoom,
      players: updatedPlayers,
    };
    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public startOnlineGame(): void {
    if (!this.currentRoom) return;
    const { players, settings } = this.currentRoom;

    let pair: { civilianWord: string; undercoverWord: string; category?: string; pair?: string };
    if (settings.customWords) {
      pair = {
        civilianWord: settings.customWords.civilianWord,
        undercoverWord: settings.customWords.undercoverWord,
        category: 'custom',
        pair: `${settings.customWords.civilianWord} & ${settings.customWords.undercoverWord}`,
      };
    } else {
      pair = getRandomWordPair(settings.category);
    }

    const playerNames = players.map((p) => p.name);
    const initializedRoster = initializePlayers(playerNames, pair, {
      undercovers: settings.undercovers,
      mrWhites: settings.hasMrWhite ? 1 : 0,
    });

    const assignedPlayers: RoomPlayer[] = players.map((p, idx) => {
      const match = initializedRoster[idx];
      return {
        ...p,
        role: match.role,
        word: match.word,
        isAlive: true,
        hasViewedSecret: false,
      };
    });

    const startedRoom: RoomData = {
      ...this.currentRoom,
      phase: 'briefing',
      round: 1,
      wordPair: pair,
      players: assignedPlayers,
      activeTurnIndex: 0,
      completedTurns: [],
      votes: {},
      outcome: null,
    };

    this.currentRoom = startedRoom;
    this.saveLocalRoom(startedRoom);
    this.syncToLanServer(startedRoom);
    this.broadcast('GAME_STARTED', startedRoom);
    this.notify();
  }

  public markSecretViewed(playerId: string): void {
    if (!this.currentRoom) return;
    const updatedPlayers = this.currentRoom.players.map((p) =>
      p.id === playerId ? { ...p, hasViewedSecret: true } : p
    );
    const allViewed = updatedPlayers.every((p) => p.hasViewedSecret);

    const updated: RoomData = {
      ...this.currentRoom,
      players: updatedPlayers,
      phase: allViewed ? 'turn' : this.currentRoom.phase,
    };

    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public advanceTurn(): void {
    if (!this.currentRoom) return;
    const { players, activeTurnIndex, completedTurns } = this.currentRoom;
    const alivePlayers = players.filter((p) => p.isAlive);
    const currentSpeaker = alivePlayers[activeTurnIndex];

    const nextCompleted = currentSpeaker && !completedTurns.includes(currentSpeaker.id)
      ? [...completedTurns, currentSpeaker.id]
      : completedTurns;

    const isAllSpoken = nextCompleted.length >= alivePlayers.length;

    const updated: RoomData = {
      ...this.currentRoom,
      completedTurns: nextCompleted,
      activeTurnIndex: isAllSpoken ? activeTurnIndex : Math.min(activeTurnIndex + 1, alivePlayers.length - 1),
      phase: isAllSpoken ? 'vote' : 'turn',
    };

    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public castVote(voterId: string, targetId: string): void {
    if (!this.currentRoom) return;
    const updatedVotes: Record<string, string> = {
      ...this.currentRoom.votes,
      [voterId]: targetId,
    };

    const alivePlayers = this.currentRoom.players.filter((p) => p.isAlive);
    const allVoted = alivePlayers.every((p) => updatedVotes[p.id]);

    let updatedPhase = this.currentRoom.phase;
    let updatedPlayers = this.currentRoom.players;
    let nextOutcome: RoomOutcome | null = this.currentRoom.outcome;

    if (allVoted) {
      const tally: Record<string, number> = {};
      Object.values(updatedVotes).forEach((tid) => {
        tally[tid] = (tally[tid] || 0) + 1;
      });

      let highestVoteTarget: string | null = null;
      let maxVotes = -1;
      Object.entries(tally).forEach(([tid, count]) => {
        if (count > maxVotes) {
          maxVotes = count;
          highestVoteTarget = tid;
        }
      });

      const eliminated = updatedPlayers.find((p) => p.id === highestVoteTarget);
      if (eliminated) {
        updatedPlayers = updatedPlayers.map((p) =>
          p.id === eliminated.id ? { ...p, isAlive: false } : p
        );

        const evaluation = evaluateGameStatus(
          updatedPlayers.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role || 'civilian',
            word: p.word,
            isAlive: p.isAlive,
            eliminatedRound: null,
            votesReceived: 0,
            hasSeenWord: p.hasViewedSecret,
          }))
        );

        if (evaluation.isOver) {
          updatedPhase = 'gameover';
          nextOutcome = { winner: evaluation.winner, reason: evaluation.reason };
        } else {
          updatedPhase = 'turn';
        }
      }
    }

    const updated: RoomData = {
      ...this.currentRoom,
      votes: updatedVotes,
      players: updatedPlayers,
      phase: updatedPhase,
      outcome: nextOutcome,
      completedTurns: updatedPhase === 'turn' ? [] : this.currentRoom.completedTurns,
      activeTurnIndex: updatedPhase === 'turn' ? 0 : this.currentRoom.activeTurnIndex,
      round: updatedPhase === 'turn' ? this.currentRoom.round + 1 : this.currentRoom.round,
    };

    this.currentRoom = updated;
    this.saveLocalRoom(updated);
    this.syncToLanServer(updated);
    this.broadcast('ROOM_UPDATED', updated);
    this.notify();
  }

  public leaveRoom(): void {
    webrtcVoice.stop();
    this.disconnectLanEvents();
    if (!this.currentRoom) return;
    const remaining = this.currentRoom.players.filter((p) => p.id !== this.myPlayerId);
    if (remaining.length === 0) {
      try {
        localStorage.removeItem(`${ROOM_STORAGE_PREFIX}${this.currentRoom.code}`);
      } catch (e) {}
    } else {
      const updated: RoomData = {
        ...this.currentRoom,
        players: remaining,
        hostId: this.currentRoom.hostId === this.myPlayerId ? remaining[0].id : this.currentRoom.hostId,
      };
      this.saveLocalRoom(updated);
      this.syncToLanServer(updated);
      this.broadcast('ROOM_UPDATED', updated);
    }
    this.currentRoom = null;
    this.myPlayerId = null;
    try {
      sessionStorage.removeItem('fwd_active_room');
      sessionStorage.removeItem('fwd_active_player');
    } catch (e) {}
    this.notify();
  }

  public getMyPlayer(): RoomPlayer | null {
    if (!this.currentRoom || !this.myPlayerId) return null;
    return this.currentRoom.players.find((p) => p.id === this.myPlayerId) || null;
  }

  public isHost(): boolean {
    if (!this.currentRoom || !this.myPlayerId) return false;
    return this.currentRoom.hostId === this.myPlayerId;
  }

  public subscribe(listener: MultiplayerListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public notify(): void {
    const snapshot: MultiplayerSnapshot = {
      room: this.currentRoom,
      myPlayerId: this.myPlayerId,
      isHost: this.isHost(),
      myPlayer: this.getMyPlayer(),
    };
    this.listeners.forEach((l) => l(snapshot));
  }
}

export const multiplayerSocket = new MultiplayerSocketEngine();
