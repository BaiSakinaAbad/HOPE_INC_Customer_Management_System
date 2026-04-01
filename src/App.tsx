import { useState } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/AuthContext';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';

const AppContent = () => {
  const { user, signOut } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Welcome, {user.email}!</h1>
        <button onClick={signOut} className="px-4 py-2 bg-red-500 text-white rounded">Sign Out</button>
      </div>
    );
  }

  return authMode === 'login' ? (
    <LoginPage onSwitch={() => setAuthMode('register')} />
  ) : (
    <RegisterPage onSwitch={() => setAuthMode('login')} />
  );
};

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <main className="min-h-screen">
          <AppContent />
        </main>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;