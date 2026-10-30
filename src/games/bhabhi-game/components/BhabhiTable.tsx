import { useState, useEffect } from 'react';
import { GameState, Player, Suit } from '../types';
import { SUIT_SYMBOLS, SUIT_COLORS } from '../utils/engine';
import PlayingCard from './PlayingCard';
import DealerStation from './DealerStation';
import { webrtcVoice } from '../../undercover-game/utils/webrtcVoice';
import {
  Users,
  History,
  AlertTriangle,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
  Mic,
} from 'lucide-react';

export interface BhabhiTableProps {
  gameState: GameState;
  myPlayerId: string;
}

export default function BhabhiTable({ gameState, myPlayerId }: BhabhiTableProps) {
  const [showLogDrawer, setShowLogDrawer] = useState(false);
  const [, setTick] = useState(0);
  const [voiceState, setVoiceState] = useState(() => ({
    peerStates: webrtcVoice.peerStates,
    isSpeaking: webrtcVoice.isSpeaking,
  }));

  useEffect(() => {
    const unsub = webrtcVoice.subscribe((s) => {
      setVoiceState({
        peerStates: s.peerStates,
        isSpeaking: s.isSpeaking,
      });
    });
    return () => unsub();
  }, []);

  const { activeTrick, currentTurnPlayerId, discardPile, loserId, logs, lastAction } = gameState;

  // Auto-refresh when 2-second completed trick hold expires
  useEffect(() => {
    if (!gameState.lastCompletedTrick) return;
    const elapsed = Date.now() - gameState.lastCompletedTrick.completedAt;
    if (elapsed < 2300) {
      const timer = setTimeout(() => {
        setTick((t) => t + 1);
      }, 2300 - elapsed);
      return () => clearTimeout(timer);
    }
  }, [gameState.lastCompletedTrick]);

  const isHoldingCompletedTrick = Boolean(
    activeTrick.cards.length === 0 &&
    gameState.lastCompletedTrick &&
    Date.now() - gameState.lastCompletedTrick.completedAt < 2200
  );

  const displayedCards = isHoldingCompletedTrick
    ? gameState.lastCompletedTrick!.cards
    : activeTrick.cards;

  // Defensive deduplication of players
  const uniquePlayers = Array.from(
    new Map(
      (gameState.players || [])
        .filter((p) => Boolean(p && p.id && p.name && p.name.trim() !== ''))
        .map((p) => [p.id, p])
    ).values()
  );

  // Filter opponents (all players except me)
  const myPlayer = uniquePlayers.find((p) => p.id === myPlayerId);
  const opponents = uniquePlayers.filter((p) => p.id !== myPlayerId);

  // Lead suit
  const leadSuit: Suit | null = activeTrick.leadSuit;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        position: 'relative',
        flex: 1,
      }}
    >
      {/* Top Banner / Last Action Toast */}
      {lastAction && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
            padding: '5px 16px',
            borderRadius: '999px',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '8px',
            backdropFilter: 'blur(8px)',
            maxWidth: '90%',
            textAlign: 'center',
          }}
        >
          <Sparkles size={14} color="#38bdf8" />
          <span>{lastAction}</span>
        </div>
      )}

      {/* Main Oval Card Table Surface */}
      <div
        className="bhabhi-table-surface"
        style={{
          width: '100%',
          flex: 1,
          minHeight: 'clamp(420px, 54vh, 620px)',
          background: 'radial-gradient(ellipse at center, #064e3b 0%, #022c22 65%, #021a14 100%)',
          borderRadius: 'clamp(20px, 4vw, 44px)',
          border: 'clamp(4px, 1.2vw, 8px) solid #27272a',
          boxShadow: 'inset 0 0 90px rgba(0, 0, 0, 0.85), 0 16px 40px rgba(0, 0, 0, 0.65)',
          position: 'relative',
          padding: 'clamp(12px, 2.5vw, 24px) clamp(10px, 2vw, 20px) 8px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
        }}
      >
        {/* Subtle table felt texture rings */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '85%',
            height: '75%',
            borderRadius: '40px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            pointerEvents: 'none',
          }}
        />

        {/* AI DEALER PERSONA (RIYA) */}
        <DealerStation gameState={gameState} myPlayerId={myPlayerId} />

        {/* OPPONENTS AREA (Top Arc) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px clamp(8px, 2vw, 24px)',
            width: '100%',
            zIndex: 10,
          }}
        >
          {opponents.map((opponent) => {
            const isTurn = currentTurnPlayerId === opponent.id;
            const isLoser = loserId === opponent.id;
            const isSpeaking = Boolean(voiceState.peerStates[opponent.id]?.isSpeaking);
            const cardCount = opponent.handCount ?? opponent.hand.length;

            return (
              <div
                key={opponent.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  background: isTurn
                    ? 'rgba(16, 185, 129, 0.18)'
                    : 'rgba(15, 23, 42, 0.75)',
                  border: isLoser
                    ? '2px solid #ef4444'
                    : isSpeaking
                    ? '2.5px solid #10b981'
                    : isTurn
                    ? '2px solid #10b981'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: isSpeaking
                    ? '0 0 20px rgba(16, 185, 129, 0.75)'
                    : isTurn
                    ? '0 0 18px rgba(16, 185, 129, 0.45)'
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                  padding: '8px 12px',
                  borderRadius: '16px',
                  minWidth: '100px',
                  maxWidth: '140px',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {/* Turn pulsating ring badge */}
                {isTurn && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-9px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      animation: 'pulse 1.5s infinite',
                    }}
                  >
                    THINKING...
                  </div>
                )}

                {/* Avatar */}
                <div style={{ position: 'relative', marginBottom: '6px' }}>
                  <img
                    src={opponent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent.id}`}
                    alt={opponent.name}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      background: '#1e293b',
                      border: isSpeaking
                        ? '2.5px solid #10b981'
                        : isTurn
                        ? '2px solid #34d399'
                        : '1.5px solid rgba(255, 255, 255, 0.2)',
                    }}
                  />
                  {isSpeaking && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-3px',
                        left: '-3px',
                        background: '#10b981',
                        color: '#ffffff',
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)',
                      }}
                      title="Speaking"
                    >
                      <Mic size={10} />
                    </span>
                  )}
                  {opponent.isBot && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-4px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        fontSize: '0.58rem',
                        fontWeight: 800,
                        padding: '1px 4px',
                        borderRadius: '4px',
                      }}
                    >
                      BOT
                    </span>
                  )}
                </div>

                {/* Name */}
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: '#f8fafc',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px',
                  }}
                >
                  {opponent.name}
                </div>

                {/* Status Pill */}
                {opponent.isOut ? (
                  <span
                    style={{
                      marginTop: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      padding: '2px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    GOT AWAY #{opponent.exitRank || '✓'}
                  </span>
                ) : isLoser ? (
                  <span
                    style={{
                      marginTop: '4px',
                      fontSize: '0.66rem',
                      fontWeight: 900,
                      background: 'rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      border: '1px solid #ef4444',
                      padding: '2px 6px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                    }}
                  >
                    <Crown size={11} /> BHABHI
                  </span>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '4px',
                      fontSize: '0.72rem',
                      color: '#cbd5e1',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>Cards:</span>
                    <span style={{ fontWeight: 800, color: cardCount > 10 ? '#f59e0b' : '#38bdf8' }}>
                      {cardCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CENTER TRICK ZONE */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '20px 0',
            position: 'relative',
            zIndex: 5,
          }}
        >
          {/* Lead Suit / Review Status Header */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: isHoldingCompletedTrick
                ? (gameState.lastCompletedTrick?.reason === 'thoko' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(245, 158, 11, 0.9)')
                : 'rgba(15, 23, 42, 0.85)',
              border: isHoldingCompletedTrick
                ? '1px solid #ffffff'
                : '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 18px',
              borderRadius: '999px',
              marginBottom: '16px',
              boxShadow: isHoldingCompletedTrick
                ? '0 0 20px rgba(245, 158, 11, 0.5)'
                : '0 4px 12px rgba(0, 0, 0, 0.35)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.84rem',
              transition: 'all 0.2s ease',
            }}
          >
            {isHoldingCompletedTrick ? (
              gameState.lastCompletedTrick?.reason === 'thoko' ? (
                <span>💥 THOKO! {gameState.lastCompletedTrick?.penaltyPlayerName} picks up {gameState.lastCompletedTrick?.cards.length} cards! (Reviewing...)</span>
              ) : (
                <span>✨ Trick Won by {gameState.lastCompletedTrick?.winnerName}! (Clearing in 2s...)</span>
              )
            ) : leadSuit ? (
              <>
                <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
                  Trick Lead Suit:
                </span>
                <span
                  style={{
                    color: SUIT_COLORS[leadSuit],
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {SUIT_SYMBOLS[leadSuit]} {leadSuit}
                </span>
              </>
            ) : gameState.firstRound ? (
              <span
                style={{
                  color: '#fbbf24',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Sparkles size={13} /> Opening Move: Ace of Spades (A♠) Required
              </span>
            ) : (
              <span style={{ color: '#cbd5e1', fontSize: '0.78rem', fontWeight: 700 }}>
                Open Trick — Lead Player can play any suit
              </span>
            )}
          </div>

          {/* Cards currently played in the active trick */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '130px',
              position: 'relative',
              width: '100%',
            }}
          >
            {displayedCards.length === 0 ? (
              <div
                style={{
                  border: '2px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px 36px',
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              >
                Waiting for lead card to begin trick...
              </div>
            ) : (
              <div
                className={isHoldingCompletedTrick ? 'trick-review-active' : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  minHeight: '160px',
                  padding: isHoldingCompletedTrick ? '12px 20px' : '6px 12px',
                  borderRadius: '24px',
                  flexWrap: 'nowrap',
                }}
              >
                {displayedCards.map((played, idx) => {
                  // Organic card angle on the table
                  const rotations = [-5, 3, -3, 6, -4, 4];
                  const rotation = rotations[idx % rotations.length];
                  const marginOffset = idx === 0 ? '0px' : displayedCards.length > 4 ? '-28px' : '-16px';
                  const isThoko = leadSuit !== null && played.card.suit !== leadSuit;
                  const isLeadCard = idx === 0;

                  return (
                    <div
                      key={`${played.card.id}_${idx}`}
                      className="card-fly-in"
                      style={{
                        marginLeft: marginOffset,
                        zIndex: idx + 1,
                        position: 'relative',
                        ['--target-rot' as any]: `${rotation}deg`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                      }}
                    >
                      {/* Special Trick Role Tag (LEAD vs THOKO) */}
                      {isThoko ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                            color: '#ffffff',
                            fontSize: '0.66rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.6)',
                            letterSpacing: '0.04em',
                            zIndex: 20,
                            animation: 'bounce 0.6s ease',
                          }}
                        >
                          THOKO 💥
                        </div>
                      ) : isLeadCard ? (
                        <div
                          style={{
                            position: 'absolute',
                            top: '-12px',
                            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                            color: '#ffffff',
                            fontSize: '0.66rem',
                            fontWeight: 900,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.5)',
                            letterSpacing: '0.04em',
                            zIndex: 20,
                          }}
                        >
                          LEAD ⭐
                        </div>
                      ) : null}

                      <PlayingCard
                        card={played.card}
                        size="lg"
                        rotation={rotation}
                        playerName={played.playerName}
                        disabled
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* BOTTOM SECTION: Discard Pile & Log Drawer Switch */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '4px 8px 0',
            zIndex: 10,
          }}
        >
          {/* Discard Pile Stack */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '6px 12px',
              borderRadius: '12px',
              backdropFilter: 'blur(6px)',
            }}
          >
            <div style={{ position: 'relative', width: '28px', height: '40px' }}>
              {discardPile.length > 0 && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      top: '2px',
                      left: '2px',
                      width: '24px',
                      height: '36px',
                      borderRadius: '4px',
                      background: '#1e293b',
                      border: '1px solid #475569',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      width: '24px',
                      height: '36px',
                      borderRadius: '4px',
                      background: '#334155',
                      border: '1px solid #64748b',
                    }}
                  />
                </>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: 600 }}>
                Discard Trash
              </span>
              <span style={{ fontSize: '0.82rem', color: '#f8fafc', fontWeight: 800 }}>
                {discardPile.length} cards
              </span>
            </div>
          </div>

          {/* Activity Log Toggle Button */}
          <button
            type="button"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(15, 23, 42, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              backdropFilter: 'blur(6px)',
              transition: 'background 0.15s ease',
            }}
          >
            <History size={14} color="#38bdf8" />
            <span>Game Log ({logs.length})</span>
            {showLogDrawer ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
      </div>

      {/* COLLAPSIBLE LOG DRAWER */}
      {showLogDrawer && (
        <div
          style={{
            width: '100%',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '16px',
            marginTop: '10px',
            padding: '14px',
            maxHeight: '180px',
            overflowY: 'auto',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.04em',
            }}
          >
            <span>LIVE MATCH EVENT STREAM</span>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Most recent at top</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...logs].reverse().slice(0, 20).map((log) => {
              const typeColor = {
                thoko: '#f87171',
                win: '#34d399',
                lead: '#fbbf24',
                exit: '#60a5fa',
                bhabhi: '#ef4444',
                info: '#94a3b8',
              }[log.type] || '#cbd5e1';

              return (
                <div
                  key={log.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '0.76rem',
                    color: log.type === 'thoko' || log.type === 'bhabhi' ? '#ffffff' : '#cbd5e1',
                    background: log.type === 'thoko' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    padding: log.type === 'thoko' ? '4px 8px' : '2px 4px',
                    borderRadius: '6px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: typeColor,
                      flexShrink: 0,
                    }}
                  />
                  <span>{log.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
