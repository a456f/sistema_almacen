import type { User } from '../services/authService';
import CajasModule from '../components/CajasModule';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  justLoggedIn?: boolean;
}

const Dashboard = ({ user, onLogout, justLoggedIn = false }: DashboardProps) => {
  const initials = (user.nombre || user.username).slice(0, 2).toUpperCase();

  return (
    <div className={`inv-shell ${justLoggedIn ? 'inv-welcome' : ''}`}>
      <aside className="inv-sidebar">
        <div className="inv-brand">
          <div className="inv-brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </div>
          <span>Inventario</span>
        </div>

        <nav className="inv-menu">
          <button className="inv-menu-item active">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Registro de Cajas
          </button>
        </nav>

        <button className="inv-logout" onClick={onLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Cerrar sesión
        </button>
      </aside>

      <main className="inv-main">
        <header className="inv-topbar">
          <div>
            <h1>Control de Inventario</h1>
            <span>Registro General de Cajas</span>
          </div>
          <div className="inv-user">
            <div className="inv-user-info">
              <strong>{user.nombre || user.username}</strong>
              <span>{user.rol}</span>
            </div>
            <div className="inv-avatar">{initials}</div>
          </div>
        </header>

        <div className="inv-content">
          <CajasModule />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
