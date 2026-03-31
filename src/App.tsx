import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        {authMode === 'login' ? (
          <LoginPage onSwitch={() => setAuthMode('register')} />
        ) : (
          <RegisterPage onSwitch={() => setAuthMode('login')} />
        )}
      </main>
    </ThemeProvider>
  );
}

export default App;