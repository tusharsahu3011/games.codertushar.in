import type {
  SpyfallLocation,
  SpyfallSettings,
  SpyfallOutcome,
  SpyfallOnlineRoomData,
  SpyfallOnlinePlayer,
} from '../types';
import { SPYFALL_LOCATIONS, getRandomLocation } from '../data/locations';
import { AGENT_COLORS } from './gameEngine';
import type { UserProfile } from '../../../types/sso';
import { webrtcVoice } from '../../undercover-game/utils/webrtcVoice';

export interface SpyfallMultiplayerSnapshot {
  room: SpyfallOnlineRoomData | null;
  myPlayerId: string | null;
  isHost: boolean;
  myPlayer: SpyfallOnlinePlayer | null;
}

export type SpyfallMultiplayerListener = (snapshot: SpyfallMultiplayerSnapshot) => void;

const BROADCAST_CHANNEL_NAME = 'fwd_spyfall_multiplayer';
const ROOM_STORAGE_PREFIX = 'fwd_spyfall_room_';
const SESSION_STORAGE_KEY = 'fwd_spyfall_session';

class SpyfallMultiplayerEngine {
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  public currentRoom: SpyfallOnlineRoomData | null = null;
  public myPlayerId: string | null = null;
  private listeners: Set<SpyfallMultiplayerListener> = new Set();

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
      console.warn('BroadcastChannel not supported:', e);
    }
  }

  private syncToLanServer(room: SpyfallOnlineRoomData | null): void {
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

          const room = data as SpyfallOnlineRoomData;
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
          console.warn('Failed parsing LAN room update:', e);
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

  private saveLocalRoom(room: SpyfallOnlineRoomData): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(`${ROOM_STORAGE_PREFIX}${room.code}`, JSON.stringify(room));
    } catch (e) {}
  }

  private loadLocalRoom(code: string): SpyfallOnlineRoomData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(`${ROOM_STORAGE_PREFIX}${code}`);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  private saveSession(): void {
    if (typeof window === 'undefined') return;
    try {
      if (this.currentRoom && this.myPlayerId) {
        sessionStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ code: this.currentRoom.code, myPlayerId: this.myPlayerId })
        );
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch (e) {}
  }

  private restoreSavedSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return;
      const { code, myPlayerId } = JSON.parse(raw);
      if (code && myPlayerId) {
        const local = this.loadLocalRoom(code);
        if (local) {
          this.currentRoom = local;
          this.myPlayerId = myPlayerId;
          this.subscribeToLanEvents(code);
        }
      }
    } catch (e) {}
  }

  private broadcast(type: string, payload: any): void {
    if (this.channel && this.currentRoom) {
      this.channel.postMessage({
        type,
        payload,
        roomCode: this.currentRoom.code,
      });
    }
    this.syncToLanServer(this.currentRoom);
  }

  public subscribe(listener: SpyfallMultiplayerListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const snap = this.getSnapshot();
    this.listeners.forEach((fn) => fn(snap));
  }

  public getSnapshot(): SpyfallMultiplayerSnapshot {
    const isHost = Boolean(
      this.currentRoom && this.myPlayerId && this.currentRoom.hostId === this.myPlayerId
    );
    const myPlayer =
      this.currentRoom?.players.find((p) => p.id === this.myPlayerId) || null;

    return {
      room: this.currentRoom,
      myPlayerId: this.myPlayerId,
      isHost,
      myPlayer,
    };
  }

  public generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'SPY-';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  public createRoom(hostName: string, ssoUser?: UserProfile): SpyfallOnlineRoomData {
    const code = this.generateRoomCode();
    const myId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    this.myPlayerId = myId;

    const hostPlayer: SpyfallOnlinePlayer = {
      id: myId,
      name: hostName.trim() || ssoUser?.username || 'Host Operative',
      isHost: true,
      isReady: true,
      avatar: ssoUser?.avatar || `agent_seed_${Math.floor(Math.random() * 9999)}`,
      color: AGENT_COLORS[0],
      isMuted: false,
      isSpeaking: false,
    };

    const newRoom: SpyfallOnlineRoomData = {
      code,
      hostId: myId,
      hostName: hostPlayer.name,
      createdAt: Date.now(),
      phase: 'LOBBY',
      round: 1,
      settings: {
        spyCount: 1,
        roundDurationSeconds: 420, // 7 minutes
        category: 'all',
        rolesEnabled: true,
      },
      players: [hostPlayer],
      accusation: null,
      spyGuess: null,
      outcome: null,
    };

    this.currentRoom = newRoom;
    this.saveLocalRoom(newRoom);
    this.saveSession();
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

    this.broadcast('ROOM_SYNC', newRoom);
    this.notify();

    return newRoom;
  }

  public async joinRoom(
    code: string,
    playerName: string,
    ssoUser?: UserProfile
  ): Promise<{ success: boolean; error?: string }> {
    const cleanCode = code.trim().toUpperCase();

    // 1. Try local storage
    let room = this.loadLocalRoom(cleanCode);

    // 2. Fallback to LAN relay endpoint
    if (!room && typeof window !== 'undefined') {
      try {
        const res = await fetch(`/api/multiplayer/room?code=${encodeURIComponent(cleanCode)}`);
        if (res.ok) {
          const json = await res.json();
          room = json.room || json;
        }
      } catch (e) {}
    }

    if (!room) {
      return { success: false, error: 'Room not found. Check the code or ensure the host is online.' };
    }

    if (room.phase !== 'LOBBY') {
      return { success: false, error: 'Game is already in progress.' };
    }

    if (room.players.length >= 12) {
      return { success: false, error: 'Room is full (max 12 operatives).' };
    }

    const cleanName = (playerName || '').trim();
    // Check if player already exists in room by saved session or matching codename
    const existingIndex = room.players.findIndex(
      (p) => (this.myPlayerId && p.id === this.myPlayerId) || (cleanName && p.name.trim().toLowerCase() === cleanName.toLowerCase())
    );

    let playerObj: SpyfallOnlinePlayer;
    if (existingIndex !== -1) {
      playerObj = room.players[existingIndex];
      this.myPlayerId = playerObj.id;
      playerObj.name = cleanName || playerObj.name;
      if (ssoUser?.avatar) playerObj.avatar = ssoUser.avatar;
    } else {
      const myId = `agent_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      this.myPlayerId = myId;
      const colorIndex = room.players.length % AGENT_COLORS.length;
      playerObj = {
        id: myId,
        name: cleanName || ssoUser?.username || `Agent ${room.players.length + 1}`,
        isHost: false,
        isReady: false,
        avatar: ssoUser?.avatar || `agent_seed_${Math.floor(Math.random() * 9999)}`,
        color: AGENT_COLORS[colorIndex],
        isMuted: false,
        isSpeaking: false,
      };
      room.players.push(playerObj);
    }

    // Defensive deduplication of room players
    const seen = new Map<string, SpyfallOnlinePlayer>();
    for (const p of room.players) {
      if (p && p.id && p.name && p.name.trim() !== '') {
        seen.set(p.id, p);
      }
    }
    room.players = Array.from(seen.values());

    this.currentRoom = room;
    this.saveLocalRoom(room);
    this.saveSession();
    this.subscribeToLanEvents(cleanCode);

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

    this.broadcast('ROOM_SYNC', room);
    this.notify();

    return { success: true };
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

    if (!this.currentRoom.chatMessages) {
      this.currentRoom.chatMessages = [];
    }
    this.currentRoom.chatMessages.push(chatMsg);
    if (this.currentRoom.chatMessages.length > 80) {
      this.currentRoom.chatMessages.shift();
    }

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public leaveRoom(): void {
    webrtcVoice.stop();
    if (!this.currentRoom || !this.myPlayerId) return;

    const code = this.currentRoom.code;
    const isHost = this.currentRoom.hostId === this.myPlayerId;

    if (isHost && this.currentRoom.players.length > 1) {
      const remaining = this.currentRoom.players.filter((p) => p.id !== this.myPlayerId);
      remaining[0].isHost = true;
      this.currentRoom.hostId = remaining[0].id;
      this.currentRoom.hostName = remaining[0].name;
      this.currentRoom.players = remaining;
      this.broadcast('ROOM_SYNC', this.currentRoom);
    } else if (isHost) {
      this.broadcast('ROOM_CLOSED', { code });
      this.currentRoom = null;
    } else {
      this.currentRoom.players = this.currentRoom.players.filter((p) => p.id !== this.myPlayerId);
      this.broadcast('ROOM_SYNC', this.currentRoom);
    }

    if (this.currentRoom) {
      this.saveLocalRoom(this.currentRoom);
    }
    this.disconnectLanEvents();
    this.currentRoom = null;
    this.myPlayerId = null;
    this.saveSession();
    this.notify();
  }

  public updateSettings(settings: Partial<SpyfallSettings>): void {
    if (!this.currentRoom) return;
    this.currentRoom.settings = { ...this.currentRoom.settings, ...settings };
    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public setReady(isReady: boolean): void {
    if (!this.currentRoom || !this.myPlayerId) return;
    const player = this.currentRoom.players.find((p) => p.id === this.myPlayerId);
    if (player) {
      player.isReady = isReady;
      this.saveLocalRoom(this.currentRoom);
      this.broadcast('ROOM_SYNC', this.currentRoom);
      this.notify();
    }
  }

  public startBriefing(): void {
    if (!this.currentRoom) return;
    const { players, settings } = this.currentRoom;
    if (players.length < 3) return;

    const secretLocation = getRandomLocation(settings.category);
    const numSpies = Math.min(settings.spyCount, Math.max(1, Math.floor(players.length / 3)));

    // Shuffle spies
    const indices = Array.from({ length: players.length }, (_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const spyIndices = new Set(indices.slice(0, numSpies));

    // Shuffle roles
    const shuffledRoles = [...secretLocation.roles];
    for (let i = shuffledRoles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledRoles[i], shuffledRoles[j]] = [shuffledRoles[j], shuffledRoles[i]];
    }

    let roleCounter = 0;
    players.forEach((p, idx) => {
      p.hasViewedBriefing = false;
      if (spyIndices.has(idx)) {
        p.isSpy = true;
        p.locationName = undefined;
        p.roleName = 'The Spy';
        p.roleDuty = 'Blend in, interrogate suspects without blowing cover, and deduce the secret location!';
      } else {
        p.isSpy = false;
        p.locationName = secretLocation.name;
        const role = settings.rolesEnabled && shuffledRoles.length > 0
          ? shuffledRoles[roleCounter % shuffledRoles.length]
          : { title: 'Covert Operative', duty: `Observe behavior and confirm teammates at the ${secretLocation.name}.` };
        p.roleName = role.title;
        p.roleDuty = role.duty;
        roleCounter++;
      }
    });

    this.currentRoom.phase = 'BRIEFING';
    this.currentRoom.locationId = secretLocation.id;
    this.currentRoom.locationName = secretLocation.name;
    this.currentRoom.accusation = null;
    this.currentRoom.spyGuess = null;
    this.currentRoom.outcome = null;

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public markBriefingViewed(): void {
    if (!this.currentRoom || !this.myPlayerId) return;
    const p = this.currentRoom.players.find((pl) => pl.id === this.myPlayerId);
    if (p) {
      p.hasViewedBriefing = true;
      this.saveLocalRoom(this.currentRoom);
      this.broadcast('ROOM_SYNC', this.currentRoom);
      this.notify();
    }
  }

  public startInterrogation(): void {
    if (!this.currentRoom) return;
    const duration = this.currentRoom.settings.roundDurationSeconds || 420;

    // Pick random first questioner
    const randomIndex = Math.floor(Math.random() * this.currentRoom.players.length);
    const firstQuestioner = this.currentRoom.players[randomIndex];

    this.currentRoom.phase = 'INTERROGATION';
    this.currentRoom.timerDuration = duration;
    this.currentRoom.timerRemaining = duration;
    this.currentRoom.timerStartedAt = Date.now();
    this.currentRoom.isTimerPaused = false;
    this.currentRoom.activeQuestionerId = firstQuestioner.id;

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public pauseTimer(pause: boolean): void {
    if (!this.currentRoom) return;
    this.currentRoom.isTimerPaused = pause;
    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public launchAccusation(accuserPlayerId: string, accusedPlayerId: string): void {
    if (!this.currentRoom) return;
    this.currentRoom.phase = 'ACCUSATION';
    this.currentRoom.isTimerPaused = true;
    this.currentRoom.accusation = {
      accuserPlayerId,
      accusedPlayerId,
      votes: { [accuserPlayerId]: true }, // Accuser votes guilty by default
      startedAt: Date.now(),
    };

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public castVote(voterId: string, isGuilty: boolean): void {
    if (!this.currentRoom || !this.currentRoom.accusation) return;
    this.currentRoom.accusation.votes[voterId] = isGuilty;

    // Check if all players (except accused) have voted
    const votingEligible = this.currentRoom.players.filter(
      (p) => p.id !== this.currentRoom!.accusation!.accusedPlayerId
    );
    const votedCount = Object.keys(this.currentRoom.accusation.votes).length;

    if (votedCount >= votingEligible.length) {
      this.resolveAccusation();
      return;
    }

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public resolveAccusation(): void {
    if (!this.currentRoom || !this.currentRoom.accusation) return;
    const { accusedPlayerId, votes } = this.currentRoom.accusation;
    const accused = this.currentRoom.players.find((p) => p.id === accusedPlayerId);
    if (!accused) return;

    const loc = SPYFALL_LOCATIONS.find((l) => l.id === this.currentRoom!.locationId) || SPYFALL_LOCATIONS[0];
    const guiltyVotes = Object.values(votes).filter((v) => v === true).length;
    const totalVotes = Object.values(votes).length;
    const isConvicted = guiltyVotes > totalVotes / 2;

    const spies = this.currentRoom.players.filter((p) => p.isSpy).map((p) => ({ id: p.id, name: p.name }));

    if (isConvicted) {
      if (accused.isSpy) {
        this.currentRoom.outcome = {
          winner: 'operatives',
          reason: `Operatives accurately convicted the Spy (${accused.name})! The classified location was ${loc.name}.`,
          secretLocation: loc,
          spies,
          guiltyPlayer: { id: accused.id, name: accused.name, isSpy: true },
        };
      } else {
        this.currentRoom.outcome = {
          winner: 'spy',
          reason: `Wrongful conviction! ${accused.name} was an innocent operative (${accused.roleName}). The Spy escaped!`,
          secretLocation: loc,
          spies,
          guiltyPlayer: { id: accused.id, name: accused.name, isSpy: false },
        };
      }
      this.currentRoom.phase = 'DEBRIEF';
    } else {
      // Acquitted - resume interrogation
      this.currentRoom.accusation = null;
      this.currentRoom.phase = 'INTERROGATION';
      this.currentRoom.isTimerPaused = false;
    }

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public spyGuessLocation(spyPlayerId: string, guessedLocationId: string): void {
    if (!this.currentRoom) return;
    const spy = this.currentRoom.players.find((p) => p.id === spyPlayerId);
    const loc = SPYFALL_LOCATIONS.find((l) => l.id === this.currentRoom!.locationId) || SPYFALL_LOCATIONS[0];
    const guessedLoc = SPYFALL_LOCATIONS.find((l) => l.id === guessedLocationId) || SPYFALL_LOCATIONS[0];
    const isCorrect = guessedLoc.id === loc.id;
    const spies = this.currentRoom.players.filter((p) => p.isSpy).map((p) => ({ id: p.id, name: p.name }));

    this.currentRoom.phase = 'DEBRIEF';
    this.currentRoom.outcome = {
      winner: isCorrect ? 'spy' : 'operatives',
      reason: isCorrect
        ? `The Spy (${spy?.name || 'Agent'}) correctly guessed the location: ${loc.name}!`
        : `The Spy (${spy?.name || 'Agent'}) guessed ${guessedLoc.name}, but the real location was ${loc.name}!`,
      secretLocation: loc,
      spies,
      guessedLocation: guessedLoc,
      wasGuessCorrect: isCorrect,
    };

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  public resetToLobby(): void {
    if (!this.currentRoom) return;
    this.currentRoom.phase = 'LOBBY';
    this.currentRoom.round += 1;
    this.currentRoom.accusation = null;
    this.currentRoom.spyGuess = null;
    this.currentRoom.outcome = null;
    this.currentRoom.locationId = undefined;
    this.currentRoom.locationName = undefined;
    this.currentRoom.players.forEach((p) => {
      p.isReady = p.isHost;
      p.isSpy = undefined;
      p.locationName = undefined;
      p.roleName = undefined;
      p.roleDuty = undefined;
      p.hasViewedBriefing = false;
    });

    this.saveLocalRoom(this.currentRoom);
    this.broadcast('ROOM_SYNC', this.currentRoom);
    this.notify();
  }

  private handleIncomingAction(type: string, payload: any): void {
    if (type === 'ROOM_SYNC') {
      this.currentRoom = payload;
      this.saveLocalRoom(payload);
      if (this.myPlayerId && payload?.players) {
        const otherPeers = payload.players
          .filter((p: SpyfallOnlinePlayer) => p.id !== this.myPlayerId)
          .map((p: SpyfallOnlinePlayer) => p.id);
        webrtcVoice.syncPeers(otherPeers);
      }
      this.notify();
    } else if (type === 'VOICE_SIGNAL') {
      const { fromPlayerId, targetPlayerId, signal } = (payload || {}) as {
        fromPlayerId?: string;
        targetPlayerId?: string;
        signal?: unknown;
      };
      if (targetPlayerId === this.myPlayerId && fromPlayerId && signal) {
        webrtcVoice.handleIncomingSignal(fromPlayerId, signal);
      }
    } else if (type === 'VOICE_STATUS') {
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
    } else if (type === 'PLAYER_JOINED') {
      if (this.currentRoom) {
        const exists = this.currentRoom.players.some((p) => p.id === payload.id);
        if (!exists) {
          this.currentRoom.players.push(payload);
          this.saveLocalRoom(this.currentRoom);
          this.notify();
        }
      }
    } else if (type === 'ROOM_CLOSED') {
      this.currentRoom = null;
      this.saveSession();
      this.notify();
    }
  }
}

export const spyMultiplayer = new SpyfallMultiplayerEngine();
