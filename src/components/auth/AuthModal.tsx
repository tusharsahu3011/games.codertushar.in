import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { authService } from '../../services/authService';
import type { UserAccount } from '../../types/auth';
import { sounds } from '../../games/undercover-game/utils/sound';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register' | 'guest';
  onSuccess?: (account: UserAccount) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = 'signin',
  onSuccess,
}: AuthModalProps) {
  const [tab, setTab] = useState<'signin' | 'register' | 'guest' | 'verify'>(initialTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [guestName, setGuestName] = useState(authService.currentUser.isGuest ? authService.currentUser.displayName : '');
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');

  // UI status
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeCodeHint, setActiveCodeHint] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMessage('');
    setSuccessMessage('');

    const res = authService.login(email, password);
    if (!res.success) {
      if (res.needsVerification) {
        setPendingEmail(email);
        setTab('verify');
        const challenge = authService.getPendingVerification(email);
        if (challenge) setActiveCodeHint(challenge.code);
        setSuccessMessage('Please enter your 6-digit email verification code.');
        return;
      }
      setErrorMessage(res.error || 'Failed to sign in.');
      return;
    }

    sounds.playSelect();
    onSuccess?.(res.account!);
    onClose();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMessage('');
    setSuccessMessage('');

    const res = authService.register(email, password, displayName);
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
      return;
    }

    setPendingEmail(email);
    if (res.challenge) {
      setActiveCodeHint(res.challenge.code);
    }
    setTab('verify');
    setSuccessMessage(`Verification code sent to ${email}! Check code below or use 123456.`);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    setErrorMessage('');

    const res = authService.verifyEmail(pendingEmail, verificationCode);
    if (!res.success) {
      setErrorMessage(res.error || 'Verification failed.');
      return;
    }

    sounds.playSelect();
    onSuccess?.(res.account!);
    onClose();
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playTap();
    const guest = authService.loginAsGuest(guestName.trim());
    sounds.playSelect();
    onSuccess?.(guest);
    onClose();
  };

  const handleResendCode = () => {
    sounds.playTap();
    if (!pendingEmail) return;
    const challenge = authService.createVerificationChallenge(pendingEmail);
    setActiveCodeHint(challenge.code);
    setSuccessMessage(`New code generated: ${challenge.code} (or use standard code 123456)`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#0d131f',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          padding: 'clamp(20px, 4vw, 28px)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)',
          position: 'relative',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', margin: 0 }}>
              {tab === 'signin' && 'Sign In to Dost Yaar'}
              {tab === 'register' && 'Create Player Account'}
              {tab === 'verify' && 'Verify Your Email'}
              {tab === 'guest' && 'Instant Guest Mode'}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0' }}>
              {tab === 'signin' && 'Access your persistent match records & achievements'}
              {tab === 'register' && 'Track lifetime stats, ratings & unlocked medals'}
              {tab === 'verify' && `Enter code sent to ${pendingEmail || 'your email'}`}
              {tab === 'guest' && 'Jump straight into game lobbies with zero signup'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              padding: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Toggle (Sign In / Register / Guest) */}
        {tab !== 'verify' && (
          <div
            style={{
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.9)',
              padding: '4px',
              borderRadius: '14px',
              marginBottom: '20px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setTab('signin');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: tab === 'signin' ? '#10b981' : 'transparent',
                color: tab === 'signin' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setTab('register');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: tab === 'register' ? '#06b6d4' : 'transparent',
                color: tab === 'register' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                sounds.playTap();
                setTab('guest');
                setErrorMessage('');
              }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: 'none',
                background: tab === 'guest' ? '#f59e0b' : 'transparent',
                color: tab === 'guest' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              Guest Mode
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '16px',
            }}
          >
            <CheckCircle size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* VIEW 1: SIGN IN FORM */}
        {tab === 'signin' && (
          <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dostyaar.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.96rem',
                fontWeight: 800,
                marginTop: '6px',
                background: '#10b981',
                borderRadius: '12px',
              }}
            >
              <span>Sign In to Hub</span>
              <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* VIEW 2: REGISTRATION FORM */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Display Name (In-Game Tag)
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. CardKing, ChaiYaar"
                  required
                  maxLength={24}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@dostyaar.com"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Password (min 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.96rem',
                fontWeight: 800,
                marginTop: '6px',
                background: '#06b6d4',
                borderRadius: '12px',
              }}
            >
              <span>Continue to Verification</span>
              <ShieldCheck size={16} />
            </button>
          </form>
        )}

        {/* VIEW 3: EMAIL VERIFICATION STEP */}
        {tab === 'verify' && (
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '12px 14px',
                borderRadius: '12px',
                fontSize: '0.84rem',
                color: '#38bdf8',
              }}
            >
              <span>Enter the 6-digit code for <strong>{pendingEmail}</strong></span>
              {activeCodeHint && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Demo Code: <strong>{activeCodeHint}</strong> (or <strong>123456</strong>)</span>
                  <button
                    type="button"
                    onClick={() => setVerificationCode(activeCodeHint)}
                    style={{
                      background: 'rgba(6, 182, 212, 0.25)',
                      border: 'none',
                      color: '#ffffff',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >
                    Paste
                  </button>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                6-Digit Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.trim())}
                placeholder="123456"
                maxLength={6}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1.5px solid #06b6d4',
                  color: '#ffffff',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  letterSpacing: '0.3em',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.96rem',
                fontWeight: 800,
                background: '#10b981',
                borderRadius: '12px',
              }}
            >
              <span>Verify & Activate Account</span>
              <CheckCircle size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <button
                type="button"
                onClick={handleResendCode}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <RefreshCw size={13} />
                <span>Resend Code</span>
              </button>

              <button
                type="button"
                onClick={() => setTab('register')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back to Registration
              </button>
            </div>
          </form>
        )}

        {/* VIEW 4: SEAMLESS GUEST MODE */}
        {tab === 'guest' && (
          <form onSubmit={handleGuestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '0.82rem',
                color: '#fbbf24',
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: '2px' }}>Instant Zero-Friction Entry</div>
              <span>No password or email required. Enter any temporary name and start playing with your friends immediately.</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '6px' }}>
                Temporary Display Name
              </label>
              <div style={{ position: 'relative' }}>
                <Zap size={16} color="#fbbf24" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. DostYaar_77, ChaiLover"
                  maxLength={24}
                  required
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    fontSize: '0.94rem',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '0.96rem',
                fontWeight: 800,
                marginTop: '6px',
                background: '#f59e0b',
                borderRadius: '12px',
                color: '#000000',
              }}
            >
              <span>Play as Guest</span>
              <Sparkles size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

