import React from 'react';
import { Key, ShieldCheck } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { getDashboardTokens } from '../elements/DashboardElements';

/**
 * LoadingSpinnerPage — Page
 * Full-page authentication loading state displayed between login
 * and redirect to the dashboard. Uses the shared dashboard design
 * tokens to stay visually consistent with the rest of the app.
 */
const LoadingSpinnerPage: React.FC = () => {
  const { isDark } = useTheme();
  const C = getDashboardTokens(isDark);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: C.surface, color: C.onSurface, fontFamily: C.font.body }}
    >
      {/* ─── Global Styles & Keyframes ─── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&family=Inter:wght@400;500;600&display=swap');

        .spinner-outer {
          border-top-color: ${C.primary};
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .loading-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .nebula-glow {
          background: radial-gradient(circle at 50% 50%, ${C.primary}14 0%, ${C.surface}00 70%);
        }
      `}</style>

      {/* Atmospheric Background Decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none nebula-glow">
        <div className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full opacity-10 blur-[150px]" style={{ backgroundColor: C.primaryContainer }}></div>
        <div className="absolute top-[40%] -right-[15%] w-[60%] h-[60%] rounded-full opacity-10 blur-[120px]" style={{ backgroundColor: C.secondary }}></div>
        <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full opacity-5 blur-[100px]" style={{ backgroundColor: C.primary }}></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">

        {/* Header / Logo Section */}
        <header className="mb-16 text-center">
          <h1
            className="text-2xl font-extrabold tracking-tight transition-colors duration-300"
            style={{ fontFamily: C.font.headline, color: isDark ? C.onSurface : C.primary }}
          >
            BiteLog
          </h1>
        </header>

        {/* Main Content */}
        <main className="w-full flex flex-col items-center">

          {/* Icon / Loading Indicator */}
          <div className="relative w-24 h-24 mb-10 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 opacity-10" style={{ borderColor: C.primary }}></div>
            <div className="spinner-outer absolute inset-0 rounded-full border-4 border-transparent"></div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center loading-pulse transition-colors duration-300"
              style={{ backgroundColor: `${C.primary}1a` }}
            >
              <Key size={28} style={{ color: C.primary }} fill={isDark ? C.primary : 'none'} />
            </div>
          </div>

          {/* Status Text */}
          <div className="text-center space-y-4">
            <h2
              className="text-2xl font-bold transition-colors duration-300"
              style={{ fontFamily: C.font.headline, color: C.onSurface }}
            >
              Authenticating...
            </h2>
            <p className="max-w-xs mx-auto leading-relaxed text-sm opacity-60" style={{ color: C.onSurfaceVariant }}>
              Verifying your credentials. This won't take long.
            </p>
          </div>

          {/* Status Card / Progress Bar */}
          <div
            className="mt-12 w-full backdrop-blur-3xl border rounded-2xl p-6 flex items-center space-x-4 shadow-2xl transition-all duration-300"
            style={{
                backgroundColor: isDark ? `${C.surfaceContainerHigh}33` : '#fff',
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${C.secondary}1a` }}
            >
              <ShieldCheck size={20} style={{ color: C.secondary }} />
            </div>
            <div className="flex-1">
              <div
                className="h-1.5 w-full rounded-full overflow-hidden"
                style={{ backgroundColor: C.surfaceContainerLow }}
              >
                <div
                  className="h-full w-2/3 rounded-full"
                  style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }}
                ></div>
              </div>
              <p
                className="text-[10px] uppercase tracking-[0.15em] font-bold mt-3 opacity-40"
                style={{ color: C.onSurfaceVariant }}
              >
                Secure Connection Established
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-24 text-center">
          <p className="text-[10px] font-medium tracking-wider uppercase opacity-30" style={{ color: C.onSurfaceVariant }}>
            © 2026 BiteLog. All rights reserved.
          </p>
        </footer>
      </div>

      {/* Bottom Accent Line */}
      <div
        className="fixed bottom-0 left-0 w-full h-[2px] opacity-30"
        style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.secondary})` }}
      ></div>
    </div>
  );
};

export default LoadingSpinnerPage;
