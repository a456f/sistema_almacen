import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, BASE_URL } from '../config/api';
import './CajasModule.css';

interface Categoria { id: number; nombre: string; color: string; }
interface ImagenProducto { id: number; ruta: string; }
interface Producto {
  id: number;
  caja_id: number;
  nombre: string;
  numero_serie: string | null;
  estado: string;
  imagenes?: ImagenProducto[];
}
interface Caja {
  id: number;
  numero_caja: string;
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
  estado: string;
  imagen: string | null;
  total_productos?: number;
}
interface Stats {
  total_cajas: number;
  total_unidades: number;
  porCategoria: { nombre: string; color: string; cajas: number; unidades: number }[];
  porEstado?: { estado: string; total: number }[];
}

const ESTADOS = ['ACTIVO', 'REVISION', 'SUSPENDIDO', 'NO_HABIDO'] as const;
const ESTADO_COLOR: Record<string, string> = {
  ACTIVO: '#16a34a',
  REVISION: '#f59e0b',
  SUSPENDIDO: '#6b7280',
  NO_HABIDO: '#dc2626',
};

const fileUrl = (p: string | null) => (p ? `${BASE_URL}/${p}` : '');

const Icon = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>,
  box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  image: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
};

const emptyCajaForm = {
  numero_caja: '', marca: '', modelo: '', descripcion: '',
  tipo: '', uso: '', caracteristicas: '', categoria_id: '' as string | number,
  estado: 'ACTIVO',
};
const emptyProductoForm = { nombre: '', numero_serie: '', estado: 'ACTIVO' };

const CajasModule = () => {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [search, setSearch] = useState('');
  const [filtroCat, setFiltroCat] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal caja (crear / editar)
  const [cajaModal, setCajaModal] = useState(false);
  const [cajaEditingId, setCajaEditingId] = useState<number | null>(null);
  const [cajaForm, setCajaForm] = useState(emptyCajaForm);
  const [cajaImg, setCajaImg] = useState<File | null>(null);

  // Detalle caja con productos
  const [detalleCaja, setDetalleCaja] = useState<Caja | null>(null);
  const [productos, setProductos] = useState<Producto[]>([]);

  // Modal producto
  const [prodModal, setProdModal] = useState(false);
  const [prodForm, setProdForm] = useState(emptyProductoForm);
  const [prodImgs, setProdImgs] = useState<File[]>([]);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const prodImgInputRef = useRef<HTMLInputElement>(null);

  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  const cargarCajas = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page), limit: '12',
      search, categoria: filtroCat, estado: filtroEstado,
    });
    try {
      const res = await fetch(`${API_URL}/cajas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCajas(data.data); setTotalPages(data.totalPages); setTotal(data.total);
      }
    } catch { notify('Error al cargar cajas', 'err'); }
  }, [page, search, filtroCat, filtroEstado]);

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
  useEffect(() => { setPage(1); }, [search, filtroCat, filtroEstado]);

  const abrirNuevaCaja = () => {
    setCajaEditingId(null);
    setCajaForm(emptyCajaForm);
    setCajaImg(null);
    setCajaModal(true);
  };
  const abrirEditarCaja = (c: Caja) => {
    setCajaEditingId(c.id);
    setCajaForm({
      numero_caja: c.numero_caja, marca: c.marca || '', modelo: c.modelo || '',
      descripcion: c.descripcion || '', tipo: c.tipo || '', uso: c.uso || '',
      caracteristicas: c.caracteristicas || '', categoria_id: c.categoria_id || '',
      estado: c.estado || 'ACTIVO',
    });
    setCajaImg(null);
    setCajaModal(true);
  };

  const guardarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = cajaEditingId ? `${API_URL}/cajas/${cajaEditingId}` : `${API_URL}/cajas`;
    const method = cajaEditingId ? 'PUT' : 'POST';

    const fd = new FormData();
    Object.entries(cajaForm).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    if (cajaImg) fd.append('imagen', cajaImg);

    try {
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setCajaModal(false);
      notify(cajaEditingId ? 'Caja actualizada' : 'Caja registrada');
      cargarCajas(); cargarStats();
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const eliminarCaja = async (c: Caja) => {
    if (!window.confirm(`¿Eliminar la caja ${c.numero_caja} y todos sus productos?`)) return;
    try {
      const res = await fetch(`${API_URL}/cajas/${c.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      notify('Caja eliminada');
      cargarCajas(); cargarStats();
    } catch { notify('No se pudo eliminar', 'err'); }
  };

  const abrirDetalle = async (c: Caja) => {
    setDetalleCaja(c);
    try {
      const res = await fetch(`${API_URL}/productos/caja/${c.id}`);
      if (res.ok) setProductos(await res.json());
      else setProductos([]);
    } catch { setProductos([]); }
  };

  const abrirNuevoProducto = () => {
    setProdForm(emptyProductoForm);
    setProdImgs([]);
    setProdModal(true);
  };
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalleCaja) return;
    const fd = new FormData();
    fd.append('caja_id', String(detalleCaja.id));
    fd.append('nombre', prodForm.nombre);
    fd.append('numero_serie', prodForm.numero_serie);
    fd.append('estado', prodForm.estado);
    prodImgs.forEach((f) => fd.append('fotos', f));

    try {
      const res = await fetch(`${API_URL}/productos`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setProdModal(false);
      notify('Producto registrado');
      abrirDetalle(detalleCaja); // recarga lista
      cargarCajas(); cargarStats();
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const eliminarProducto = async (p: Producto) => {
    if (!detalleCaja) return;
    if (!window.confirm(`¿Eliminar producto "${p.nombre}"?`)) return;
    try {
      const res = await fetch(`${API_URL}/productos/${p.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      notify('Producto eliminado');
      abrirDetalle(detalleCaja);
      cargarCajas(); cargarStats();
    } catch { notify('No se pudo eliminar', 'err'); }
  };

  const estadoBadge = (estado: string) => (
    <span className="cajas-estado" style={{
      background: ESTADO_COLOR[estado] + '22',
      color: ESTADO_COLOR[estado] || '#334155'
    }}>{estado.replace('_', ' ')}</span>
  );

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
          {Icon.search}
          <input placeholder="Buscar por código, marca, modelo, S/N o nombre de producto…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select value={filtroCat} onChange={(e) => setFiltroCat(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
        <button className="cajas-add" onClick={abrirNuevaCaja}>{Icon.plus} Nueva caja</button>
      </div>

      {/* Tabla */}
      <div className="cajas-table-wrap">
        <table className="cajas-table">
          <thead>
            <tr>
              <th></th><th>N° Caja</th><th>Marca</th><th>Modelo</th><th>Tipo</th>
              <th>Categoría</th><th>Estado</th><th>Cant.</th><th>Prod.</th><th></th>
            </tr>
          </thead>
          <tbody>
            {cajas.length === 0 ? (
              <tr><td colSpan={10} className="cajas-empty">No hay cajas que coincidan</td></tr>
            ) : cajas.map((c) => (
              <tr key={c.id} onClick={() => abrirDetalle(c)}>
                <td>
                  {c.imagen
                    ? <img src={fileUrl(c.imagen)} alt="" className="cajas-thumb" />
                    : <div className="cajas-thumb placeholder">{Icon.box}</div>}
                </td>
                <td><code>{c.numero_caja}</code></td>
                <td>{c.marca || '—'}</td>
                <td>{c.modelo || '—'}</td>
                <td className="cajas-tipo">{c.tipo || '—'}</td>
                <td>
                  {c.categoria_nombre
                    ? <span className="cajas-badge" style={{ background: (c.categoria_color || '#64748b') + '22', color: c.categoria_color || '#334155' }}>{c.categoria_nombre}</span>
                    : '—'}
                </td>
                <td>{estadoBadge(c.estado)}</td>
                <td><span className="cajas-qty">{c.cantidad}</span></td>
                <td>{c.total_productos ?? 0}</td>
                <td className="cajas-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => abrirEditarCaja(c)} title="Editar">{Icon.edit}</button>
                  <button className="del" onClick={() => eliminarCaja(c)} title="Eliminar">{Icon.trash}</button>
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

      {/* Modal CRUD caja */}
      {cajaModal && (
        <div className="cajas-overlay" onClick={() => setCajaModal(false)}>
          <div className="cajas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>{cajaEditingId ? 'Editar caja' : 'Nueva caja'}</h3>
              <button onClick={() => setCajaModal(false)}>{Icon.close}</button>
            </div>
            <form onSubmit={guardarCaja} className="cajas-form">
              <div className="cajas-form-grid">
                <label><span>N° de caja *</span><input value={cajaForm.numero_caja} onChange={(e) => setCajaForm({ ...cajaForm, numero_caja: e.target.value })} required /></label>
                <label><span>Estado</span>
                  <select value={cajaForm.estado} onChange={(e) => setCajaForm({ ...cajaForm, estado: e.target.value })}>
                    {ESTADOS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label><span>Marca</span><input value={cajaForm.marca} onChange={(e) => setCajaForm({ ...cajaForm, marca: e.target.value })} /></label>
                <label><span>Modelo</span><input value={cajaForm.modelo} onChange={(e) => setCajaForm({ ...cajaForm, modelo: e.target.value })} /></label>
                <label className="full"><span>Categoría</span>
                  <select value={cajaForm.categoria_id} onChange={(e) => setCajaForm({ ...cajaForm, categoria_id: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label className="full"><span>Imagen (opcional)</span>
                  <input type="file" accept="image/*" onChange={(e) => setCajaImg(e.target.files?.[0] || null)} />
                </label>
                <label className="full"><span>Descripción</span><textarea rows={2} value={cajaForm.descripcion} onChange={(e) => setCajaForm({ ...cajaForm, descripcion: e.target.value })} /></label>
                <label className="full"><span>Tipo</span><input value={cajaForm.tipo} onChange={(e) => setCajaForm({ ...cajaForm, tipo: e.target.value })} /></label>
                <label className="full"><span>Características</span><textarea rows={3} value={cajaForm.caracteristicas} onChange={(e) => setCajaForm({ ...cajaForm, caracteristicas: e.target.value })} /></label>
              </div>
              <div className="cajas-form-actions">
                <button type="button" onClick={() => setCajaModal(false)}>Cancelar</button>
                <button type="submit" className="primary">{cajaEditingId ? 'Guardar cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal detalle caja con productos */}
      {detalleCaja && (
        <div className="cajas-overlay" onClick={() => setDetalleCaja(null)}>
          <div className="cajas-modal detalle wide" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>{detalleCaja.numero_caja} <small>· {detalleCaja.cantidad} und.</small></h3>
              <button onClick={() => setDetalleCaja(null)}>{Icon.close}</button>
            </div>
            <div className="cajas-detalle">
              <div className="caja-detalle-top">
                {detalleCaja.imagen && <img src={fileUrl(detalleCaja.imagen)} alt="" className="caja-img-grande" />}
                <div className="caja-detalle-info">
                  {estadoBadge(detalleCaja.estado)}
                  {detalleCaja.categoria_nombre && <span className="cajas-badge" style={{ background: (detalleCaja.categoria_color || '#64748b') + '22', color: detalleCaja.categoria_color || '#334155' }}>{detalleCaja.categoria_nombre}</span>}
                  <Field label="Marca" value={detalleCaja.marca} />
                  <Field label="Modelo" value={detalleCaja.modelo} />
                  <Field label="Tipo" value={detalleCaja.tipo} />
                </div>
              </div>

              {detalleCaja.descripcion && <Field label="Descripción" value={detalleCaja.descripcion} />}
              {detalleCaja.caracteristicas && <Field label="Características" value={detalleCaja.caracteristicas} pre />}

              <div className="prod-section-head">
                <h4>Productos ({productos.length})</h4>
                <button className="cajas-add small" onClick={abrirNuevoProducto}>{Icon.plus} Agregar producto</button>
              </div>

              {productos.length === 0 ? (
                <p className="prod-empty">Aún no hay productos en esta caja</p>
              ) : (
                <div className="prod-list">
                  {productos.map((p) => (
                    <div key={p.id} className="prod-card">
                      <div className="prod-imgs">
                        {p.imagenes && p.imagenes.length > 0
                          ? p.imagenes.slice(0, 3).map((im) => <img key={im.id} src={fileUrl(im.ruta)} alt="" />)
                          : <div className="prod-img-ph">{Icon.image}</div>}
                      </div>
                      <div className="prod-body">
                        <div className="prod-head">
                          <strong>{p.nombre}</strong>
                          {estadoBadge(p.estado)}
                        </div>
                        {p.numero_serie && <code>S/N: {p.numero_serie}</code>}
                      </div>
                      <button className="prod-del" onClick={() => eliminarProducto(p)} title="Eliminar producto">{Icon.trash}</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal nuevo producto */}
      {prodModal && detalleCaja && (
        <div className="cajas-overlay" onClick={() => setProdModal(false)}>
          <div className="cajas-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>Nuevo producto en {detalleCaja.numero_caja}</h3>
              <button onClick={() => setProdModal(false)}>{Icon.close}</button>
            </div>
            <form onSubmit={guardarProducto} className="cajas-form">
              <div className="cajas-form-grid">
                <label className="full"><span>Nombre del producto *</span>
                  <input value={prodForm.nombre} onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })} required />
                </label>
                <label><span>N° de serie (S/N)</span>
                  <input placeholder="Escanea desde el app" value={prodForm.numero_serie} onChange={(e) => setProdForm({ ...prodForm, numero_serie: e.target.value })} />
                </label>
                <label><span>Estado</span>
                  <select value={prodForm.estado} onChange={(e) => setProdForm({ ...prodForm, estado: e.target.value })}>
                    {ESTADOS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="full"><span>Imágenes (puedes elegir varias)</span>
                  <input ref={prodImgInputRef} type="file" accept="image/*" multiple
                    onChange={(e) => setProdImgs(Array.from(e.target.files || []))} />
                  {prodImgs.length > 0 && <small>{prodImgs.length} archivo(s) seleccionados</small>}
                </label>
              </div>
              <div className="cajas-form-actions">
                <button type="button" onClick={() => setProdModal(false)}>Cancelar</button>
                <button type="submit" className="primary">Registrar producto</button>
              </div>
            </form>
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
