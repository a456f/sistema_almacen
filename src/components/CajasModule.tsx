import { useCallback, useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import './CajasModule.css';

interface Categoria { id: number; nombre: string; color: string; }
interface Caja {
  id: number;
  numero_caja: string;
  numero_serie: string | null;
  cantidad: number;
  marca: string | null;
  modelo: string | null;
  descripcion: string | null;
  tipo: string | null;
  uso: string | null;
  caracteristicas: string | null;
  categoria_id: number | null;
  categoria_nombre: string | null;
  categoria_color: string | null;
}
interface Stats {
  total_cajas: number;
  total_unidades: number;
  porCategoria: { nombre: string; color: string; cajas: number; unidades: number }[];
}

const emptyForm = {
  numero_caja: '', numero_serie: '', cantidad: 0, marca: '', modelo: '', descripcion: '',
  tipo: '', uso: '', caracteristicas: '', categoria_id: '' as string | number,
};

const CajasModule = () => {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detalle, setDetalle] = useState<Caja | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const cargarCajas = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), limit: '12', search, categoria: filtroCat });
    try {
      const res = await fetch(`${API_URL}/cajas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCajas(data.data);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch { notify('Error al cargar cajas', 'err'); }
  }, [page, search, filtroCat]);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cajas/stats`);
      if (res.ok) setStats(await res.json());
    } catch { /* noop */ }
  }, []);

  const cargarCategorias = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cajas/categorias`);
      if (res.ok) setCategorias(await res.json());
    } catch { /* noop */ }
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);
  useEffect(() => { cargarCajas(); }, [cargarCajas]);
  useEffect(() => { cargarStats(); }, [cargarStats]);
  useEffect(() => { setPage(1); }, [search, filtroCat]);

  const abrirNuevo = () => { setEditingId(null); setForm(emptyForm); setModalOpen(true); };
  const abrirEditar = (c: Caja) => {
    setEditingId(c.id);
    setForm({
      numero_caja: c.numero_caja, numero_serie: c.numero_serie || '', cantidad: c.cantidad, marca: c.marca || '', modelo: c.modelo || '',
      descripcion: c.descripcion || '', tipo: c.tipo || '', uso: c.uso || '',
      caracteristicas: c.caracteristicas || '', categoria_id: c.categoria_id || '',
    });
    setModalOpen(true);
  };

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `${API_URL}/cajas/${editingId}` : `${API_URL}/cajas`;
    const method = editingId ? 'PUT' : 'POST';
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, categoria_id: form.categoria_id || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setModalOpen(false);
      notify(editingId ? 'Caja actualizada' : 'Caja registrada');
      cargarCajas(); cargarStats();
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const eliminar = async (c: Caja) => {
    if (!window.confirm(`¿Eliminar la caja ${c.numero_caja}?`)) return;
    try {
      const res = await fetch(`${API_URL}/cajas/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      notify('Caja eliminada');
      cargarCajas(); cargarStats();
    } catch { notify('No se pudo eliminar', 'err'); }
  };

  return (
    <div className="cajas-module">
      {toast && <div className={`cajas-toast ${toast.type}`}>{toast.msg}</div>}

      {/* Stats */}
      <div className="cajas-stats">
        <div className="cajas-stat">
          <span>Total de cajas</span>
          <strong>{stats?.total_cajas ?? '—'}</strong>
        </div>
        <div className="cajas-stat">
          <span>Total de unidades</span>
          <strong>{stats?.total_unidades ?? '—'}</strong>
        </div>
        {stats?.porCategoria.slice(0, 4).map((c) => (
          <div className="cajas-stat" key={c.nombre} style={{ borderTopColor: c.color }}>
            <span title={c.nombre}>{c.nombre}</span>
            <strong>{c.cajas} <em>cajas</em></strong>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="cajas-toolbar">
        <div className="cajas-search">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input placeholder="Buscar por código, marca, modelo, descripción…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <button className="cajas-add" onClick={abrirNuevo}>+ Nueva caja</button>
      </div>

      {/* Tabla */}
      <div className="cajas-table-wrap">
        <table className="cajas-table">
          <thead>
            <tr>
              <th>N° Caja</th><th>S/N</th><th>Cant.</th><th>Marca</th><th>Modelo</th><th>Tipo</th><th>Categoría</th><th></th>
            </tr>
          </thead>
          <tbody>
            {cajas.length === 0 ? (
              <tr><td colSpan={8} className="cajas-empty">No hay cajas que coincidan</td></tr>
            ) : cajas.map((c) => (
              <tr key={c.id} onClick={() => setDetalle(c)}>
                <td><code>{c.numero_caja}</code></td>
                <td>{c.numero_serie ? <code style={{ background: '#f0fdf4', color: '#15803d' }}>{c.numero_serie}</code> : <span style={{ color: 'var(--text-muted)' }}>—</span>}</td>
                <td><span className="cajas-qty">{c.cantidad}</span></td>
                <td>{c.marca || '—'}</td>
                <td>{c.modelo || '—'}</td>
                <td className="cajas-tipo">{c.tipo || '—'}</td>
                <td>
                  {c.categoria_nombre
                    ? <span className="cajas-badge" style={{ background: (c.categoria_color || '#64748b') + '22', color: c.categoria_color || '#334155' }}>{c.categoria_nombre}</span>
                    : '—'}
                </td>
                <td className="cajas-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => abrirEditar(c)} title="Editar">✎</button>
                  <button className="del" onClick={() => eliminar(c)} title="Eliminar">×</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="cajas-pagination">
        <span>{total} cajas · página {page} de {totalPages}</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
        </div>
      </div>

      {/* Modal crear/editar */}
      {modalOpen && (
        <div className="cajas-overlay" onClick={() => setModalOpen(false)}>
          <div className="cajas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>{editingId ? 'Editar caja' : 'Nueva caja'}</h3>
              <button onClick={() => setModalOpen(false)}>×</button>
            </div>
            <form onSubmit={guardar} className="cajas-form">
              <div className="cajas-form-grid">
                <label><span>N° de caja *</span><input value={form.numero_caja} onChange={(e) => setForm({ ...form, numero_caja: e.target.value })} required /></label>
                <label><span>Cantidad</span><input type="number" min={0} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: Number(e.target.value) })} /></label>
                <label className="full"><span>N° de serie (S/N)</span><input placeholder="Escanea o escribe el S/N del producto" value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} /></label>
                <label><span>Marca</span><input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} /></label>
                <label><span>Modelo</span><input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} /></label>
                <label className="full"><span>Categoría</span>
                  <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="full"><span>Descripción</span><textarea rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
                <label className="full"><span>Tipo</span><input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></label>
                <label className="full"><span>Uso</span><textarea rows={2} value={form.uso} onChange={(e) => setForm({ ...form, uso: e.target.value })} /></label>
                <label className="full"><span>Características</span><textarea rows={3} value={form.caracteristicas} onChange={(e) => setForm({ ...form, caracteristicas: e.target.value })} /></label>
              </div>
              <div className="cajas-form-actions">
                <button type="button" onClick={() => setModalOpen(false)}>Cancelar</button>
                <button type="submit" className="primary">{editingId ? 'Guardar cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle */}
      {detalle && (
        <div className="cajas-overlay" onClick={() => setDetalle(null)}>
          <div className="cajas-modal detalle" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>{detalle.numero_caja} <small>· {detalle.cantidad} und.</small></h3>
              <button onClick={() => setDetalle(null)}>×</button>
            </div>
            <div className="cajas-detalle">
              {detalle.categoria_nombre && <span className="cajas-badge" style={{ background: (detalle.categoria_color || '#64748b') + '22', color: detalle.categoria_color || '#334155' }}>{detalle.categoria_nombre}</span>}
              <Field label="N° de serie" value={detalle.numero_serie} />
              <Field label="Marca" value={detalle.marca} />
              <Field label="Modelo" value={detalle.modelo} />
              <Field label="Tipo" value={detalle.tipo} />
              <Field label="Descripción" value={detalle.descripcion} />
              <Field label="Uso" value={detalle.uso} />
              <Field label="Características" value={detalle.caracteristicas} pre />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Field = ({ label, value, pre }: { label: string; value: string | null; pre?: boolean }) => {
  if (!value) return null;
  return (
    <div className="cajas-field">
      <span>{label}</span>
      <p style={pre ? { whiteSpace: 'pre-line' } : undefined}>{value}</p>
    </div>
  );
};

export default CajasModule;
