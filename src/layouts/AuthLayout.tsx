import React, { useEffect, useState } from 'react';
import { useTheme, tokens } from '../providers/ThemeProvider';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { supabase } from '../lib/supabase';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  compact?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle, compact }) => {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const [glow, setGlow] = useState({ x: '50%', y: '50%', active: false });

  useEffect(() => {
    let isMounted = true;

    const enforceActiveUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!isMounted || error || !data.user) return;

      const { data: appUser, error: appUserError } = await supabase
        .from('app_user')
        .select('record_status')
        .eq('id', data.user.id)
        .single();

      if (isMounted && !appUserError && appUser?.record_status === 'INACTIVE') {
        await supabase.auth.signOut();
      }
    };

    enforceActiveUser();
    return () => { isMounted = false; };
  }, []);

  return (
    <div
      className="auth-shell"
      style={{
        color: t.onSurface,
        fontFamily: "'Inter', sans-serif",
        ['--auth-bg' as string]: isDark
          ? 'radial-gradient(circle at top, rgba(69, 46, 156, 0.22), transparent 34%), linear-gradient(135deg, #130d2f 0%, #0d0b1d 45%, #090811 100%)'
          : 'radial-gradient(circle at top, rgba(176, 148, 255, 0.22), transparent 34%), linear-gradient(135deg, #f7f3ff 0%, #eee8fb 48%, #e6def7 100%)',
        ['--ambient-primary' as string]: isDark ? 'rgba(118, 80, 255, 0.24)' : 'rgba(171, 135, 255, 0.22)',
        ['--ambient-secondary' as string]: isDark ? 'rgba(103, 33, 255, 0.16)' : 'rgba(154, 104, 255, 0.18)',
        ['--ambient-tertiary' as string]: isDark ? 'rgba(75, 38, 182, 0.18)' : 'rgba(194, 171, 255, 0.22)',
        ['--shape-fill' as string]: isDark
          ? 'linear-gradient(180deg, rgba(91, 49, 232, 0.14), rgba(58, 24, 162, 0.04))'
          : 'linear-gradient(180deg, rgba(162, 120, 255, 0.18), rgba(162, 120, 255, 0.05))',
        ['--glow-x' as string]: glow.x,
        ['--glow-y' as string]: glow.y,
        ['--glow-opacity' as string]: glow.active ? '1' : '0',
      }}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setGlow({ x: `${e.clientX - rect.left}px`, y: `${e.clientY - rect.top}px`, active: true });
      }}
      onMouseEnter={() => setGlow((prev) => ({ ...prev, active: true }))}
      onMouseLeave={() => setGlow((prev) => ({ ...prev, active: false }))}
    >
      {/* Backdrop Decorations */}
      <div className="auth-backdrop" aria-hidden="true">
        <div className="auth-background-glow" />
        <div className="auth-ambient auth-ambient-primary" />
        <div className="auth-ambient auth-ambient-secondary" />
        <div className="auth-ambient auth-ambient-tertiary" />
        <div className="auth-grid-shape auth-grid-shape-top" />
        <div className="auth-grid-shape auth-grid-shape-bottom" />
        <div className="auth-grid-shape auth-grid-shape-center" />
      </div>

      <div className="auth-topbar">
        <ThemeToggle />
      </div>

      <section className="auth-form-center">
        <div className={`auth-card-wrap ${compact ? 'auth-card-wrap-compact' : ''}`}>
          <div
            className={`auth-card ${compact ? 'auth-card-compact' : ''}`}
            style={{
              background: isDark
                ? 'linear-gradient(180deg, rgba(38,34,76,0.96) 0%, rgba(34,31,68,0.95) 100%)'
                : 'linear-gradient(180deg, rgba(249,246,255,0.96) 0%, rgba(238,232,250,0.98) 100%)',
              border: `1px solid ${isDark ? 'rgba(167, 143, 255, 0.18)' : 'rgba(131, 79, 255, 0.16)'}`,
              boxShadow: isDark
                ? '0 20px 60px rgba(4, 2, 19, 0.52), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 16px 44px rgba(98, 74, 177, 0.14), inset 0 1px 0 rgba(255,255,255,0.72)',
            }}
          >
            {/* Centered Brand Wordmark */}
            <div 
              className="auth-mobile-logo" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                textAlign: 'center',
                marginBottom: '20px' 
              }}
            >
              <span 
                style={{ 
                  fontFamily: "'Acquire', sans-serif", 
                  fontSize: '20px', 
                  fontWeight: 750, 
                  letterSpacing: '2px',
                  lineHeight: 1
                }}
              >
                <span style={{ color: isDark ? '#fff' : t.onSurface, fontSize: '25px' }}>BITE</span>
                <span style={{ color: t.primary, fontSize: '25px' }}>LOG</span>
              </span>
              <span 
                style={{ 
                  fontSize: '8px', 
                  color: t.onSurfaceVariant, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.1em',
                  marginTop: '10px',
                  marginBottom: '0px' 
                }}
              >
                Customer Management System
              </span>
            </div>

            <div className="auth-form-inner" style={{ textAlign: 'center' }}>
              <header className="auth-card-header" style={{ marginBottom: '24px' }}>
                <h2
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: 'clamp(18px, 2.5vw, 22px)',
                    fontWeight: 800,
                    letterSpacing: '-0.02em',
                    color: t.onSurface,
                    marginBottom: '6px',
                  }}
                >
                  {title}
                </h2>
                <p 
                  style={{ 
                    color: t.onSurfaceVariant, 
                    fontSize: 'clamp(12px, 1.4vw, 13px)', 
                    margin: '0 auto', 
                    lineHeight: 1.5,
                    maxWidth: '280px' 
                  }}
                >
                  {subtitle}
                </p>
              </header>

              {/* Form Content (Left-aligned for better input readability) */}
              <main className="auth-form-enter" style={{ textAlign: 'left' }}>
                {children}
              </main>

              <footer 
                className="auth-card-footer" 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: '16px', 
                  marginTop: '32px' 
                }}
              >
                {['Privacy', 'Terms', 'Support'].map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{ 
                      color: t.outline, 
                      textDecoration: 'none', 
                      fontSize: '11px',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.65')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    {link}
                  </a>
                ))}
              </footer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};