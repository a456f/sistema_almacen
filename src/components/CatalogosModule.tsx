import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './CajasModule.css';

type Cat = 'marcas' | 'modelos' | 'tipos';
interface Item { id: number; nombre: string; }

const CatalogosModule = () => {
  const [tab, setTab] = useState<Cat>('marcas');
  const [marcas, setMarcas] = useState<Item[]>([]);
  const [modelos, setModelos] = useState<Item[]>([]);
  const [tipos, setTipos] = useState<Item[]>([]);
  const [nuevo, setNuevo] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500);
  };

  const cargar = async () => {
    try {
      const r = await fetch(`${API_URL}/catalogos`);
      if (r.ok) {
        const d = await r.json();
        setMarcas(d.marcas || []); setModelos(d.modelos || []); setTipos(d.tipos || []);
      }
    } catch {}
  };
  useEffect(() => { cargar(); }, []);

  const items = tab === 'marcas' ? marcas : tab === 'modelos' ? modelos : tipos;
  const filtrados = items.filter((i) => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  const agregar = async () => {
    if (!nuevo.trim()) return;
    try {
      const r = await fetch(`${API_URL}/catalogos/${tab}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevo.trim() }),
      });
      if (r.ok) { setNuevo(''); cargar(); notify('Agregado'); }
    } catch { notify('Error al agregar', 'err'); }
  };

  const eliminar = async (id: number, nombre: string) => {
    if (!window.confirm(`¿Eliminar "${nombre}" del catálogo de ${tab}?`)) return;
    try {
      const r = await fetch(`${API_URL}/catalogos/${tab}/${id}`, { method: 'DELETE' });
      if (r.ok) { cargar(); notify('Eliminado'); }
    } catch { notify('Error', 'err'); }
  };

  return (
    <div className="cajas-module">
      {toast && <div className={`cajas-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="cajas-stats">
        <div className="cajas-stat"><span>Marcas</span><strong>{marcas.length}</strong></div>
        <div className="cajas-stat"><span>Modelos</span><strong>{modelos.length}</strong></div>
        <div className="cajas-stat"><span>Tipos</span><strong>{tipos.length}</strong></div>
      </div>

      <div className="cat-tabs" style={{ background: 'var(--bg-card)', borderRadius: '14px 14px 0 0', padding: '6px 14px 0' }}>
        {(['marcas', 'modelos', 'tipos'] as const).map((t) => (
          <button key={t} className={`cat-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '18px' }}>
        <div className="cat-add" style={{ marginBottom: 16 }}>
          <input placeholder={`Agregar nuevo ${tab.slice(0, -1)}…`} value={nuevo}
            onChange={(e) => setNuevo(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') agregar(); }} />
          <button onClick={agregar}>+ Agregar</button>
        </div>

        <input className="cajas-search-plain" placeholder={`Buscar en ${tab}…`} value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: 9, border: '1.5px solid var(--border)', marginBottom: 14, fontSize: '0.88rem', outline: 'none' }} />

        <ul className="cat-list">
          {filtrados.length === 0 ? (
            <li className="cat-empty">{busqueda ? `Sin resultados para "${busqueda}"` : `No hay ${tab} registrados`}</li>
          ) : filtrados.map((it) => (
            <li key={it.id} className="cat-item">
              <span>{it.nombre}</span>
              <button onClick={() => eliminar(it.id, it.nombre)} title="Eliminar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CatalogosModule;
