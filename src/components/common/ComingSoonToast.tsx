import { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

export interface ComingSoonToastProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  autoCloseMs?: number;
}

export default function ComingSoonToast({
  isOpen,
  onClose,
  title = 'Account System Coming Soon! 🚀',
  message = 'Custom player profiles, stats tracking, and friend lists will be available in an upcoming update.',
  autoCloseMs = 3500,
}: ComingSoonToastProps) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, autoCloseMs);
    return () => clearTimeout(timer);
  }, [isOpen, onClose, autoCloseMs]);

  if (!isOpen) return null;

  return (
    <div className="coming-soon-toast" role="alert">
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          background: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Sparkles size={18} color="#ffffff" />
      </div>
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffffff' }}>
          {title}
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
          {message}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748b',
          cursor: 'pointer',
          marginLeft: '8px',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}

