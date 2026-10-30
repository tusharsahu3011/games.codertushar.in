/**
 * Real-time Multiplayer Synchronizer for Bhabhi (Get Away)
 * Supports:
 * 1. Dedicated Authoritative WebSocket Server (ws://localhost:3001 or custom)
 * 2. BroadcastChannel + LAN SSE fallback (cross-tab & multi-device over Wi-Fi)
 * 3. Local Authoritative Engine for Solo vs AI Bots
 */

import {
  GameState,
  GameStatus,
  Player,
  BhabhiSocketEvent,
} from '../types';
import { BhabhiEngine, BOT_NAMES, BOT_AVATARS } from './engine';
import { bhabhiSounds } from './sound';
import { webrtcVoice } from '../../undercover-game/utils/webrtcVoice';

export interface BhabhiSnapshot {
  room: GameState | null;
  myPlayerId: string | null;
  isHost: boolean;
  myPlayer: Player | null;
  isConnectedWs: boolean;
}

export type BhabhiListener = (snapshot: BhabhiSnapshot) => void;

const BROADCAST_CHANNEL = 'fwd_bhabhi_multiplayer';
const LOCAL_STORAGE_PREFIX = 'fwd_bhabhi_room_';
const SESSION_KEY = 'fwd_bhabhi_session';

export class BhabhiMultiplayerEngine {
  private ws: WebSocket | null = null;
  private channel: BroadcastChannel | null = null;
  private eventSource: EventSource | null = null;
  private botTimer: NodeJS.Timeout | null = null;
  private isJoining: boolean = false;
  public currentRoom: GameState | null = null;
  public myPlayerId: string | null = null;
  public isConnectedWs: boolean = false;
  private listeners: Set<BhabhiListener> = new Set();

  constructor() {
    this.setupBroadcastChannel();
    this.restoreSavedSession();
  }

  public subscribe(listener: BhabhiListener): () => void {
    this.listeners.add(listener);
    listener(this.getSnapshot());
    return () => {
      this.listeners.delete(listener);
    };
  }

  public getSnapshot(): BhabhiSnapshot {
    let myPlayer = this.currentRoom?.players.find((p) => p.id === this.myPlayerId) || null;
    if (!myPlayer && this.currentRoom?.players && this.currentRoom.players.length > 0) {
      // Defensive fallback for solo mode or sync transitions
      const fallback = this.currentRoom.players.find((p) => !p.isBot) || this.currentRoom.players[0];
      if (fallback) {
        myPlayer = fallback;
        if (!this.myPlayerId) {
          this.myPlayerId = fallback.id;
        }
      }
    }
    const isHost = Boolean(this.currentRoom && this.myPlayerId && this.currentRoom.hostId === this.myPlayerId);

    return {
      room: this.currentRoom,
      myPlayerId: this.myPlayerId,
      isHost,
      myPlayer,
      isConnectedWs: this.isConnectedWs,
    };
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    this.listeners.forEach((listener) => listener(snapshot));
  }

  private setupBroadcastChannel(): void {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;
    try {
      this.channel = new BroadcastChannel(BROADCAST_CHANNEL);
      this.channel.onmessage = (event: MessageEvent) => {
        const { type, payload, roomCode } = event.data || {};
        if (this.currentRoom && this.currentRoom.roomCode === roomCode) {
          if (type === 'SYNC_STATE' && payload) {
            this.currentRoom = payload;
            this.saveLocalRoom(payload);
            this.notify();
          }
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }

  private broadcastLocalUpdate(state: GameState): void {
    if (this.channel && state.roomCode) {
      this.channel.postMessage({
        type: 'SYNC_STATE',
        roomCode: state.roomCode,
        payload: state,
      });
    }

    // Sync to LAN Vite server if available
    if (typeof window !== 'undefined' && state.roomCode) {
      fetch('/api/multiplayer/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: state.roomCode, ...state }),
      }).catch(() => {});
    }
  }

  private subscribeToLanEvents(code: string): void {
    if (typeof window === 'undefined' || !window.EventSource) return;
    this.disconnectLanEvents();
    try {
      this.eventSource = new EventSource(`/api/multiplayer/events?code=${encodeURIComponent(code)}`);
      this.eventSource.onmessage = (event) => {
        try {
          const room = JSON.parse(event.data) as GameState;
          if (room && room.roomCode === code) {
            const previous = this.currentRoom;
            this.currentRoom = room;
            this.saveLocalRoom(room);
            this.triggerStateTransitionSFX(previous, room);
            this.notify();
          }
        } catch (e) {}
      };
    } catch (e) {}
  }

  private disconnectLanEvents(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  private saveLocalRoom(room: GameState): void {
    if (typeof window === 'undefined') return;
    try {
      if (room.roomCode) {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${room.roomCode}`, JSON.stringify(room));
      }
    } catch (e) {}
  }

  private loadLocalRoom(code: string): GameState | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${code}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  private saveSession(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          roomCode: this.currentRoom?.roomCode,
          myPlayerId: this.myPlayerId,
        })
      );
    } catch (e) {}
  }

  private restoreSavedSession(): void {
    if (typeof window === 'undefined') return;
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        const { roomCode, myPlayerId } = JSON.parse(saved);
        if (roomCode && myPlayerId) {
          const localRoom = this.loadLocalRoom(roomCode);
          if (localRoom) {
            this.currentRoom = localRoom;
            this.myPlayerId = myPlayerId;
            this.subscribeToLanEvents(roomCode);
            this.notify();
          }
        }
      }
    } catch (e) {}
  }

  /**
   * Intelligently plays realistic SFX on state changes across multiplayer / bots
   */
  private triggerStateTransitionSFX(oldState: GameState | null, newState: GameState): void {
    if (!oldState) return;

    // 1. Dealing cards at match start
    if (oldState.status === GameStatus.LOBBY && newState.status === GameStatus.IN_PROGRESS) {
      bhabhiSounds.playDealCards();
      return;
    }

    // 2. Completed trick (Thoko penalty or clean win)
    const oldTrickTime = oldState.lastCompletedTrick?.completedAt;
    const newTrickTime = newState.lastCompletedTrick?.completedAt;
    if (newTrickTime && newTrickTime !== oldTrickTime) {
      if (newState.lastCompletedTrick?.reason === 'thoko') {
        bhabhiSounds.playThokoBoom();
      } else {
        bhabhiSounds.playTrickSweep();
      }
    } else if (newState.activeTrick.cards.length > oldState.activeTrick.cards.length) {
      // 3. Card snapped to center table
      bhabhiSounds.playCardSnap();
    }

    // 4. Game finished (final Bhabhi determined)
    if (oldState.status !== GameStatus.FINISHED && newState.status === GameStatus.FINISHED) {
      bhabhiSounds.playBhabhiGameOver();
      return;
    }

    // 5. Player got away safely (emptied hand)
    const meOld = oldState.players.find((p) => p.id === this.myPlayerId);
    const meNew = newState.players.find((p) => p.id === this.myPlayerId);
    if (meOld && !meOld.isOut && meNew && meNew.isOut && newState.status !== GameStatus.FINISHED) {
      bhabhiSounds.playGetAwayFanfare();
      return;
    }

    // 6. Turn notification: Alert local player when it is their turn
    if (
      oldState.currentTurnPlayerId !== this.myPlayerId &&
      newState.currentTurnPlayerId === this.myPlayerId &&
      newState.status === GameStatus.IN_PROGRESS &&
      meNew &&
      !meNew.isOut
    ) {
      bhabhiSounds.playYourTurn();
    }

    // 7. Chat incoming pop (from other player)
    const oldChatCount = oldState.chatMessages?.length || 0;
    const newChatCount = newState.chatMessages?.length || 0;
    if (newChatCount > oldChatCount && newState.chatMessages) {
      const lastMsg = newState.chatMessages[newChatCount - 1];
      if (lastMsg && lastMsg.senderId !== this.myPlayerId) {
        bhabhiSounds.playChatPop();
      }
    }
  }

  /**
   * Connects to WebSocket server with automatic LAN proxy fallback
   */
  public connectWebSocket(url?: string): Promise<boolean> {
    return new Promise((resolve) => {
      const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
      const wsProto = isHttps ? 'wss:' : 'ws:';
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const host = typeof window !== 'undefined' ? window.location.host : 'localhost:5173';

      // 1. Try Vite proxied endpoint /ws/bhabhi (works directly over LAN port 5173 without needing port 3001 open on firewall)
      // 2. Try direct WebSocket port 3001 on the same hostname (works on desktop / direct ports)
      // 3. Fallback to localhost:3001
      const defaultCandidates = [
        `${wsProto}//${host}/ws/bhabhi`,
        `${wsProto}//${hostname}:3001`,
        'ws://localhost:3001',
      ];

      const candidates = url ? [url] : defaultCandidates;
      let candidateIndex = 0;

      const tryNext = () => {
        if (candidateIndex >= candidates.length) {
          this.isConnectedWs = false;
          resolve(false);
          return;
        }

        const targetUrl = candidates[candidateIndex++];
        try {
          const socket = new WebSocket(targetUrl);
          const timeout = setTimeout(() => {
            if (!this.isConnectedWs) {
              try { socket.close(); } catch (e) {}
              tryNext();
            }
          }, 1400);

          socket.onopen = () => {
            clearTimeout(timeout);
            this.ws = socket;
            this.isConnectedWs = true;
            this.notify();
            resolve(true);
          };

          socket.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              if (data.type === 'GAME_STATE' && data.payload) {
                const previous = this.currentRoom;
                this.currentRoom = data.payload;
                this.saveLocalRoom(data.payload);
                this.triggerStateTransitionSFX(previous, data.payload);

                // Synchronize peers for WebRTC voice communication
                if (this.myPlayerId && data.payload.players) {
                  const humanPeerIds = data.payload.players
                    .filter((p: Player) => !p.isBot && p.id !== this.myPlayerId)
                    .map((p: Player) => p.id);
                  webrtcVoice.syncPeers(humanPeerIds);
                }

                this.notify();
              } else if (data.type === 'ROOM_CREATED' || data.type === 'ROOM_JOINED') {
                this.myPlayerId = data.payload.myPlayerId;
                this.saveSession();

                // Attach WebRTC signaling via active WebSocket
                webrtcVoice.setSignaling(
                  data.payload.myPlayerId,
                  (targetPlayerId, signal) => {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                      this.ws.send(
                        JSON.stringify({
                          type: 'VOICE_SIGNAL',
                          payload: { targetPlayerId, signal },
                        })
                      );
                    }
                  },
                  (status) => {
                    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                      this.ws.send(
                        JSON.stringify({
                          type: 'VOICE_STATUS',
                          payload: status,
                        })
                      );
                    }
                  }
                );

                this.notify();
              } else if (data.type === 'VOICE_SIGNAL' && data.payload) {
                webrtcVoice.handleIncomingSignal(data.payload.fromPlayerId, data.payload.signal);
              } else if (data.type === 'VOICE_STATUS' && data.payload) {
                webrtcVoice.updatePeerState(data.payload.playerId, {
                  isMuted: data.payload.isMuted,
                  isSpeaking: data.payload.isSpeaking,
                  volume: data.payload.volume,
                });
              }
            } catch (e) {}
          };

          socket.onclose = () => {
            this.isConnectedWs = false;
            this.ws = null;
            this.notify();
          };

          socket.onerror = () => {
            clearTimeout(timeout);
            if (!this.isConnectedWs) {
              tryNext();
            }
          };
        } catch (e) {
          tryNext();
        }
      };

      tryNext();
    });
  }

  /**
   * Broadcasts text chat message to room players
   */
  public sendChat(text: string): void {
    const trimmed = (text || '').trim();
    if (!trimmed || !this.currentRoom || !this.myPlayerId) return;

    if (this.isConnectedWs && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'SEND_CHAT',
          payload: { text: trimmed },
        })
      );
    } else {
      const sender = this.currentRoom.players.find((p) => p.id === this.myPlayerId);
      const chatMsg = {
        id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        senderId: this.myPlayerId,
        senderName: sender?.name || 'Player',
        text: trimmed.substring(0, 160),
        timestamp: Date.now(),
      };
      if (!this.currentRoom.chatMessages) {
        this.currentRoom.chatMessages = [];
      }
      this.currentRoom.chatMessages.push(chatMsg);
      this.broadcastLocalUpdate(this.currentRoom);
      this.notify();
    }
  }

  /**
   * Launch instant Solo vs AI Bots match with 100% deterministic local state
   */
  public startSolo(playerName?: string, avatar?: string): void {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    // Clean up any pending WS or LAN sessions for isolated, instant local game
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.isConnectedWs = false;
    this.disconnectLanEvents();

    const code = 'SOLO_' + Math.random().toString(36).substring(2, 6).toUpperCase();
    const hostId = `player_local_${Date.now()}`;
    const initial = BhabhiEngine.createInitialState(code, hostId, code);

    // Human player (Seat 0)
    const displayName = (playerName || '').trim() || 'You';
    const playerAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostId}`;
    initial.players.push({
      id: hostId,
      name: displayName,
      avatar: playerAvatar,
      hand: [],
      isOut: false,
      isBot: false,
      seatIndex: 0,
      connected: true,
    });

    // 3 AI Bots (Seats 1, 2, 3)
    for (let i = 0; i < 3; i++) {
      const botId = `bot_solo_${i + 1}`;
      initial.players.push({
        id: botId,
        name: BOT_NAMES[i % BOT_NAMES.length],
        avatar: BOT_AVATARS[i % BOT_AVATARS.length],
        hand: [],
        isOut: false,
        isBot: true,
        seatIndex: i + 1,
        connected: true,
      });
    }

    // Authoritative start game & card deal (52 cards dealt to 4 players)
    const started = BhabhiEngine.startGame(initial);
    if (!started.success) {
      throw new Error(started.error || 'Failed to initialize cards deal');
    }

    this.currentRoom = started.state;
    this.myPlayerId = hostId;
    this.saveLocalRoom(started.state);
    this.saveSession();
    this.notify();
    bhabhiSounds.playDealCards();

    // Trigger AI bot move if bot holds Ace of Spades
    this.triggerBotTurnIfNeeded();
  }

  /**
   * Create a new room
   */
  public async createRoom(hostName: string, avatar?: string): Promise<string> {
    const isWs = await this.connectWebSocket();

    if (isWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'CREATE_ROOM',
          payload: { hostName, avatar },
        })
      );
      // Wait briefly for server response
      return new Promise((resolve) => {
        const check = () => {
          if (this.currentRoom?.roomCode) {
            resolve(this.currentRoom.roomCode);
          } else {
            setTimeout(check, 50);
          }
        };
        setTimeout(check, 50);
      });
    }

    // Fallback: Local authoritative engine
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const hostId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const initialState = BhabhiEngine.createInitialState(code, hostId, code);

    initialState.players.push({
      id: hostId,
      name: hostName || 'Operative',
      avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostId}`,
      hand: [],
      isOut: false,
      seatIndex: 0,
      connected: true,
    });

    this.currentRoom = initialState;
    this.myPlayerId = hostId;
    this.saveLocalRoom(initialState);
    this.saveSession();
    this.subscribeToLanEvents(code);
    this.broadcastLocalUpdate(initialState);
    this.notify();

    return code;
  }

  /**
   * Join an existing room
   */
  public async joinRoom(roomCode: string, playerName: string, avatar?: string): Promise<boolean> {
    const cleanCode = roomCode.toUpperCase().trim();
    if (this.isJoining) {
      return true;
    }
    this.isJoining = true;

    try {
      if (!this.myPlayerId) {
        this.myPlayerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      }

      const isWs = await this.connectWebSocket();

      if (isWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({
            type: 'JOIN_ROOM',
            payload: {
              roomCode: cleanCode,
              playerName,
              avatar,
              playerId: this.myPlayerId,
            },
          })
        );
        return true;
      }

      // Fallback: Local / LAN storage fetch
      let room = this.loadLocalRoom(cleanCode);
      if (!room) {
        try {
          const res = await fetch(`/api/multiplayer/room?code=${encodeURIComponent(cleanCode)}`);
          const json = await res.json();
          if (json.room || json.code) {
            room = json.room || json;
          }
        } catch (e) {}
      }

      if (!room) {
        throw new Error(`Room ${cleanCode} not found.`);
      }

      if (room.status !== GameStatus.LOBBY) {
        throw new Error('Game already started.');
      }

      // Check if player is already in room by myPlayerId or by name
      const existingPlayer = room.players.find(
        (p) => (this.myPlayerId && p.id === this.myPlayerId) ||
               (playerName && p.name.trim().toLowerCase() === playerName.trim().toLowerCase() && !p.isBot)
      );

      if (existingPlayer) {
        existingPlayer.connected = true;
        if (playerName) existingPlayer.name = playerName;
        if (avatar) existingPlayer.avatar = avatar;
        this.myPlayerId = existingPlayer.id;
      } else {
        if (room.players.length >= 6) {
          throw new Error('Room is full (maximum 6 players).');
        }

        const newPlayerId = this.myPlayerId;
        room.players.push({
          id: newPlayerId,
          name: playerName || `Player ${room.players.length + 1}`,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${newPlayerId}`,
          hand: [],
          isOut: false,
          seatIndex: room.players.length,
          connected: true,
        });
      }

      // Defensive deduplication by ID & seat re-indexing
      const seenIds = new Set<string>();
      room.players = room.players.filter((p) => {
        if (!p || !p.id || seenIds.has(p.id)) return false;
        seenIds.add(p.id);
        return true;
      });
      room.players.forEach((p, idx) => {
        p.seatIndex = idx;
      });

      this.currentRoom = room;
      this.saveLocalRoom(room);
      this.saveSession();
      this.subscribeToLanEvents(cleanCode);
      this.broadcastLocalUpdate(room);
      this.notify();

      return true;
    } finally {
      this.isJoining = false;
    }
  }

  /**
   * Add AI bot to lobby
   */
  public addBot(): void {
    if (this.isConnectedWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ADD_BOT', payload: {} }));
      return;
    }

    if (!this.currentRoom || this.currentRoom.players.length >= 6) return;
    const botIdx = this.currentRoom.players.length;
    const botId = `bot_${Date.now()}_${botIdx}`;

    this.currentRoom.players.push({
      id: botId,
      name: BOT_NAMES[botIdx % BOT_NAMES.length],
      avatar: BOT_AVATARS[botIdx % BOT_AVATARS.length],
      hand: [],
      isOut: false,
      isBot: true,
      seatIndex: botIdx,
      connected: true,
    });

    this.saveLocalRoom(this.currentRoom);
    this.broadcastLocalUpdate(this.currentRoom);
    this.notify();
    bhabhiSounds.playTap();
  }

  /**
   * Remove AI bot from lobby
   */
  public removeBot(botId: string): void {
    if (this.isConnectedWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'REMOVE_BOT', payload: { botId } }));
      return;
    }

    if (!this.currentRoom) return;
    const idx = this.currentRoom.players.findIndex((p) => p.id === botId && p.isBot);
    if (idx !== -1) {
      this.currentRoom.players.splice(idx, 1);
      this.currentRoom.players.forEach((p, i) => (p.seatIndex = i));
      this.saveLocalRoom(this.currentRoom);
      this.broadcastLocalUpdate(this.currentRoom);
      this.notify();
      bhabhiSounds.playTap();
    }
  }

  /**
   * Start Game
   */
  public startGame(): void {
    if (this.isConnectedWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'START_GAME', payload: {} }));
      return;
    }

    if (!this.currentRoom) return;
    const result = BhabhiEngine.startGame(this.currentRoom);
    if (!result.success) {
      throw new Error(result.error);
    }

    this.currentRoom = result.state;
    this.saveLocalRoom(result.state);
    this.broadcastLocalUpdate(result.state);
    this.notify();
    bhabhiSounds.playDealCards();

    // Check if initial turn is a bot
    this.triggerBotTurnIfNeeded();
  }

  /**
   * Play Card
   */
  public playCard(cardId: string): void {
    if (this.isConnectedWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'PLAY_CARD', payload: { cardId } }));
      return;
    }

    if (!this.currentRoom || !this.myPlayerId) return;

    const result = BhabhiEngine.playCard(this.currentRoom, this.myPlayerId, cardId);
    if (!result.success) {
      throw new Error(result.error);
    }

    this.currentRoom = result.state;
    this.saveLocalRoom(result.state);
    this.broadcastLocalUpdate(result.state);
    this.notify();

    // Sound feedback based on move outcome
    if (result.eventType === 'thoko') {
      bhabhiSounds.playThokoBoom();
    } else if (result.eventType === 'trick_win') {
      bhabhiSounds.playTrickSweep();
    } else {
      bhabhiSounds.playCardSnap();
    }

    if (result.state.status === GameStatus.FINISHED) {
      bhabhiSounds.playBhabhiGameOver();
    } else if (result.state.players.find((p) => p.id === this.myPlayerId)?.isOut) {
      bhabhiSounds.playGetAwayFanfare();
    }

    // Trigger next turn if bot
    this.triggerBotTurnIfNeeded();
  }

  /**
   * Restarts the room after game completion
   */
  public restartGame(): void {
    if (this.isConnectedWs && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'RESTART_GAME', payload: {} }));
      return;
    }

    if (!this.currentRoom) return;
    const reset = BhabhiEngine.createInitialState(
      this.currentRoom.gameId,
      this.currentRoom.hostId,
      this.currentRoom.roomCode
    );
    reset.players = this.currentRoom.players.map((p, idx) => ({
      ...p,
      hand: [],
      isOut: false,
      seatIndex: idx,
      exitRank: undefined,
    }));

    this.currentRoom = reset;
    this.saveLocalRoom(reset);
    this.broadcastLocalUpdate(reset);
    this.notify();
    bhabhiSounds.playTap();
  }

  /**
   * Leave current room
   */
  public leaveRoom(): void {
    webrtcVoice.stop();
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }
    this.disconnectLanEvents();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.currentRoom = null;
    this.myPlayerId = null;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_KEY);
    }
    this.notify();
  }

  /**
   * Handles local AI bot turns if the host is running them
   */
  private triggerBotTurnIfNeeded(): void {
    if (this.botTimer) {
      clearTimeout(this.botTimer);
      this.botTimer = null;
    }

    if (!this.currentRoom || this.currentRoom.status !== GameStatus.IN_PROGRESS) return;

    // Only host drives bot turns to prevent duplicate bot actions
    const isHost = this.currentRoom.hostId === this.myPlayerId;
    if (!isHost) return;

    const currentTurnPlayer = this.currentRoom.players.find(
      (p) => p.id === this.currentRoom?.currentTurnPlayerId
    );

    if (currentTurnPlayer && currentTurnPlayer.isBot && !currentTurnPlayer.isOut) {
      // Human-like thinking delay
      const thinkDelay = 750 + Math.random() * 450;
      this.botTimer = setTimeout(() => {
        if (!this.currentRoom || this.currentRoom.status !== GameStatus.IN_PROGRESS) return;

        const botCard = BhabhiEngine.getBotMove(this.currentRoom, currentTurnPlayer.id);
        if (botCard) {
          const result = BhabhiEngine.playCard(this.currentRoom, currentTurnPlayer.id, botCard.id);
          if (result.success) {
            this.currentRoom = result.state;
            this.saveLocalRoom(result.state);
            this.broadcastLocalUpdate(result.state);
            this.notify();

            if (result.eventType === 'thoko') {
              bhabhiSounds.playThokoBoom();
            } else if (result.eventType === 'trick_win') {
              bhabhiSounds.playTrickSweep();
            } else {
              bhabhiSounds.playCardSnap();
            }

            if (result.state.status === GameStatus.FINISHED) {
              bhabhiSounds.playBhabhiGameOver();
            } else if (result.state.currentTurnPlayerId === this.myPlayerId && result.state.status === GameStatus.IN_PROGRESS) {
              bhabhiSounds.playYourTurn();
            }

            // Continue bot turns if next player is also a bot
            this.triggerBotTurnIfNeeded();
          }
        }
      }, thinkDelay);
    }
  }
}

export const bhabhiMultiplayer = new BhabhiMultiplayerEngine();
