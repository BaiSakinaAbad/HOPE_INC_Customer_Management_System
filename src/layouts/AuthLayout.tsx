// AuthLayout — Wrapper for auth pages with theme support, backdrop decorations, and active user enforcement
import React, { useEffect, useState } from 'react';
import { useTheme, tokens } from '../providers/ThemeProvider';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { supabase } from '../lib/supabase';
import logo from '../assets/Logo.png';

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
  const [activeSlide, setActiveSlide] = useState(0);
  const heading = title || (compact ? 'Create an account' : 'Welcome back');
  const supportingText = subtitle || (compact ? 'Set up your BiteLog workspace.' : 'Sign in to continue to BiteLog.');
  const artSlides = [
    ['Managing Customers', 'Creating Growth'],
    ['Tracking Sales', 'Building Momentum'],
    ['Organizing Teams', 'Serving Better'],
  ];
  const darkArtThemes = [
    { accent: '#b792ff', glow: '#754cff', surface: '#08070d', bars: [42, 64, 88], nodes: '62 132 108 92 148 112 194 58' },
    { accent: '#8fd9ff', glow: '#5b7cff', surface: '#08070d', bars: [72, 48, 82], nodes: '58 118 104 74 148 86 198 46' },
    { accent: '#d7b6ff', glow: '#8b5cf6', surface: '#08070d', bars: [54, 78, 62], nodes: '60 124 108 102 150 64 196 78' },
  ];
  const lightArtThemes = [
    { accent: '#8657ff', glow: '#c7b6ff', surface: '#fff7ff', bars: [42, 64, 88], nodes: '62 132 108 92 148 112 194 58' },
    { accent: '#3875f6', glow: '#b7dcff', surface: '#f8fbff', bars: [72, 48, 82], nodes: '58 118 104 74 148 86 198 46' },
    { accent: '#9b5cff', glow: '#dec7ff', surface: '#fff8ff', bars: [54, 78, 62], nodes: '60 124 108 102 150 64 196 78' },
  ];
  const artThemes = isDark ? darkArtThemes : lightArtThemes;
  const activeArt = artThemes[activeSlide];

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
            <aside
              className="auth-art-panel"
              aria-label="BiteLog highlights"
              style={{
                ['--auth-art-bg' as string]: isDark
                  ? 'radial-gradient(circle at 64% 36%, rgba(155, 111, 255, 0.22), transparent 28%), radial-gradient(circle at 18% 18%, rgba(63, 78, 185, 0.22), transparent 32%), radial-gradient(circle at 82% 82%, rgba(83, 31, 122, 0.24), transparent 30%), linear-gradient(145deg, #08070d 0%, #111022 42%, #090911 100%)'
                  : 'radial-gradient(circle at 66% 34%, rgba(153, 116, 255, 0.28), transparent 30%), radial-gradient(circle at 20% 18%, rgba(102, 132, 255, 0.2), transparent 34%), radial-gradient(circle at 82% 82%, rgba(217, 188, 255, 0.34), transparent 32%), linear-gradient(145deg, #ffffff 0%, #f5f0ff 46%, #ece5fb 100%)',
                ['--auth-art-orb' as string]: isDark
                  ? 'radial-gradient(ellipse at 36% 48%, rgba(100, 80, 219, 0.2), transparent 42%), radial-gradient(ellipse at 72% 28%, rgba(117, 62, 184, 0.18), transparent 38%)'
                  : 'radial-gradient(ellipse at 36% 48%, rgba(132, 94, 255, 0.18), transparent 42%), radial-gradient(ellipse at 72% 28%, rgba(255, 255, 255, 0.62), transparent 38%)',
                ['--auth-art-vignette' as string]: isDark ? 'rgba(0, 0, 0, 0.72)' : 'rgba(130, 101, 197, 0.14)',
                ['--auth-art-brand' as string]: isDark ? 'rgba(255, 255, 255, 0.94)' : 'rgba(37, 28, 64, 0.92)',
                ['--auth-art-muted' as string]: isDark ? 'rgba(165, 160, 178, 0.82)' : 'rgba(93, 83, 119, 0.78)',
                ['--auth-art-strong' as string]: isDark ? '#ffffff' : '#211a33',
                ['--auth-art-dot' as string]: isDark ? 'rgba(203, 190, 233, 0.24)' : 'rgba(75, 58, 120, 0.2)',
                ['--auth-art-shadow' as string]: isDark ? 'rgba(0, 0, 0, 0.42)' : 'rgba(102, 75, 160, 0.18)',
              }}
            >
              <div className="auth-art-topline">
                <div className="auth-art-brand">
                  <img className="auth-art-brand-logo" src={logo} alt="" />
                  <span className="auth-art-wordmark">
                    <span>BITE</span><span>LOG</span>
                  </span>
                </div>
              </div>
              <div className="auth-glass-hero" aria-hidden="true">
                <svg className="auth-dynamic-art" viewBox="0 0 256 256" role="img">
                  <defs>
                    <radialGradient id="authArtGlow" cx="48%" cy="40%" r="62%">
                      <stop offset="0%" stopColor={activeArt.accent} stopOpacity="0.74" />
                      <stop offset="58%" stopColor={activeArt.glow} stopOpacity="0.24" />
                      <stop offset="100%" stopColor={activeArt.surface} stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="authArtGlass" x1="46" y1="34" x2="202" y2="210" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.54" />
                      <stop offset="42%" stopColor={activeArt.accent} stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
                    </linearGradient>
                    <linearGradient id="authArtLine" x1="50" y1="132" x2="204" y2="58" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stopColor={activeArt.accent} stopOpacity="0.1" />
                      <stop offset="55%" stopColor={activeArt.accent} stopOpacity="0.96" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9" />
                    </linearGradient>
                    <filter id="authArtBlur">
                      <feGaussianBlur stdDeviation="14" />
                    </filter>
                  </defs>
                  <ellipse className="auth-art-shadow" cx="128" cy="210" rx="70" ry="18" />
                  <circle className="auth-art-ambient" cx="128" cy="118" r="94" fill="url(#authArtGlow)" filter="url(#authArtBlur)" />
                  <g className="auth-art-object">
                    <path className="auth-art-glass" d="M72 46h86l48 48v96c0 12-10 22-22 22H72c-12 0-22-10-22-22V68c0-12 10-22 22-22Z" fill="url(#authArtGlass)" />
                    <path className="auth-art-fold" d="M158 46v34c0 8 6 14 14 14h34" />
                    <g className="auth-art-bars">
                      {activeArt.bars.map((height, index) => (
                        <rect
                          key={`${height}-${index}`}
                          x={82 + index * 38}
                          y={166 - height}
                          width="18"
                          height={height}
                          rx="9"
                          fill={activeArt.accent}
                          style={{ animationDelay: `${index * 0.12}s` }}
                        />
                      ))}
                    </g>
                    <polyline className="auth-art-line" points={activeArt.nodes} stroke="url(#authArtLine)" />
                    {activeArt.nodes.split(' ').map((point, index, points) => index % 2 === 0 && (
                      <circle
                        key={`${point}-${points[index + 1]}`}
                        className="auth-art-node"
                        cx={point}
                        cy={points[index + 1]}
                        r="5"
                        fill={activeArt.accent}
                      />
                    ))}
                  </g>
                </svg>
              </div>
              <div className="auth-art-caption">
                <p className="auth-caption-kicker">{artSlides[activeSlide][0]}</p>
                <p className="auth-caption-strong">{artSlides[activeSlide][1]}</p>
                <div className="auth-art-dots" role="tablist" aria-label="Select highlight">
                  {artSlides.map((slide, index) => (
                    <button
                      key={slide.join(' ')}
                      type="button"
                      className={index === activeSlide ? 'active' : ''}
                      aria-label={`Show ${slide.join(' ')}`}
                      aria-selected={index === activeSlide}
                      role="tab"
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </div>
              </div>
            </aside>

            <div className="auth-form-panel">
              <div className="auth-mobile-logo">
                <span className="auth-mobile-wordmark">
                  <span style={{ color: isDark ? '#fff' : t.onSurface }}>BITE</span>
                  <span style={{ color: t.primary }}>LOG</span>
                </span>
                <span className="auth-mobile-subtitle">Customer Management System</span>
              </div>

              <div className="auth-form-inner" style={{ textAlign: 'center' }}>
                <header className="auth-card-header">
                  <h2
                    style={{
                      color: t.onSurface,
                    }}
                  >
                    {heading}
                  </h2>
                  <p style={{ color: t.onSurfaceVariant }}>
                    {supportingText}
                  </p>
                </header>

                <main className="auth-form-enter" style={{ textAlign: 'left' }}>
                  {children}
                </main>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
