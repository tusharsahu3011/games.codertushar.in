import {
  Card,
  Suit,
  Rank,
  Player,
  ActiveTrick,
  GameStatus,
  GameState,
  GameLogEntry,
  MoveValidationResult,
} from '../types';

export const SUITS: Suit[] = ['SPADES', 'HEARTS', 'CLUBS', 'DIAMONDS'];
export const RANKS: Rank[] = [14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  SPADES: '♠',
  HEARTS: '♥',
  CLUBS: '♣',
  DIAMONDS: '♦',
};

export const SUIT_COLORS: Record<Suit, string> = {
  SPADES: '#0f172a',
  HEARTS: '#dc2626',
  CLUBS: '#0f172a',
  DIAMONDS: '#dc2626',
};

export const BOT_NAMES = [
  'Kabir ⚡',
  'Simran 🌸',
  'Arjun 🎯',
  'Priya ✨',
  'Rohan 🃏',
  'Ananya 💎',
];

export const BOT_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Kabir',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Simran',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Arjun',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Rohan',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Ananya',
];

export function getRankLabel(rank: Rank): string {
  switch (rank) {
    case 14:
      return 'A';
    case 13:
      return 'K';
    case 12:
      return 'Q';
    case 11:
      return 'J';
    default:
      return String(rank);
  }
}

export function formatCard(card: Card): string {
  return `${getRankLabel(card.rank)}${SUIT_SYMBOLS[card.suit]}`;
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    SPADES: 0,
    HEARTS: 1,
    CLUBS: 2,
    DIAMONDS: 3,
  };

  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    // High rank first (Ace -> 2)
    return b.rank - a.rank;
  });
}

export class BhabhiEngine {
  /**
   * Generates a standard full 52-card deck
   */
  public static createDeck(): Card[] {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of RANKS) {
        deck.push({
          id: `${suit}_${rank}`,
          suit,
          rank,
        });
      }
    }
    return deck;
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  public static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Creates initial empty game state in LOBBY mode
   */
  public static createInitialState(gameId: string, hostId: string, roomCode?: string): GameState {
    return {
      gameId,
      roomCode: roomCode || gameId.slice(0, 6).toUpperCase(),
      status: GameStatus.LOBBY,
      players: [],
      activeTrick: {
        leadSuit: null,
        cards: [],
        leadPlayerId: '',
      },
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

  /**
   * Starts game: deals 52 cards round-robin clockwise,
   * locates Ace of Spades (SPADES_14), sets turn to holder.
   */
  public static startGame(state: GameState): { success: boolean; error?: string; state: GameState } {
    if (state.players.length < 3 || state.players.length > 6) {
      return { success: false, error: 'Bhabhi requires 3 to 6 players to start.', state };
    }

    const deck = this.shuffleDeck(this.createDeck());
    const players: Player[] = state.players.map((p, idx) => ({
      ...p,
      hand: [],
      isOut: false,
      seatIndex: idx,
      exitRank: undefined,
    }));

    // Round-robin distribution, 1 card at a time clockwise
    let cardIdx = 0;
    while (cardIdx < deck.length) {
      const pIdx = cardIdx % players.length;
      players[pIdx].hand.push(deck[cardIdx]);
      cardIdx++;
    }

    // Sort all player hands
    players.forEach((p) => {
      p.hand = sortHand(p.hand);
      p.handCount = p.hand.length;
    });

    // Locate Ace of Spades (SPADES_14)
    let starterPlayerId = players[0].id;
    for (const p of players) {
      if (p.hand.some((c) => c.suit === 'SPADES' && c.rank === 14)) {
        starterPlayerId = p.id;
        break;
      }
    }

    const starter = players.find((p) => p.id === starterPlayerId);

    const newState: GameState = {
      ...state,
      status: GameStatus.IN_PROGRESS,
      players,
      activeTrick: {
        leadSuit: null,
        cards: [],
        leadPlayerId: '',
      },
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

  /**
   * Strict validation pipeline based on system prompt requirements
   */
  public static validateMove(gameState: GameState, playerId: string, card: Card): MoveValidationResult {
    // 1. Check Turn
    if (gameState.currentTurnPlayerId !== playerId) {
      return { valid: false, reason: 'Not your turn.' };
    }

    // 2. Check Card Ownership
    const player = gameState.players.find((p) => p.id === playerId);
    if (!player || !player.hand.some((c) => c.id === card.id)) {
      return { valid: false, reason: 'Card not in hand.' };
    }

    // 3. First Move Rule (Ace of Spades)
    if (gameState.firstRound && gameState.activeTrick.cards.length === 0) {
      if (card.suit !== 'SPADES' || card.rank !== 14) {
        return { valid: false, reason: 'Must start first move with Ace of Spades (A♠).' };
      }
    }

    // 4. Follow Suit Rule
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

  /**
   * Executes PLAY_CARD move and resolves authoritative game state
   */
  public static playCard(
    currentState: GameState,
    playerId: string,
    cardId: string
  ): { success: boolean; error?: string; state: GameState; eventType?: 'thoko' | 'trick_win' | 'normal' } {
    if (currentState.status !== GameStatus.IN_PROGRESS) {
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

    // Run validation pipeline
    const validation = this.validateMove(currentState, playerId, card);
    if (!validation.valid) {
      return { success: false, error: validation.reason, state: currentState };
    }

    // Clone state immutably for update
    const state: GameState = JSON.parse(JSON.stringify(currentState));
    const activePlayer = state.players.find((p) => p.id === playerId)!;

    // Remove card from player hand
    activePlayer.hand = activePlayer.hand.filter((c) => c.id !== cardId);
    activePlayer.handCount = activePlayer.hand.length;

    // Append to active trick
    state.activeTrick.cards.push({
      playerId: activePlayer.id,
      playerName: activePlayer.name,
      card,
      playedAt: Date.now(),
    });

    const cardName = formatCard(card);
    let eventType: 'thoko' | 'trick_win' | 'normal' = 'normal';

    // 1. Set Lead Suit if this is the first card of the trick
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

    // 2. Check for Off-Suit / Trick Break (Thoko)
    if (card.suit !== state.activeTrick.leadSuit) {
      eventType = 'thoko';
      // Identify Recipient: Player in activeTrick.cards with highest rank matching activeTrick.leadSuit
      let highestLeadCardRank = -1;
      let recipientPlayerId = state.activeTrick.leadPlayerId;

      for (const played of state.activeTrick.cards) {
        if (played.card.suit === state.activeTrick.leadSuit && played.card.rank > highestLeadCardRank) {
          highestLeadCardRank = played.card.rank;
          recipientPlayerId = played.playerId;
        }
      }

      const recipient = state.players.find((p) => p.id === recipientPlayerId)!;
      const cardsToTransfer = state.activeTrick.cards.map((pc) => pc.card);

      // Transfer cards into recipient's hand
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

      // Save last completed trick for ~2 seconds display
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

      // Clear Trick
      state.activeTrick = {
        leadSuit: null,
        cards: [],
        leadPlayerId: '',
      };

      // Next turn goes to the recipient
      state.currentTurnPlayerId = recipient.id;
      state.firstRound = false;

      // Skip Trick Completion and proceed to Check Exits
      this.checkPlayerExitsAndLoss(state);
      return { success: true, state, eventType };
    }

    // 3. Check for Trick Completion (No Break)
    const activePlayersCount = state.players.filter((p) => !p.isOut).length;
    if (state.activeTrick.cards.length === activePlayersCount) {
      eventType = 'trick_win';
      // Identify Winner: Player who played highest rank card in leadSuit
      let highestRank = -1;
      let trickWinnerPlayerId = state.activeTrick.cards[0].playerId;

      for (const played of state.activeTrick.cards) {
        if (played.card.suit === state.activeTrick.leadSuit && played.card.rank > highestRank) {
          highestRank = played.card.rank;
          trickWinnerPlayerId = played.playerId;
        }
      }

      const winner = state.players.find((p) => p.id === trickWinnerPlayerId)!;
      const discardedCards = state.activeTrick.cards.map((pc) => pc.card);
      state.discardPile.push(...discardedCards);

      state.logs.push({
        id: `log_${Date.now()}_win`,
        text: `✨ ${winner.name} won the trick with ${getRankLabel(highestRank as Rank)}${SUIT_SYMBOLS[state.activeTrick.leadSuit!]}! ${discardedCards.length} cards moved to discard pile.`,
        timestamp: Date.now() + 1,
        type: 'win',
      });
      state.lastAction = `${winner.name} won the trick!`;

      // Save last completed trick for ~2 seconds display
      state.lastCompletedTrick = {
        cards: [...state.activeTrick.cards],
        leadSuit: state.activeTrick.leadSuit,
        winnerPlayerId: winner.id,
        winnerName: winner.name,
        completedAt: Date.now(),
        reason: 'win',
      };

      // Clear Trick
      state.activeTrick = {
        leadSuit: null,
        cards: [],
        leadPlayerId: '',
      };

      // Next turn goes to the winner of the trick
      state.currentTurnPlayerId = winner.id;
      state.firstRound = false;

      // Check Exits & Loss
      this.checkPlayerExitsAndLoss(state);
      return { success: true, state, eventType };
    }

    // 4. Advance Turn (Incomplete Trick)
    // Pass turn to next active player clockwise (!isOut)
    state.currentTurnPlayerId = this.getNextActivePlayerId(state, playerId);

    // 5. Check Player Exits & Loss Condition
    this.checkPlayerExitsAndLoss(state);

    return { success: true, state, eventType };
  }

  /**
   * Helper to find the next active player clockwise
   */
  public static getNextActivePlayerId(state: GameState, currentId: string): string {
    const currentIndex = state.players.findIndex((p) => p.id === currentId);
    if (currentIndex === -1) return currentId;

    const total = state.players.length;
    for (let i = 1; i <= total; i++) {
      const nextIndex = (currentIndex + i) % total;
      const candidate = state.players[nextIndex];
      if (!candidate.isOut) {
        return candidate.id;
      }
    }
    return currentId;
  }

  /**
   * Evaluates if players have emptied their hands and exited safely,
   * or if only one player remains holding cards (the Bhabhi).
   */
  public static checkPlayerExitsAndLoss(state: GameState): void {
    // 1. Check for newly emptied hands
    for (const player of state.players) {
      if (!player.isOut && player.hand.length === 0) {
        player.isOut = true;
        if (!state.winnerOrder.includes(player.id)) {
          state.winnerOrder.push(player.id);
          player.exitRank = state.winnerOrder.length;
          state.logs.push({
            id: `log_${Date.now()}_exit_${player.id}`,
            text: `🎉 ${player.name} has GOT AWAY! Empty hand! (Safe rank #${player.exitRank})`,
            timestamp: Date.now() + 2,
            type: 'exit',
          });
        }
      }
    }

    // If currentTurnPlayerId is now 'isOut' (e.g., they won the trick with their last card and exited safely)
    const turnPlayer = state.players.find((p) => p.id === state.currentTurnPlayerId);
    if (turnPlayer && turnPlayer.isOut) {
      state.currentTurnPlayerId = this.getNextActivePlayerId(state, turnPlayer.id);
    }

    // 2. Check remaining active players
    const activePlayers = state.players.filter((p) => !p.isOut);

    if (activePlayers.length === 1) {
      const loser = activePlayers[0];
      state.status = GameStatus.FINISHED;
      state.loserId = loser.id;
      state.logs.push({
        id: `log_${Date.now()}_bhabhi`,
        text: `👑 BHABHI DECLARED: ${loser.name} is the remaining player and is the BHABHI!`,
        timestamp: Date.now() + 3,
        type: 'bhabhi',
      });
      state.lastAction = `👑 ${loser.name} is the BHABHI!`;
    } else if (activePlayers.length === 0) {
      // Edge case: all emptied
      state.status = GameStatus.FINISHED;
      state.loserId = null;
    }
  }

  /**
   * Intelligently selects a card move for an AI Bot
   */
  public static getBotMove(state: GameState, botId: string): Card | null {
    const bot = state.players.find((p) => p.id === botId);
    if (!bot || bot.hand.length === 0) return null;

    // Rule 1: Ace of Spades opening
    if (state.firstRound && state.activeTrick.cards.length === 0) {
      const aceOfSpades = bot.hand.find((c) => c.suit === 'SPADES' && c.rank === 14);
      if (aceOfSpades) return aceOfSpades;
    }

    // If leading a new trick:
    if (state.activeTrick.leadSuit === null) {
      // Lead with lowest card from suit with most cards or lowest overall card
      // Count suit occurrences in hand
      const suitCounts: Record<Suit, number> = { SPADES: 0, HEARTS: 0, CLUBS: 0, DIAMONDS: 0 };
      bot.hand.forEach((c) => suitCounts[c.suit]++);

      // Lead with lowest card to keep high cards safe
      const sortedByRankAsc = [...bot.hand].sort((a, b) => a.rank - b.rank);
      return sortedByRankAsc[0];
    }

    // Following an existing lead:
    const leadSuit = state.activeTrick.leadSuit;
    const cardsOfLeadSuit = bot.hand.filter((c) => c.suit === leadSuit);

    if (cardsOfLeadSuit.length > 0) {
      // Must follow suit!
      // Check current highest lead card in trick
      const leadCardsInTrick = state.activeTrick.cards.filter((pc) => pc.card.suit === leadSuit);
      const maxTrickRank = Math.max(...leadCardsInTrick.map((pc) => pc.card.rank), 0);

      // Can we beat it?
      const higherCards = cardsOfLeadSuit.filter((c) => c.rank > maxTrickRank);
      if (higherCards.length > 0) {
        // Play lowest card that still beats it, or play highest if trying to secure trick
        return higherCards.sort((a, b) => a.rank - b.rank)[0];
      } else {
        // Cannot beat it: dump lowest card of lead suit
        return cardsOfLeadSuit.sort((a, b) => a.rank - b.rank)[0];
      }
    } else {
      // THOKO! Bot has no cards of lead suit!
      // Golden strategy: Dump highest ranking non-lead card (e.g. Ace/King of Hearts or Diamonds)
      // to give dangerous high cards to the highest lead player!
      const sortedByRankDesc = [...bot.hand].sort((a, b) => b.rank - a.rank);
      return sortedByRankDesc[0];
    }
  }

  /**
   * Produces a masked client-safe view of GameState.
   * Opponents' hands are hidden (empty or masked) and only handCount is revealed.
   * Requesting player's full hand is preserved.
   */
  public static getMaskedState(gameState: GameState, forPlayerId: string): GameState {
    return {
      ...gameState,
      players: gameState.players.map((p) => {
        if (p.id === forPlayerId) {
          return {
            ...p,
            handCount: p.hand.length,
          };
        }
        return {
          ...p,
          hand: [], // Mask opponent hand to prevent client inspection cheating
          handCount: p.hand.length,
        };
      }),
    };
  }
}
