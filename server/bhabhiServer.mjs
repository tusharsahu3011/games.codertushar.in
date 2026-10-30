/**
 * Authoritative WebSocket Server for Bhabhi (Get Away) Card Game
 * Self-contained ES Module runnable directly with `node server/bhabhiServer.mjs`
 */

import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';

const SUITS = ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'];
const RANKS = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

const SUIT_SYMBOLS = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

const BOT_NAMES = ['Kabir ⚡', 'Simran 🌸', 'Arjun 🎯', 'Priya ✨', 'Rohan 🃏', 'Ananya 💎'];
const BOT_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Kabir',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Simran',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Arjun',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya',
];

function getRankLabel(rank) {
  switch (rank) {
    case 14: return 'A';
    case 13: return 'K';
    case 12: return 'Q';
    case 11: return 'J';
    default: return String(rank);
  }
}

function formatCard(card) {
  return `${getRankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]}`;
}

function sortHand(hand) {
  const suitOrder = { SPADES: 0, HEARTS: 1, CLUBS: 2, DIAMONDS: 3 };
  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.rank - a.rank;
  });
}

class BhabhiEngine {
  static createDeck() {
    const deck = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({ id: `${suit}_${rank}`, suit, rank });
      }
    }
    return deck;
  }

  static shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  static createInitialState(gameId, hostId, roomCode) {
    return {
      gameId,
      roomCode: roomCode || gameId.slice(0, 6).toUpperCase(),
      status: 'LOBBY',
      players: [],
      activeTrick: { leadSuit: null, cards: [], leadPlayerId: '' },
      discardPile: [],
      currentTurnPlayerId: '',
      firstRound: true,
      loserId: null,
      logs: [
        {
          id: `log_${Date.now()}`,
          text: 'Game lobby created. Waiting for players to join (3-6 players).',
          timestamp: Date.now(),
          type: 'info',
        },
      ],
      hostId,
      createdAt: Date.now(),
      winnerOrder: [],
      chatMessages: [],
      lastCompletedTrick: undefined,
    };
  }

  static startGame(state) {
    if (state.players.length < 3 || state.players.length > 6) {
      return { success: false, error: 'Bhabhi requires 3 to 6 players to start.', state };
    }

    const deck = this.shuffleDeck(this.createDeck());
    const players = state.players.map((p, idx) => ({
      ...p,
      hand: [],
      isOut: false,
      seatIndex: idx,
      exitRank: undefined,
    }));

    let cardIdx = 0;
    while (cardIdx < deck.length) {
      const pIdx = cardIdx % players.length;
      players[pIdx].hand.push(deck[cardIdx]);
      cardIdx++;
    }

    players.forEach((p) => {
      p.hand = sortHand(p.hand);
      p.handCount = p.hand.length;
    });

    let starterPlayerId = players[0].id;
    for (const p of players) {
      if (p.hand.some((c) => c.suit === 'SPADES' && c.rank === 14)) {
        starterPlayerId = p.id;
        break;
      }
    }

    const starter = players.find((p) => p.id === starterPlayerId);

    const newState = {
      ...state,
      status: 'IN_PROGRESS',
      players,
      activeTrick: { leadSuit: null, cards: [], leadPlayerId: '' },
      discardPile: [],
      currentTurnPlayerId: starterPlayerId,
      firstRound: true,
      loserId: null,
      winnerOrder: [],
      logs: [
        {
          id: `log_${Date.now()}_start`,
          text: `Game started! 52 cards dealt among ${players.length} players.`,
          timestamp: Date.now(),
          type: 'info',
        },
        {
          id: `log_${Date.now()}_lead`,
          text: `👑 ${starter?.name} holds the Ace of Spades (A♠) and must make the opening lead!`,
          timestamp: Date.now() + 1,
          type: 'lead',
        },
      ],
      lastAction: `${starter?.name} holds Ace of Spades and leads first!`,
    };

    return { success: true, state: newState };
  }

  static validateMove(gameState, playerId, card) {
    if (gameState.currentTurnPlayerId !== playerId) {
      return { valid: false, reason: 'Not your turn.' };
    }
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player || !player.hand.some((c) => c.id === card.id)) {
      return { valid: false, reason: 'Card not in hand.' };
    }
    if (gameState.firstRound && gameState.activeTrick.cards.length === 0) {
      if (card.suit !== 'SPADES' || card.rank !== 14) {
        return { valid: false, reason: 'Must start first move with Ace of Spades (A♠).' };
      }
    }
    if (gameState.activeTrick.leadSuit !== null) {
      const hasLeadSuit = player.hand.some((c) => c.suit === gameState.activeTrick.leadSuit);
      if (hasLeadSuit && card.suit !== gameState.activeTrick.leadSuit) {
        return {
          valid: false,
          reason: `Must follow suit (${gameState.activeTrick.leadSuit}) if you hold a card of the lead suit.`,
        };
      }
    }
    return { valid: true };
  }

  static playCard(currentState, playerId, cardId) {
    if (currentState.status !== 'IN_PROGRESS') {
      return { success: false, error: 'Game is not currently in progress.', state: currentState };
    }
    const player = currentState.players.find((p) => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not found in game.', state: currentState };
    }
    const card = player.hand.find((c) => c.id === cardId);
    if (!card) {
      return { success: false, error: 'Card not found in player hand.', state: currentState };
    }

    const validation = this.validateMove(currentState, playerId, card);
    if (!validation.valid) {
      return { success: false, error: validation.reason, state: currentState };
    }

    const state = JSON.parse(JSON.stringify(currentState));
    const activePlayer = state.players.find((p) => p.id === playerId);

    activePlayer.hand = activePlayer.hand.filter((c) => c.id !== cardId);
    activePlayer.handCount = activePlayer.hand.length;

    state.activeTrick.cards.push({
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      card,
      playedAt: Date.now(),
    });

    const cardName = formatCard(card);

    if (state.activeTrick.cards.length === 1) {
      state.activeTrick.leadSuit = card.suit;
      state.activeTrick.leadPlayerId = activePlayer.id;
      state.logs.push({
        id: `log_${Date.now()}_lead`,
        text: `🃏 ${activePlayer.name} led with ${cardName} (${card.suit})`,
        timestamp: Date.now(),
        type: 'lead',
      });
      state.lastAction = `${activePlayer.name} led with ${cardName}`;
    } else {
      state.logs.push({
        id: `log_${Date.now()}_play`,
        text: `${activePlayer.name} played ${cardName}`,
        timestamp: Date.now(),
        type: 'info',
      });
      state.lastAction = `${activePlayer.name} played ${cardName}`;
    }

    // Check for Thoko (trick break)
    if (card.suit !== state.activeTrick.leadSuit) {
      let highestLeadCardRank = -1;
      let recipientPlayerId = state.activeTrick.leadPlayerId;

      for (const played of state.activeTrick.cards) {
        if (played.card.suit === state.activeTrick.leadSuit && played.card.rank > highestLeadCardRank) {
          highestLeadCardRank = played.card.rank;
          recipientPlayerId = played.playerId;
        }
      }

      const recipient = state.players.find((p) => p.id === recipientPlayerId);
      const cardsToTransfer = state.activeTrick.cards.map((pc) => pc.card);

      recipient.hand.push(...cardsToTransfer);
      recipient.hand = sortHand(recipient.hand);
      recipient.handCount = recipient.hand.length;

      state.logs.push({
        id: `log_${Date.now()}_thoko`,
        text: `💥 THOKO! ${activePlayer.name} played off-suit ${cardName}! ${recipient.name} had highest lead card and picks up all ${cardsToTransfer.length} cards!`,
        timestamp: Date.now() + 1,
        type: 'thoko',
      });
      state.lastAction = `💥 THOKO! ${recipient.name} picked up ${cardsToTransfer.length} cards!`;

      // Keep trick cards visible for ~2 seconds
      state.lastCompletedTrick = {
        cards: [...state.activeTrick.cards],
        leadSuit: state.activeTrick.leadSuit,
        winnerPlayerId: recipient.id,
        winnerName: recipient.name,
        penaltyPlayerId: recipient.id,
        penaltyPlayerName: recipient.name,
        completedAt: Date.now(),
        reason: 'thoko',
      };

      state.activeTrick = { leadSuit: null, cards: [], leadPlayerId: '' };
      state.currentTurnPlayerId = recipient.id;
      state.firstRound = false;

      this.checkPlayerExitsAndLoss(state);
      return { success: true, state, eventType: 'thoko' };
    }

    // Check for Trick Completion (No Break)
    const activePlayersCount = state.players.filter((p) => !p.isOut).length;
    if (state.activeTrick.cards.length === activePlayersCount) {
      let highestRank = -1;
      let trickWinnerPlayerId = state.activeTrick.cards[0].playerId;

      for (const played of state.activeTrick.cards) {
        if (played.card.suit === state.activeTrick.leadSuit && played.card.rank > highestRank) {
          highestRank = played.card.rank;
          trickWinnerPlayerId = played.playerId;
        }
      }

      const winner = state.players.find((p) => p.id === trickWinnerPlayerId);
      const discardedCards = state.activeTrick.cards.map((pc) => pc.card);
      state.discardPile.push(...discardedCards);

      state.logs.push({
        id: `log_${Date.now()}_win`,
        text: `✨ ${winner.name} won the trick with ${getRankLabel(highestRank)}${SUIT_SYMBOLS[state.activeTrick.leadSuit]}! Discarded ${discardedCards.length} cards.`,
        timestamp: Date.now() + 1,
        type: 'win',
      });
      state.lastAction = `${winner.name} won the trick!`;

      // Keep trick cards visible for ~2 seconds
      state.lastCompletedTrick = {
        cards: [...state.activeTrick.cards],
        leadSuit: state.activeTrick.leadSuit,
        winnerPlayerId: winner.id,
        winnerName: winner.name,
        completedAt: Date.now(),
        reason: 'win',
      };

      state.activeTrick = { leadSuit: null, cards: [], leadPlayerId: '' };
      state.currentTurnPlayerId = winner.id;
      state.firstRound = false;

      this.checkPlayerExitsAndLoss(state);
      return { success: true, state, eventType: 'trick_win' };
    }

    // Advance Turn (Incomplete Trick)
    state.currentTurnPlayerId = this.getNextActivePlayerId(state, playerId);
    this.checkPlayerExitsAndLoss(state);

    return { success: true, state, eventType: 'normal' };
  }

  static getNextActivePlayerId(state, currentId) {
    const currentIndex = state.players.findIndex((p) => p.id === currentId);
    if (currentIndex === -1) return currentId;
    const total = state.players.length;
    for (let i = 1; i <= total; i++) {
      const nextIndex = (currentIndex + i) % total;
      const candidate = state.players[nextIndex];
      if (!candidate.isOut) return candidate.id;
    }
    return currentId;
  }

  static checkPlayerExitsAndLoss(state) {
    for (const player of state.players) {
      if (!player.isOut && player.hand.length === 0) {
        player.isOut = true;
        if (!state.winnerOrder.includes(player.id)) {
          state.winnerOrder.push(player.id);
          player.exitRank = state.winnerOrder.length;
          state.logs.push({
            id: `log_${Date.now()}_exit_${player.id}`,
            text: `🎉 ${player.name} has GOT AWAY! Hand is empty! (Rank #${player.exitRank})`,
            timestamp: Date.now() + 2,
            type: 'exit',
          });
        }
      }
    }

    const turnPlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
    if (turnPlayer && turnPlayer.isOut) {
      state.currentTurnPlayerId = this.getNextActivePlayerId(state, turnPlayer.id);
    }

    const activePlayers = state.players.filter((p) => !p.isOut);
    if (activePlayers.length === 1) {
      const loser = activePlayers[0];
      state.status = 'FINISHED';
      state.loserId = loser.id;
      state.logs.push({
        id: `log_${Date.now()}_bhabhi`,
        text: `👑 BHABHI: ${loser.name} is the remaining player with cards and is declared the BHABHI!`,
        timestamp: Date.now() + 3,
        type: 'bhabhi',
      });
      state.lastAction = `👑 ${loser.name} is the BHABHI!`;
    } else if (activePlayers.length === 0) {
      state.status = 'FINISHED';
      state.loserId = null;
    }
  }

  static getBotMove(state, botId) {
    const bot = state.players.find((p) => p.id === botId);
    if (!bot || bot.hand.length === 0) return null;

    if (state.firstRound && state.activeTrick.cards.length === 0) {
      const ace = bot.hand.find((c) => c.suit === 'SPADES' && c.rank === 14);
      if (ace) return ace;
    }

    if (state.activeTrick.leadSuit === null) {
      const sortedByRankAsc = [...bot.hand].sort((a, b) => a.rank - b.rank);
      return sortedByRankAsc[0];
    }

    const leadSuit = state.activeTrick.leadSuit;
    const cardsOfLeadSuit = bot.hand.filter((c) => c.suit === leadSuit);

    if (cardsOfLeadSuit.length > 0) {
      const leadCardsInTrick = state.activeTrick.cards.filter((pc) => pc.card.suit === leadSuit);
      const maxTrickRank = Math.max(...leadCardsInTrick.map((pc) => pc.card.rank), 0);
      const higherCards = cardsOfLeadSuit.filter((c) => c.rank > maxTrickRank);
      if (higherCards.length > 0) {
        return higherCards.sort((a, b) => a.rank - b.rank)[0];
      }
      return cardsOfLeadSuit.sort((a, b) => a.rank - b.rank)[0];
    } else {
      const sortedByRankDesc = [...bot.hand].sort((a, b) => b.rank - a.rank);
      return sortedByRankDesc[0];
    }
  }

  static getMaskedState(gameState, forPlayerId) {
    return {
      ...gameState,
      players: gameState.players.map((p) => {
        if (p.id === forPlayerId) {
          return { ...p, handCount: p.hand.length };
        }
        return { ...p, hand: [], handCount: p.hand.length };
      }),
    };
  }
}

const PORT = Number(process.env.BHABHI_PORT) || 3001;
const httpServer = createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Bhabhi WebSocket Server Active', port: PORT }));
});

const wss = new WebSocketServer({ server: httpServer });
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function broadcastRoomState(room) {
  for (const [playerId, client] of room.clients.entries()) {
    if (client.socket.readyState === WebSocket.OPEN) {
      const maskedState = BhabhiEngine.getMaskedState(room.state, playerId);
      client.socket.send(JSON.stringify({ type: 'GAME_STATE', payload: maskedState }));
    }
  }
  scheduleBotTurn(room);
}

function scheduleBotTurn(room) {
  if (room.state.status !== 'IN_PROGRESS') return;
  if (room.botTimer) {
    clearTimeout(room.botTimer);
    room.botTimer = undefined;
  }

  const currentTurnPlayer = room.state.players.find((p) => p.id === room.state.currentTurnPlayerId);
  if (!currentTurnPlayer || !currentTurnPlayer.isBot || currentTurnPlayer.isOut) return;

  // If a trick completed recently, pause bot so human players can clearly inspect what was played
  const elapsed = Date.now() - (room.state.lastCompletedTrick?.completedAt || 0);
  const remainingWait = elapsed < 2200 ? 2200 - elapsed : 0;

  room.botTimer = setTimeout(() => {
    const moveCard = BhabhiEngine.getBotMove(room.state, currentTurnPlayer.id);
    if (moveCard) {
      const result = BhabhiEngine.playCard(room.state, currentTurnPlayer.id, moveCard.id);
      if (result.success) {
        room.state = result.state;
        broadcastRoomState(room);
      }
    }
  }, 900 + remainingWait);
}

wss.on('connection', (socket) => {
  let boundConnection = null;

  socket.on('message', (data) => {
    try {
      const event = JSON.parse(data.toString());

      switch (event.type) {
        case 'CREATE_ROOM': {
          const { hostName, avatar } = event.payload;
          const roomCode = generateRoomCode();
          const hostPlayerId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

          const initialState = BhabhiEngine.createInitialState(roomCode, hostPlayerId, roomCode);
          initialState.players.push({
            id: hostPlayerId,
            name: hostName || 'Host Operative',
            avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${hostPlayerId}`,
            hand: [],
            isOut: false,
            seatIndex: 0,
            connected: true,
          });

          const room = { state: initialState, clients: new Map() };
          boundConnection = { socket, playerId: hostPlayerId, playerName: hostName || 'Host', roomCode };
          room.clients.set(hostPlayerId, boundConnection);
          rooms.set(roomCode, room);

          socket.send(JSON.stringify({ type: 'ROOM_CREATED', payload: { roomCode, myPlayerId: hostPlayerId } }));
          broadcastRoomState(room);
          break;
        }

        case 'JOIN_ROOM': {
          const { roomCode, playerName, avatar, playerId } = event.payload || {};
          const cleanCode = (roomCode || '').toUpperCase().trim();
          const room = rooms.get(cleanCode);

          if (!room) {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: `Room ${cleanCode} not found.` } }));
            return;
          }
          if (room.state.status !== 'LOBBY') {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Game in progress.' } }));
            return;
          }

          const trimmedName = (playerName || '').trim();

          // 1. Check if this socket is ALREADY bound to a player in this room
          let existingPlayer = null;
          if (boundConnection && boundConnection.roomCode === cleanCode) {
            existingPlayer = room.state.players.find((p) => p.id === boundConnection.playerId);
          }

          // 2. Check if the client provided playerId already exists in this room
          if (!existingPlayer && playerId) {
            existingPlayer = room.state.players.find((p) => p.id === playerId);
          }

          // 3. Check if an existing human player with the same name already exists in lobby
          if (!existingPlayer && trimmedName) {
            existingPlayer = room.state.players.find(
              (p) => !p.isBot && p.name.trim().toLowerCase() === trimmedName.toLowerCase()
            );
          }

          if (existingPlayer) {
            // Reconnect / synchronize existing player — never create a duplicate!
            existingPlayer.connected = true;
            if (trimmedName) existingPlayer.name = trimmedName;
            if (avatar) existingPlayer.avatar = avatar;

            boundConnection = { socket, playerId: existingPlayer.id, playerName: existingPlayer.name, roomCode: cleanCode };
            room.clients.set(existingPlayer.id, boundConnection);

            socket.send(JSON.stringify({ type: 'ROOM_JOINED', payload: { roomCode: cleanCode, myPlayerId: existingPlayer.id } }));
            broadcastRoomState(room);
            break;
          }

          if (room.state.players.length >= 6) {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: 'Room is full (max 6 players).' } }));
            return;
          }

          const targetPlayerId = playerId || `p_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const newPlayer = {
            id: targetPlayerId,
            name: trimmedName || `Player ${room.state.players.length + 1}`,
            avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${targetPlayerId}`,
            hand: [],
            isOut: false,
            seatIndex: room.state.players.length,
            connected: true,
          };

          room.state.players.push(newPlayer);

          // Deduplicate room players defensively by ID
          const seenIds = new Set();
          room.state.players = room.state.players.filter((p) => {
            if (!p || !p.id || seenIds.has(p.id)) return false;
            seenIds.add(p.id);
            return true;
          });
          room.state.players.forEach((p, idx) => {
            p.seatIndex = idx;
          });

          boundConnection = { socket, playerId: targetPlayerId, playerName: newPlayer.name, roomCode: cleanCode };
          room.clients.set(targetPlayerId, boundConnection);

          socket.send(JSON.stringify({ type: 'ROOM_JOINED', payload: { roomCode: cleanCode, myPlayerId: targetPlayerId } }));
          broadcastRoomState(room);
          break;
        }

        case 'ADD_BOT': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room || room.state.status !== 'LOBBY' || room.state.players.length >= 6) return;

          const botIdx = room.state.players.length;
          const botId = `bot_${Date.now()}_${botIdx}`;
          room.state.players.push({
            id: botId,
            name: BOT_NAMES[botIdx % BOT_NAMES.length],
            avatar: BOT_AVATARS[botIdx % BOT_AVATARS.length],
            hand: [],
            isOut: false,
            isBot: true,
            seatIndex: botIdx,
            connected: true,
          });
          broadcastRoomState(room);
          break;
        }

        case 'REMOVE_BOT': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room || room.state.status !== 'LOBBY') return;
          const idx = room.state.players.findIndex((p) => p.id === event.payload.botId && p.isBot);
          if (idx !== -1) {
            room.state.players.splice(idx, 1);
            room.state.players.forEach((p, i) => (p.seatIndex = i));
            broadcastRoomState(room);
          }
          break;
        }

        case 'START_GAME': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room || boundConnection.playerId !== room.state.hostId) return;

          const startResult = BhabhiEngine.startGame(room.state);
          if (!startResult.success) {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: startResult.error } }));
            return;
          }
          room.state = startResult.state;
          broadcastRoomState(room);
          break;
        }

        case 'PLAY_CARD': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room) return;

          const { cardId } = event.payload;
          const result = BhabhiEngine.playCard(room.state, boundConnection.playerId, cardId);
          if (!result.success) {
            socket.send(JSON.stringify({ type: 'ERROR', payload: { message: result.error } }));
            return;
          }
          room.state = result.state;
          broadcastRoomState(room);
          break;
        }

        case 'SEND_CHAT': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room) return;

          const text = (event.payload?.text || '').trim();
          if (!text) return;

          const chatMsg = {
            id: `chat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            senderId: boundConnection.playerId,
            senderName: boundConnection.playerName,
            text: text.substring(0, 160),
            timestamp: Date.now(),
          };

          if (!room.state.chatMessages) {
            room.state.chatMessages = [];
          }
          room.state.chatMessages.push(chatMsg);
          if (room.state.chatMessages.length > 80) {
            room.state.chatMessages.shift();
          }
          broadcastRoomState(room);
          break;
        }

        case 'VOICE_SIGNAL': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room) return;
          const { targetPlayerId, signal } = event.payload || {};
          if (!targetPlayerId || !signal) return;
          const targetClient = room.clients.get(targetPlayerId);
          if (targetClient && targetClient.socket.readyState === WebSocket.OPEN) {
            targetClient.socket.send(
              JSON.stringify({
                type: 'VOICE_SIGNAL',
                payload: {
                  fromPlayerId: boundConnection.playerId,
                  fromPlayerName: boundConnection.playerName,
                  signal,
                },
              })
            );
          }
          break;
        }

        case 'VOICE_STATUS': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room) return;
          const { isMuted, isSpeaking, volume } = event.payload || {};
          for (const [pid, client] of room.clients.entries()) {
            if (pid !== boundConnection.playerId && client.socket.readyState === WebSocket.OPEN) {
              client.socket.send(
                JSON.stringify({
                  type: 'VOICE_STATUS',
                  payload: {
                    playerId: boundConnection.playerId,
                    isMuted: Boolean(isMuted),
                    isSpeaking: Boolean(isSpeaking),
                    volume: Number(volume || 0),
                  },
                })
              );
            }
          }
          break;
        }

        case 'RESTART_GAME': {
          if (!boundConnection) return;
          const room = rooms.get(boundConnection.roomCode);
          if (!room || boundConnection.playerId !== room.state.hostId) return;

          const resetState = BhabhiEngine.createInitialState(room.state.gameId, room.state.hostId, room.state.roomCode);
          resetState.players = room.state.players.map((p, idx) => ({
            ...p,
            hand: [],
            isOut: false,
            seatIndex: idx,
            exitRank: undefined,
          }));
          room.state = resetState;
          broadcastRoomState(room);
          break;
        }
      }
    } catch (e) {
      console.error('Server error processing message:', e);
    }
  });

  socket.on('close', () => {
    if (boundConnection) {
      const room = rooms.get(boundConnection.roomCode);
      if (room) {
        room.clients.delete(boundConnection.playerId);
        const player = room.state.players.find((p) => p.id === boundConnection.playerId);
        if (player) player.connected = false;

        if (room.state.status === 'LOBBY') {
          room.state.players = room.state.players.filter((p) => p.id !== boundConnection.playerId);
          room.state.players.forEach((p, idx) => { p.seatIndex = idx; });
          if (room.state.hostId === boundConnection.playerId && room.state.players.length > 0) {
            room.state.hostId = room.state.players[0].id;
          }
        }

        if (room.clients.size === 0 && !room.state.players.some((p) => !p.isBot && p.connected)) {
          if (room.botTimer) clearTimeout(room.botTimer);
          rooms.delete(boundConnection.roomCode);
        } else {
          broadcastRoomState(room);
        }
      }
    }
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🎴 Bhabhi Authoritative WebSocket Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint: ws://0.0.0.0:${PORT}`);
});
