import { useState } from 'react';
import type { User } from '../services/authService';
import CajasModule from '../components/CajasModule';
import CatalogosModule from '../components/CatalogosModule';
import UsuariosModule from '../components/UsuariosModule';
import './Dashboard.css';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  justLoggedIn?: boolean;
}

type Pagina = 'cajas' | 'catalogos' | 'usuarios';

const Dashboard = ({ user, onLogout, justLoggedIn = false }: DashboardProps) => {
  const initials = (user.nombre || user.username).slice(0, 2).toUpperCase();
  const [pagina, setPagina] = useState<Pagina>('cajas');

  const menu: { id: Pagina; label: string; sub: string; icon: React.ReactNode }[] = [
    {
      id: 'cajas', label: 'Registro de Cajas', sub: 'Cajas, productos e historial',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    },
    {
      id: 'catalogos', label: 'Catálogos', sub: 'Marcas, modelos, tipos',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    },
    {
      id: 'usuarios', label: 'Usuarios', sub: 'Cuentas y accesos',
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    },
  ];

  const titulos: Record<Pagina, { titulo: string; subtitulo: string }> = {
    cajas: { titulo: 'Control de Inventario', subtitulo: 'Registro General de Cajas' },
    catalogos: { titulo: 'Catálogos', subtitulo: 'Marcas, modelos y tipos disponibles' },
    usuarios: { titulo: 'Usuarios', subtitulo: 'Gestión de cuentas y accesos' },
  };

  return (
    <div className={`inv-shell ${justLoggedIn ? 'inv-welcome' : ''}`}>
      <aside className="inv-sidebar">
        <div className="inv-brand">
          <div className="inv-brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
          </div>
          <span>Inventario</span>
        </div>

        <nav className="inv-menu">
          {menu.map((m) => (
            <button
              key={m.id}
              className={`inv-menu-item ${pagina === m.id ? 'active' : ''}`}
              onClick={() => setPagina(m.id)}
              title={m.sub}
            >
              {m.icon}
              {m.label}
            </button>
          ))}
        </nav>

        <button className="inv-logout" onClick={onLogout}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Cerrar sesión
        </button>
      </aside>

      <main className="inv-main">
        <header className="inv-topbar">
          <div>
            <h1>{titulos[pagina].titulo}</h1>
            <span>{titulos[pagina].subtitulo}</span>
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
          {pagina === 'cajas' && <CajasModule />}
          {pagina === 'catalogos' && <CatalogosModule />}
          {pagina === 'usuarios' && <UsuariosModule />}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
