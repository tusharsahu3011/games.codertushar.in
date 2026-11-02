import { useState, useEffect } from 'react';
import { GameState, Suit } from '../types';
import SideDealer from './SideDealer';
import DiscardPile from './DiscardPile';
import TrickCenter from './TrickCenter';
import { webrtcVoice } from '../../undercover-game/utils/webrtcVoice';
import {
  History,
  Sparkles,
  Crown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface BhabhiTableProps {
  gameState: GameState;
  myPlayerId: string;
  isOnline?: boolean;
}

export default function BhabhiTable({ gameState, myPlayerId, isOnline = false }: BhabhiTableProps) {
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
        maxWidth: '1360px',
        margin: '0 auto',
        position: 'relative',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
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
            padding: '3px 14px',
            borderRadius: '999px',
            fontSize: '0.76rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '4px',
            backdropFilter: 'blur(8px)',
            maxWidth: '90%',
            textAlign: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={13} color="#38bdf8" />
          <span>{lastAction}</span>
        </div>
      )}

      {/* Main Table Surface */}
      <div
        className="bhabhi-table-surface"
        style={{
          width: '100%',
          flex: 1,
          minHeight: 0,
          background: 'radial-gradient(ellipse at center, #064e3b 0%, #022c22 65%, #021a14 100%)',
          borderRadius: 'clamp(16px, 3vw, 36px)',
          border: 'clamp(3px, 0.8vw, 6px) solid #27272a',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.85), 0 12px 32px rgba(0, 0, 0, 0.6)',
          position: 'relative',
          padding: 'clamp(8px, 1.5vw, 14px) clamp(10px, 2vw, 18px)',
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
            width: '88%',
            height: '78%',
            borderRadius: '32px',
            border: '1px solid rgba(255, 255, 255, 0.04)',
            pointerEvents: 'none',
          }}
        />

        {/* OPPONENTS AREA (Top Arc) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '8px clamp(6px, 1.5vw, 16px)',
            width: '100%',
            zIndex: 10,
            flexShrink: 0,
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
                    ? '0 0 16px rgba(16, 185, 129, 0.75)'
                    : isTurn
                    ? '0 0 14px rgba(16, 185, 129, 0.45)'
                    : '0 4px 10px rgba(0, 0, 0, 0.3)',
                  padding: '5px 10px',
                  borderRadius: '14px',
                  minWidth: '85px',
                  maxWidth: '125px',
                  position: 'relative',
                  transition: 'all 0.22s ease',
                  backdropFilter: 'blur(6px)',
                }}
              >
                {/* Turn pulsating ring badge */}
                {isTurn && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-8px',
                      background: '#10b981',
                      color: '#ffffff',
                      fontSize: '0.58rem',
                      fontWeight: 900,
                      padding: '1px 6px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    TURN
                  </div>
                )}

                {/* Avatar with speaking wave */}
                <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                  <img
                    src={opponent.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${opponent.id}`}
                    alt={opponent.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      border: '1.5px solid rgba(255, 255, 255, 0.2)',
                      background: '#1e293b',
                    }}
                  />
                  {opponent.isBot && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        background: '#3b82f6',
                        color: '#ffffff',
                        fontSize: '0.52rem',
                        fontWeight: 900,
                        padding: '1px 3px',
                        borderRadius: '3px',
                      }}
                    >
                      AI
                    </span>
                  )}
                </div>

                {/* Player Name */}
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    marginTop: '3px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100px',
                  }}
                >
                  {opponent.name}
                </span>

                {/* Status Pill */}
                {opponent.isOut ? (
                  <span
                    style={{
                      marginTop: '2px',
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.25)',
                      color: '#34d399',
                      border: '1px solid rgba(16, 185, 129, 0.5)',
                      padding: '1px 5px',
                      borderRadius: '999px',
                    }}
                  >
                    GOT AWAY #{opponent.exitRank || '✓'}
                  </span>
                ) : isLoser ? (
                  <span
                    style={{
                      marginTop: '2px',
                      fontSize: '0.62rem',
                      fontWeight: 900,
                      background: 'rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      border: '1px solid #ef4444',
                      padding: '1px 5px',
                      borderRadius: '999px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '2px',
                    }}
                  >
                    <Crown size={10} /> BHABHI
                  </span>
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                      fontSize: '0.68rem',
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

        {/* MIDDLE SECTION: SIDE DEALER (FLANK) + CENTER TRICK + DISCARD PILE (FLANK) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            gap: '12px',
            flex: 1,
            minHeight: 0,
            margin: '4px 0',
            position: 'relative',
          }}
        >
          {/* LEFT FLANK: AI DEALER RIYA WITH HINDI COMMENTARY - ONLY IN ONLINE MULTIPLAYER */}
          {isOnline ? (
            <SideDealer gameState={gameState} myPlayerId={myPlayerId} />
          ) : (
            <div style={{ width: 'clamp(110px, 14vw, 150px)', flexShrink: 0 }} />
          )}

          {/* CENTER: ACTIVE TRICK CARD TABLE */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <TrickCenter
              displayedCards={displayedCards}
              leadSuit={leadSuit}
              firstRound={Boolean(gameState.firstRound)}
              isHoldingCompletedTrick={isHoldingCompletedTrick}
              completedTrickReason={gameState.lastCompletedTrick?.reason}
              completedTrickWinner={gameState.lastCompletedTrick?.winnerName}
              completedTrickPenaltyPlayer={gameState.lastCompletedTrick?.penaltyPlayerName}
            />
          </div>

          {/* RIGHT FLANK: REALISTIC DISCARD PILE STACK & GAME LOG TOGGLE */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
              width: 'clamp(110px, 14vw, 150px)',
            }}
          >
            <DiscardPile
              discardPileCount={discardPile.length}
              recentDiscardedCards={
                isHoldingCompletedTrick && gameState.lastCompletedTrick?.reason !== 'thoko'
                  ? displayedCards
                  : []
              }
            />

            {/* Compact Game Log Toggle Button */}
            <button
              type="button"
              onClick={() => setShowLogDrawer(!showLogDrawer)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                background: 'rgba(15, 23, 42, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#cbd5e1',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                backdropFilter: 'blur(6px)',
                transition: 'background 0.15s ease',
              }}
            >
              <History size={12} color="#38bdf8" />
              <span>Log ({logs.length})</span>
              {showLogDrawer ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            </button>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE LOG DRAWER */}
      {showLogDrawer && (
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '16px',
            width: 'min(360px, 90vw)',
            background: 'rgba(15, 23, 42, 0.96)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '12px',
            maxHeight: '160px',
            overflowY: 'auto',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8)',
            zIndex: 40,
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#94a3b8',
              letterSpacing: '0.04em',
            }}
          >
            <span>LIVE MATCH EVENT STREAM</span>
            <button
              type="button"
              onClick={() => setShowLogDrawer(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '0.7rem',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[...logs].reverse().slice(0, 15).map((log) => {
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
                    gap: '6px',
                    fontSize: '0.72rem',
                    color: log.type === 'thoko' || log.type === 'bhabhi' ? '#ffffff' : '#cbd5e1',
                    background: log.type === 'thoko' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                    padding: '2px 4px',
                    borderRadius: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '5px',
                      height: '5px',
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
