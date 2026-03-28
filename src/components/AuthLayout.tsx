import React from 'react';
import { useTheme } from './ThemeContext';
import { tokens, ThemeToggle } from './AuthComponents';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  return (
    <div
      className="auth-shell"
      style={{ backgroundColor: t.surface, color: t.onSurface, fontFamily: "'Inter', sans-serif" }}
    >

      {/* ── Left Hero Pane (desktop only via CSS) ─────────── */}
      <section
        className="auth-hero"
        style={{ background: isDark ? t.heroBg : tokens.light.heroBg }}
      >
        {/* Ambient glow orbs */}
        <div style={{
          position: 'absolute', top: '-10%', right: '-10%',
          width: '500px', height: '500px', borderRadius: '50%',
          backgroundColor: `${t.primary}18`, filter: 'blur(120px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-5%', left: '-5%',
          width: '400px', height: '400px', borderRadius: '50%',
          backgroundColor: `${t.tertiary}12`, filter: 'blur(100px)', pointerEvents: 'none',
        }} />

        {/* Concentric rings (dark only) */}
        {isDark && (
          <div style={{
            position: 'absolute', right: 0, top: '50%',
            transform: 'translateY(-50%) translateX(50%)',
            width: '600px', height: '600px', borderRadius: '50%',
            border: '1px solid rgba(70,70,92,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              width: '450px', height: '450px', borderRadius: '50%',
              border: '1px solid rgba(70,70,92,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(70,70,92,0.3)' }} />
            </div>
          </div>
        )}

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="primary-gradient" style={{
            width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900,
            fontSize: '22px', letterSpacing: '-0.03em', color: t.primary,
          }}>
            SaaSy Team
          </span>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 'clamp(2.5rem, 4.5vw, 4.5rem)',
            fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em',
            color: t.onSurface, marginBottom: '24px',
          }}>
            Customer <br />Management, <br />
            <span style={{ color: t.tertiaryFixed }}>System</span>
          </h1>

          <p style={{
            fontSize: '17px', lineHeight: 1.65,
            color: t.onSurfaceVariant, maxWidth: '460px', marginBottom: '40px',
          }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.          </p>

          {/* Glass data card */}
          <div style={{
            maxWidth: '400px', padding: '28px', borderRadius: '16px',
            background: t.glassCard,
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            borderTop: `1px solid ${t.glassBorderTop}`,
            boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(184,159,255,0.15)',
          }}>
            {/* Card header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div>
                <p style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '10px', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  color: t.onSurfaceVariant, marginBottom: '4px',
                }}>
                  Lorem Ipsum
                </p>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontSize: '24px', fontWeight: 600, color: t.onSurface, margin: 0,
                }}>
                  Lorem Ipsum Dolor
                </h3>
              </div>
              <div className="neon-badge" style={{
                padding: '4px 10px', borderRadius: '999px',
                backgroundColor: `${t.tertiaryFixed}30`, color: t.tertiaryFixed,
                fontSize: '12px', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                +142.8%
              </div>
            </div>

            {/* Bar chart */}
            <div style={{ height: '110px', display: 'flex', alignItems: 'flex-end', gap: '6px', marginBottom: '10px' }}>
              {[
                { h: 40, alpha: '33' }, { h: 65, alpha: '33' },
                { h: 55, alpha: '4d' }, { h: 85, alpha: '66' },
                { h: 100, teal: true  },
              ].map((bar, i) => (
                <div key={i} style={{
                  flex: 1, height: `${bar.h}%`, borderRadius: '4px 4px 0 0',
                  backgroundColor: bar.teal ? t.tertiaryDim : `${t.primary}${bar.alpha}`,
                }} />
              ))}
            </div>

            {/* Month labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['OCT', 'NOV', 'DEC', 'JAN', 'FEB'].map(m => (
                <span key={m} style={{
                  fontFamily: "'Inter', sans-serif", fontSize: '11px',
                  fontWeight: 500, color: t.onSurfaceVariant,
                }}>{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom spacer */}
        <div />
      </section>

      {/* ── Right Form Pane ────────────────────────────────── */}
      <section
        className="auth-form-pane"
        style={{ backgroundColor: t.surface }}
      >
        {/* Top bar: mobile logo (hidden on desktop) + theme toggle */}
        <div className="auth-topbar">
          {/* Mobile-only logo */}
          <div className="auth-mobile-logo" style={{ margin: 0 }}>
            <div className="primary-gradient" style={{
              width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 900,
              fontSize: '18px', letterSpacing: '-0.03em', color: t.primary,
            }}>
              SaaSy Team
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Centered form */}
        <div className="auth-form-center">
          <div className="auth-form-inner">
            <header style={{ marginBottom: '36px' }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 'clamp(24px, 3vw, 30px)', fontWeight: 700,
                letterSpacing: '-0.02em', color: t.onSurface, marginBottom: '10px',
              }}>
                {title}
              </h2>
              <p style={{ color: t.onSurfaceVariant, fontSize: '15px', margin: 0 }}>{subtitle}</p>
            </header>

            <main className="auth-form-enter">{children}</main>
          </div>
        </div>

        {/* Footer */}
        <footer style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center',
          justifyContent: 'center', gap: '8px 24px',
          paddingTop: '24px',
          borderTop: `1px solid ${t.outlineVariant}30`,
          fontFamily: "'Inter', sans-serif", fontSize: '11px',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          color: t.outline, marginTop: '24px',
        }}>
          {['Privacy', 'Terms', 'Support'].map(link => (
            <a key={link} href="#"
              style={{ color: t.outline, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.6')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {link}
            </a>
          ))}
          <span style={{
            marginLeft: 'auto', textTransform: 'none', letterSpacing: 'normal',
            color: `${t.outline}80`, fontSize: '11px',
          }}>
            © 2024  SaaSy Team
          </span>
        </footer>
      </section>
    </div>
  );
};