import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './CajasModule.css';

interface Usuario {
  id: number; username: string; nombre: string | null; rol: string; estado: number;
  ultimo_login: string | null; fecha_creacion: string;
}

const initialForm = { id: null as number | null, username: '', nombre: '', rol: 'admin', password: '', estado: 1 };

const UsuariosModule = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState(initialForm);
  const [busqueda, setBusqueda] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2500);
  };

  const cargar = async () => {
    try {
      const r = await fetch(`${API_URL}/usuarios`);
      if (r.ok) setUsuarios(await r.json());
    } catch { notify('Error al cargar', 'err'); }
  };
  useEffect(() => { cargar(); }, []);

  const filtrados = usuarios.filter((u) =>
    !busqueda ||
    u.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    (u.nombre || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  const guardar = async () => {
    if (!form.username.trim()) { notify('Usuario es obligatorio', 'err'); return; }
    if (!form.id && !form.password) { notify('Contraseña obligatoria al crear', 'err'); return; }
    const url = form.id ? `${API_URL}/usuarios/${form.id}` : `${API_URL}/usuarios`;
    const method = form.id ? 'PUT' : 'POST';
    try {
      const r = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Error');
      notify(form.id ? 'Usuario actualizado' : 'Usuario creado');
      setForm(initialForm);
      cargar();
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const editar = (u: Usuario) => setForm({
    id: u.id, username: u.username, nombre: u.nombre || '', rol: u.rol, password: '', estado: u.estado,
  });

  const eliminar = async (u: Usuario) => {
    if (!window.confirm(`¿Eliminar al usuario "${u.username}"?`)) return;
    try {
      const r = await fetch(`${API_URL}/usuarios/${u.id}`, { method: 'DELETE' });
      if (r.ok) { cargar(); notify('Eliminado'); }
    } catch { notify('Error', 'err'); }
  };

  return (
    <div className="cajas-module">
      {toast && <div className={`cajas-toast ${toast.type}`}>{toast.msg}</div>}

      <div className="cajas-stats">
        <div className="cajas-stat"><span>Total usuarios</span><strong>{usuarios.length}</strong></div>
        <div className="cajas-stat" style={{ borderTopColor: '#16a34a' }}><span>Activos</span><strong>{usuarios.filter(u => u.estado === 1).length}</strong></div>
        <div className="cajas-stat" style={{ borderTopColor: '#dc2626' }}><span>Inactivos</span><strong>{usuarios.filter(u => u.estado !== 1).length}</strong></div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 18, marginBottom: 16 }}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem', color: '#0f172a' }}>
          {form.id ? `Editando: ${form.username}` : 'Crear nuevo usuario'}
        </h3>
        <div className="user-form">
          <input placeholder="Usuario *" value={form.username} disabled={!!form.id}
            onChange={(e) => setForm({ ...form, username: e.target.value })} />
          <input placeholder="Nombre completo" value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            <option value="admin">Admin</option>
            <option value="operador">Operador</option>
            <option value="lector">Solo lectura</option>
          </select>
          <select value={form.estado} onChange={(e) => setForm({ ...form, estado: Number(e.target.value) })}>
            <option value={1}>Activo</option>
            <option value={0}>Inactivo</option>
          </select>
          <input type="password" placeholder={form.id ? 'Nueva contraseña (opcional)' : 'Contraseña *'} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <button className="cajas-add" onClick={guardar}>
            {form.id ? '✓ Guardar cambios' : '+ Crear usuario'}
          </button>
          {form.id && <button onClick={() => setForm(initialForm)} style={{ background: '#f1f5f9', border: '1px solid var(--border)', borderRadius: 9, padding: '0 14px', cursor: 'pointer' }}>Cancelar</button>}
        </div>
      </div>

      <input className="cajas-search-plain" placeholder="Buscar usuario por nombre o username…" value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', marginBottom: 14, fontSize: '0.9rem', outline: 'none' }} />

      <div className="prod-table-wrap">
        <table className="prod-table">
          <thead>
            <tr>
              <th>ID</th><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Último login</th><th></th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Sin usuarios</td></tr>
            ) : filtrados.map((u) => (
              <tr key={u.id} className="prod-tr">
                <td>{u.id}</td>
                <td><code className="prod-sn">{u.username}</code></td>
                <td>{u.nombre || '—'}</td>
                <td><span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{u.rol}</span></td>
                <td>{u.estado === 1
                  ? <span style={{ color: '#16a34a', fontWeight: 700, fontSize: '0.78rem' }}>● Activo</span>
                  : <span style={{ color: '#dc2626', fontWeight: 700, fontSize: '0.78rem' }}>● Inactivo</span>}
                </td>
                <td className="prod-tr-fecha">{u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Nunca'}</td>
                <td className="prod-tr-actions">
                  <button className="prod-edit-btn" onClick={() => editar(u)} title="Editar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button className="prod-del" onClick={() => eliminar(u)} title="Eliminar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosModule;
