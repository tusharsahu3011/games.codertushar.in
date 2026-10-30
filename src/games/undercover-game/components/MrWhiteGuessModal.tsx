import React, { useState } from 'react';
import { HelpCircle, Sparkles, Send, AlertTriangle } from 'lucide-react';
import { checkMrWhiteGuess, type EnginePlayer } from '../utils/gameEngine';
import { sounds } from '../utils/sound';

export interface MrWhiteGuessModalProps {
  player: EnginePlayer;
  civilianWord: string;
  onSubmitResult: (isCorrect: boolean) => void;
}

export default function MrWhiteGuessModal({
  player,
  civilianWord,
  onSubmitResult,
}: MrWhiteGuessModalProps) {
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!guess.trim()) return;

    const correct = checkMrWhiteGuess(guess, civilianWord);
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      sounds.playVictory();
    } else {
      sounds.playEliminated();
    }
  };

  const handleFinish = () => {
    sounds.playTap();
    onSubmitResult(isCorrect);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(2, 6, 23, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '16px',
    }}>
      <div className="glass-panel animate-enter" style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: 'calc(100dvh - 24px)',
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        textAlign: 'center',
        padding: '28px 20px',
        border: '2px solid rgba(168, 85, 247, 0.5)',
        boxShadow: '0 0 50px rgba(168, 85, 247, 0.3)',
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(168, 85, 247, 0.2)',
          border: '2px solid var(--mrwhite-violet)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <HelpCircle size={30} color="var(--mrwhite-violet)" />
        </div>

        <span className="badge badge-violet" style={{ marginBottom: '8px' }}>
          Final Gambit
        </span>

        <h3 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
          {player.name} is Mr. White!
        </h3>

        {!submitted ? (
          <>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              You were caught with no secret word. However, you have <strong>one final guess</strong> at the secret Civilian word. If you guess correctly, you steal the entire victory!
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="Type your guess here..."
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textAlign: 'center',
                }}
              />

              <button
                type="submit"
                className="btn-primary"
                style={{
                  padding: '16px',
                  fontSize: '1rem',
                  fontWeight: 800,
                  background: '#a855f7',
                  boxShadow: '0 0 25px rgba(168, 85, 247, 0.5)',
                }}
              >
                <Send size={18} />
                <span>Submit Final Guess</span>
              </button>
            </form>
          </>
        ) : (
          <div className="animate-enter" style={{ padding: '12px 0' }}>
            {isCorrect ? (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎉</div>
                <h4 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#38bdf8', marginBottom: '8px' }}>
                  CORRECT GUESS!
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  The civilian word was indeed <strong>"{civilianWord}"</strong>. Mr. White pulled off the ultimate bluff and stolen victory!
                </p>
              </>
            ) : (
              <>
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>❌</div>
                <h4 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f43f5e', marginBottom: '8px' }}>
                  INCORRECT GUESS
                </h4>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  Your guess was "{guess}". Mr. White failed to deduce the secret word and is definitively eliminated!
                </p>
              </>
            )}

            <button
              onClick={handleFinish}
              className="btn-primary"
              style={{ width: '100%', padding: '14px' }}
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
