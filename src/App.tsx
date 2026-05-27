import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import type { User } from './services/authService';

const SESSION_KEY = 'inventario_session';
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 días

function App() {
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const session = JSON.parse(raw);
      if (Date.now() > session.expiresAt) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return session.user as User;
    } catch {
      return null;
    }
  });

  const handleLogin = (userData: User) => {
    setUser(userData);
    setJustLoggedIn(true);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user: userData, expiresAt: Date.now() + SESSION_DURATION }));
  };

  const handleLogout = () => {
    setUser(null);
    setJustLoggedIn(false);
    localStorage.removeItem(SESSION_KEY);
  };

  return user
    ? <Dashboard user={user} onLogout={handleLogout} justLoggedIn={justLoggedIn} />
    : <Login onLogin={handleLogin} />;
}

export default App;
