import { Gamepad2, Heart, ShieldCheck, Sparkles } from 'lucide-react';
import { sounds } from '../../games/undercover-game/utils/sound';

export default function HubFooter() {
  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    sounds.playTap();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#07090e',
        padding: '36px 16px 32px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Left: Brand Logo & Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Gamepad2 size={20} color="#ffffff" />
            </div>

            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
                Fun With Dost Yaar
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Social Deception, Word Games & Traditional Card Battles
              </div>
            </div>
          </div>

          {/* Center: In-App Quick Shortcuts */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '0.84rem',
              color: '#94a3b8',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/game/undercover"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 700 }}
            >
              Undercover
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href="/game/spyfall"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 700 }}
            >
              Spyfall
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href="/game/bhabhi"
              style={{ color: '#cbd5e1', textDecoration: 'none', fontWeight: 700 }}
            >
              Bhabhi (Get Away)
            </a>
            <span style={{ opacity: 0.4 }}>•</span>
            <a
              href="#top"
              onClick={handleScrollToTop}
              style={{ color: '#10b981', textDecoration: 'none', fontWeight: 700 }}
            >
              Back to Top ↑
            </a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Tagline */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            paddingTop: '20px',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          <div>
            © {new Date().getFullYear()} Fun With Dost Yaar • Made with ❤️ for game nights with friends.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
            <ShieldCheck size={14} />
            <span>100% Free & Open In-Browser</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
