import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  return (
    <ThemeProvider>
      <main className="min-h-screen">
        {authMode === 'login' ? (
          <Login onSwitch={() => setAuthMode('register')} />
        ) : (
          <Register onSwitch={() => setAuthMode('login')} />
        )}
      </main>
    </ThemeProvider>
  );
}

export default App;