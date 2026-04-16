import React from 'react';
import {
  ChevronRight,
  Network,
  Zap
} from 'lucide-react';
import { useTheme, getDashboardTokens } from '../../providers/ThemeProvider';
import { HoverLink } from '../../components/ui/HoverLink';

interface MainContentProps {
  isMobile: boolean;
  firstName: string;
}

export const MainContent: React.FC<MainContentProps> = ({ isMobile, firstName }) => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '40px 24px', alignItems: 'center', position: 'relative' }}>
      <div style={{ width: '100%', maxWidth: '1200px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: C.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '60px' }}>
        {/*<HoverLink color={C.onSurfaceVariant} hoverColor={C.primary}>System</HoverLink>
        <ChevronRight size={12} style={{ opacity: 0.5 }} />
        <HoverLink color={C.primary} hoverColor={C.primary} style={{ fontWeight: 700 }}>Admin Dashboard</HoverLink>*/} 
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '40px' }}>
          <div style={{ position: 'absolute', inset: -20, background: `${C.primary}1a`, filter: 'blur(40px)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', width: '160px', height: '160px', borderRadius: '50%', background: C.surfaceContainer, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.outlineVariant}22`, transition: 'background-color 0.3s ease' }}>
             <Network size={64} style={{ color: C.primary, opacity: 0.9 }} />
             <div style={{ position: 'absolute', bottom: '5px', right: '5px', width: '48px', height: '48px', borderRadius: '12px', backgroundColor: isDark ? '#002a31' : '#fff', border: `1px solid ${C.primary}4d`, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
               <Zap size={24} fill={isDark ? C.secondary : C.primary} color={isDark ? C.secondary : C.primary} />
             </div>
          </div>
        </div>
        <h2 style={{ fontFamily: C.font.headline, fontSize: isMobile ? '32px' : '48px', fontWeight: 900, color: isDark ? '#fff' : '#000', marginBottom: '16px' }}>
          Welcome back, {firstName}
        </h2>
        <p style={{ fontFamily: C.font.body, fontSize: '16px', color: C.onSurfaceVariant, maxWidth: '560px', lineHeight: 1.6 }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      </div>
    </div>
  );
};