import { useCallback, useEffect, useRef, useState } from 'react';
import { API_URL, BASE_URL } from '../config/api';
import './CajasModule.css';
import { resizeImageFiles } from '../utils/image';

interface Categoria { id: number; nombre: string; color: string; }
interface ImagenItem { id: number; ruta: string; }
interface Producto {
  id: number; caja_id: number; cantidad: number; nombre: string;
  numero_serie: string | null; categoria_id: number | null;
  categoria_nombre?: string | null; categoria_color?: string | null;
  marca: string | null; modelo: string | null; tipo: string | null;
  descripcion: string | null; uso: string | null; caracteristicas: string | null;
  estado: string;
  imagenes?: ImagenItem[];
}
interface Caja {
  id: number;
  codigo_qr: string;
  cantidad: number;
  estado: string;
  detalles: string | null;
  portada?: string | null;
  total_productos?: number;
  imagenes?: ImagenItem[];
  productos?: Producto[];
}
interface HistorialEntry {
  id: number;
  entidad: string;
  entidad_id: number;
  accion: string;
  descripcion: string | null;
  fecha: string;
}
interface Stats {
  total_cajas: number;
  total_unidades: number;
  porEstado: { estado: string; total: number }[];
  porCategoria: { nombre: string; color: string; productos: number; unidades: number }[];
}

const ESTADOS_CAJA = ['ACTIVO', 'REVISION', 'SUSPENDIDO', 'NO_HABIDO'] as const;
const ESTADOS_PROD = ['ACTIVO', 'AGREGADO', 'RETIRADO', 'NO_HABIDO'] as const;
const ESTADO_COLOR: Record<string, string> = {
  ACTIVO: '#16a34a', REVISION: '#f59e0b', SUSPENDIDO: '#6b7280',
  NO_HABIDO: '#dc2626', AGREGADO: '#2563eb', RETIRADO: '#94a3b8',
};
const fileUrl = (p?: string | null) => (p ? `${BASE_URL}/${p}` : '');

const Icon = {
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>,
  box: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  close: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  image: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  qr: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><line x1="14" y1="14" x2="14" y2="17"/><line x1="17" y1="14" x2="17" y2="20"/><line x1="20" y1="14" x2="20" y2="17"/><line x1="14" y1="20" x2="20" y2="20"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
};

const emptyCajaForm = { codigo_qr: '', estado: 'ACTIVO', detalles: '' };
const emptyProdForm = {
  nombre: '', numero_serie: '', categoria_id: '' as string | number,
  marca: '', modelo: '', tipo: '', descripcion: '', uso: '', caracteristicas: '',
  estado: 'ACTIVO', cantidad: 1,
};

const CajasModule = () => {
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchInput, setSearchInput] = useState(''); // input crudo
  const [search, setSearch] = useState('');           // valor debounced
  const [filtroEstado, setFiltroEstado] = useState('');
  const [cargandoCajas, setCargandoCajas] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Caja
  const [cajaModal, setCajaModal] = useState(false);
  const [cajaEditingId, setCajaEditingId] = useState<number | null>(null);
  const [cajaForm, setCajaForm] = useState(emptyCajaForm);
  const [cajaImgs, setCajaImgs] = useState<File[]>([]);

  // Vista: 'lista' (grid de cajas) o 'detalle' (página completa de una caja)
  const [vista, setVista] = useState<'lista' | 'detalle'>('lista');
  // Detalle caja con productos
  const [detalleCaja, setDetalleCaja] = useState<Caja | null>(null);
  const [historial, setHistorial] = useState<HistorialEntry[]>([]);
  const [verHistorial, setVerHistorial] = useState(false);
  // Historial por producto (uno expandido a la vez)
  const [prodHistId, setProdHistId] = useState<number | null>(null);
  const [prodHist, setProdHist] = useState<HistorialEntry[]>([]);
  // Productos paginados de la caja abierta
  const [productosCaja, setProductosCaja] = useState<Producto[]>([]);
  const [productosTotal, setProductosTotal] = useState(0);
  const [productosPage, setProductosPage] = useState(1);
  const [productosTotalPages, setProductosTotalPages] = useState(1);
  const PRODS_LIMIT = 10;
  // Cache de detalles ya cargados (para prefetch en hover)
  const detalleCache = useRef<Map<number, { caja: Caja; hist: HistorialEntry[]; ts: number }>>(new Map());
  // Visor de imágenes (lightbox)
  const [viewer, setViewer] = useState<{ urls: string[]; titulos?: string[]; index: number } | null>(null);
  const abrirViewer = (urls: string[], index: number, titulos?: string[]) => setViewer({ urls, index, titulos });

  // Producto
  const [prodModal, setProdModal] = useState(false);
  const [prodForm, setProdForm] = useState(emptyProdForm);
  const [prodImgs, setProdImgs] = useState<File[]>([]);
  const [verMasDetalles, setVerMasDetalles] = useState(false);

  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);
  const [confirmar, setConfirmar] = useState<{
    titulo: string; mensaje: string; onOk: () => void; peligro?: boolean;
  } | null>(null);
  const pedirConfirm = (titulo: string, mensaje: string, onOk: () => void, peligro = true) =>
    setConfirmar({ titulo, mensaje, onOk, peligro });
  const notify = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 2800);
  };

  const cargarCajas = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page), limit: '12', search, estado: filtroEstado,
    });
    setCargandoCajas(true);
    try {
      const res = await fetch(`${API_URL}/cajas?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCajas(data.data); setTotalPages(data.totalPages); setTotal(data.total);
      }
    } catch { notify('Error al cargar cajas', 'err'); }
    finally { setCargandoCajas(false); }
  }, [page, search, filtroEstado]);

  // Debounce de la búsqueda (350ms sin escribir → dispara una sola request)
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(searchInput), 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchInput]);

  const cargarCategorias = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cajas/categorias`);
      if (res.ok) setCategorias(await res.json());
    } catch {}
  }, []);

  const cargarStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/cajas/stats`);
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  useEffect(() => { cargarCategorias(); }, [cargarCategorias]);
  useEffect(() => { cargarCajas(); }, [cargarCajas]);
  useEffect(() => { cargarStats(); }, [cargarStats]);
  useEffect(() => { setPage(1); }, [search, filtroEstado]);

  const abrirNuevaCaja = async () => {
    // Sugerir QR automáticamente
    let qr = '';
    try {
      const res = await fetch(`${API_URL}/cajas/siguiente-qr`);
      if (res.ok) qr = (await res.json()).codigo_qr;
    } catch {}
    setCajaEditingId(null);
    setCajaForm({ ...emptyCajaForm, codigo_qr: qr });
    setCajaImgs([]);
    setCajaModal(true);
  };
  const abrirEditarCaja = (c: Caja) => {
    setCajaEditingId(c.id);
    setCajaForm({ codigo_qr: c.codigo_qr, estado: c.estado, detalles: c.detalles || '' });
    setCajaImgs([]);
    setCajaModal(true);
  };

  const guardarCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !cajaEditingId;
    const url = cajaEditingId ? `${API_URL}/cajas/${cajaEditingId}` : `${API_URL}/cajas`;
    const method = cajaEditingId ? 'PUT' : 'POST';
    const fd = new FormData();
    fd.append('codigo_qr', cajaForm.codigo_qr);
    fd.append('estado', cajaForm.estado);
    fd.append('detalles', cajaForm.detalles);
    cajaImgs.forEach((f) => fd.append('imagenes', f));
    try {
      const res = await fetch(url, { method, body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setCajaModal(false);
      notify(isNew ? 'Caja registrada' : 'Caja actualizada');
      cargarCajas(); cargarStats();
      // Si es nueva, abre el detalle (sin forzar modal de producto)
      if (isNew && data.id) await abrirDetalle(data.id);
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const eliminarCaja = (c: Caja) => pedirConfirm(
    'Eliminar caja',
    `¿Eliminar la caja ${c.codigo_qr} y todos sus productos? Esta acción no se puede deshacer.`,
    async () => {
      // Optimistic: quitar del grid de inmediato
      setCajas((prev) => prev.filter((x) => x.id !== c.id));
      try {
        const res = await fetch(`${API_URL}/cajas/${c.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        notify('Caja eliminada');
        cargarStats();
      } catch {
        notify('No se pudo eliminar', 'err');
        cargarCajas(); // rollback
      }
    }
  );

  // Prefetch silencioso (al pasar el mouse sobre una caja)
  const prefetchDetalle = (id: number) => {
    const c = detalleCache.current.get(id);
    if (c && Date.now() - c.ts < 30000) return; // cache vivo 30s
    Promise.all([
      fetch(`${API_URL}/cajas/${id}`).then(r => r.ok ? r.json() : null),
      fetch(`${API_URL}/cajas/${id}/historial`).then(r => r.ok ? r.json() : []),
    ]).then(([caja, hist]) => {
      if (caja) detalleCache.current.set(id, { caja, hist, ts: Date.now() });
    }).catch(() => {});
  };

  const cargarProductosCaja = async (cajaId: number, page = 1) => {
    try {
      const url = `${API_URL}/productos/caja/${cajaId}?page=${page}&limit=${PRODS_LIMIT}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProductosCaja(data.data || []);
        setProductosTotal(data.total || 0);
        setProductosPage(data.page || 1);
        setProductosTotalPages(data.totalPages || 1);
      }
    } catch {}
  };

  const volverALista = () => {
    setVista("lista");
    setDetalleCaja(null);
    setProductosCaja([]);
    setProductosTotal(0);
    setProductosPage(1);
    setHistorial([]);
    window.scrollTo({ top: 0 });
  };

  const abrirDetalle = async (id: number) => {
    setVista("detalle");
    setVerHistorial(false);
    window.scrollTo({ top: 0 });
    // Si tenemos cache fresco, mostramos al instante
    const cached = detalleCache.current.get(id);
    if (cached && Date.now() - cached.ts < 30000) {
      setDetalleCaja(cached.caja);
      setHistorial(cached.hist);
      cargarProductosCaja(id, 1);
      return;
    }
    try {
      const [resCaja, resHist] = await Promise.all([
        fetch(`${API_URL}/cajas/${id}`),
        fetch(`${API_URL}/cajas/${id}/historial`),
      ]);
      const caja = resCaja.ok ? await resCaja.json() : null;
      const hist = resHist.ok ? await resHist.json() : [];
      if (caja) {
        setDetalleCaja(caja);
        setHistorial(hist);
        detalleCache.current.set(id, { caja, hist, ts: Date.now() });
        cargarProductosCaja(id, 1);
      }
    } catch { notify('No se pudo cargar', 'err'); }
  };

  const recargarDetalle = () => detalleCaja && abrirDetalle(detalleCaja.id);

  const abrirNuevoProducto = () => {
    setProdForm(emptyProdForm); setProdImgs([]); setVerMasDetalles(false); setProdModal(true);
  };
  const guardarProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detalleCaja) return;
    if (prodImgs.length > 6) { notify('Máximo 6 fotos', 'err'); return; }
    // Aviso suave si tiene menos de 3 fotos pero no bloqueamos
    if (prodImgs.length > 0 && prodImgs.length < 3) {
      pedirConfirm(
        'Pocas fotos',
        `Se recomiendan al menos 3 fotos del producto. Subiste ${prodImgs.length}. ¿Continuar de todas formas?`,
        () => continuarGuardarProducto(),
        false
      );
      return;
    }
    continuarGuardarProducto();
  };

  const continuarGuardarProducto = async () => {
    if (!detalleCaja) return;

    const fd = new FormData();
    fd.append('caja_id', String(detalleCaja.id));
    Object.entries(prodForm).forEach(([k, v]) => fd.append(k, String(v ?? '')));
    prodImgs.forEach((f) => fd.append('fotos', f));

    try {
      const res = await fetch(`${API_URL}/productos`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setProdModal(false);
      notify('Producto registrado');
      if (detalleCaja) cargarProductosCaja(detalleCaja.id, 1);
      cargarCajas(); cargarStats();
    } catch (err: any) { notify(err.message, 'err'); }
  };

  const eliminarProducto = (p: Producto) => pedirConfirm(
    'Eliminar producto',
    `¿Eliminar "${p.nombre}"?`,
    async () => {
      // Optimistic UI: quitar de la lista paginada local
      setProductosCaja((prev) => prev.filter((x) => x.id !== p.id));
      setProductosTotal((t) => Math.max(0, t - 1));
      if (detalleCaja) {
        setDetalleCaja({
          ...detalleCaja,
          cantidad: Math.max(0, detalleCaja.cantidad - p.cantidad),
        });
      }
      try {
        const res = await fetch(`${API_URL}/productos/${p.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        notify('Producto eliminado');
        cargarCajas(); cargarStats();
      } catch {
        notify('No se pudo eliminar', 'err');
        if (detalleCaja) cargarProductosCaja(detalleCaja.id, productosPage); // rollback
      }
    }
  );

  const eliminarImagenCaja = (cajaId: number, imgId: number) => pedirConfirm(
    'Eliminar imagen',
    '¿Eliminar esta imagen?',
    async () => {
      try {
        const res = await fetch(`${API_URL}/cajas/${cajaId}/imagen/${imgId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error();
        recargarDetalle();
      } catch { notify('No se pudo eliminar', 'err'); }
    }
  );

  const toggleHistorialProducto = async (id: number) => {
    if (prodHistId === id) { setProdHistId(null); return; }
    try {
      const res = await fetch(`${API_URL}/productos/${id}/historial`);
      setProdHist(res.ok ? await res.json() : []);
      setProdHistId(id);
    } catch { notify('No se pudo cargar el historial', 'err'); }
  };

  const estadoBadge = (estado: string) => (
    <span className="cajas-estado" style={{
      background: (ESTADO_COLOR[estado] || '#64748b') + '22',
      color: ESTADO_COLOR[estado] || '#334155'
    }}>{estado.replace('_', ' ')}</span>
  );

  return (
    <div className="cajas-module">
      {toast && <div className={`cajas-toast ${toast.type}`}>{toast.msg}</div>}

      {vista === 'lista' && (<>
      <div className="cajas-stats">
        <div className="cajas-stat">
          <span>Total cajas</span>
          <strong>{stats?.total_cajas ?? '—'}</strong>
        </div>
        <div className="cajas-stat">
          <span>Total unidades</span>
          <strong>{stats?.total_unidades ?? '—'}</strong>
        </div>
        {stats?.porEstado.map((e) => (
          <div className="cajas-stat" key={e.estado} style={{ borderTopColor: ESTADO_COLOR[e.estado] || '#64748b' }}>
            <span>{e.estado.replace('_', ' ')}</span>
            <strong>{e.total}</strong>
          </div>
        ))}
      </div>

      <div className="cajas-toolbar">
        <div className="cajas-search">
          {Icon.search}
          <input placeholder="Buscar por QR, marca, modelo, S/N, nombre…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          {cargandoCajas && <span className="cajas-spinner" />}
        </div>
        <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS_CAJA.map((e) => <option key={e} value={e}>{e.replace('_', ' ')}</option>)}
        </select>
        <button className="cajas-add" onClick={abrirNuevaCaja}>{Icon.plus} Nueva caja</button>
        <a className="cajas-export" href={`${BASE_URL}/api/cajas/export/excel`} target="_blank" rel="noopener noreferrer" title="Descargar Excel">{Icon.download} Excel</a>
      </div>

      <div className="cajas-grid">
        {cajas.length === 0 ? (
          <div className="cajas-empty-grid">No hay cajas registradas</div>
        ) : cajas.map((c) => (
          <div key={c.id} className="caja-card" onMouseEnter={() => prefetchDetalle(c.id)} onClick={() => abrirDetalle(c.id)}>
            <div className="caja-card-img">
              {c.portada
                ? <img src={fileUrl(c.portada)} alt="" loading="lazy" />
                : <div className="caja-card-img-ph">{Icon.box}</div>}
              <div className="caja-card-estado">{estadoBadge(c.estado)}</div>
            </div>
            <div className="caja-card-body">
              <div className="caja-card-row">
                <span className="caja-qr-pill">{Icon.qr} {c.codigo_qr}</span>
                <span className="caja-card-prod">{c.total_productos ?? 0} prod.</span>
              </div>
              <div className="caja-card-cant"><strong>{c.cantidad}</strong> <em>unidades</em></div>
              {c.detalles && <p className="caja-card-detalles">{c.detalles}</p>}
              <div className="caja-card-actions" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => abrirEditarCaja(c)} title="Editar">{Icon.edit}</button>
                <button className="del" onClick={() => eliminarCaja(c)} title="Eliminar">{Icon.trash}</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="cajas-pagination">
        <span>{total} cajas · página {page} de {totalPages}</span>
        <div>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Anterior</button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
        </div>
      </div>
      </>)}

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
                <label className="full"><span>Código QR *</span>
                  <input value={cajaForm.codigo_qr} onChange={(e) => setCajaForm({ ...cajaForm, codigo_qr: e.target.value })} placeholder="QR-001" required />
                </label>
                <label className="full"><span>Estado</span>
                  <select value={cajaForm.estado} onChange={(e) => setCajaForm({ ...cajaForm, estado: e.target.value })}>
                    {ESTADOS_CAJA.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="full"><span>Detalles (opcional)</span>
                  <textarea rows={3} value={cajaForm.detalles} onChange={(e) => setCajaForm({ ...cajaForm, detalles: e.target.value })} />
                </label>
                <label className="full"><span>Imágenes (puedes elegir varias)</span>
                  <input type="file" accept="image/*" multiple onChange={async (e) => setCajaImgs(await resizeImageFiles(Array.from(e.target.files || [])))} />
                  {cajaImgs.length > 0 && <small>{cajaImgs.length} archivo(s) seleccionados</small>}
                </label>
              </div>
              <div className="cajas-form-actions">
                <button type="button" onClick={() => setCajaModal(false)}>Cancelar</button>
                <button type="submit" className="primary">{cajaEditingId ? 'Guardar' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detalle de caja (página completa) */}
      {vista === 'detalle' && detalleCaja && (
        <div className="caja-page">
          <div className="caja-page-head">
            <button className="caja-page-back" onClick={volverALista} title="Volver al listado">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Volver
            </button>
            <h3>
              <span className="caja-qr-pill">{Icon.qr} {detalleCaja.codigo_qr}</span>
              <small style={{ marginLeft: 10 }}>{detalleCaja.cantidad} unidades</small>
            </h3>
            <a className="cajas-export" href={`${BASE_URL}/api/cajas/${detalleCaja.id}/export/excel`} target="_blank" rel="noopener noreferrer" title="Descargar esta caja con todos sus productos">{Icon.download} Excel</a>
          </div>
          <div className="caja-page-body">
              <div className="caja-imgs-row">
                {(detalleCaja.imagenes || []).slice(0, 5).map((im, i) => {
                  const urls = (detalleCaja.imagenes || []).map((x) => fileUrl(x.ruta));
                  const extra = ((detalleCaja.imagenes || []).length > 5 && i === 4) ? (detalleCaja.imagenes || []).length - 5 : 0;
                  return (
                    <div key={im.id} className="caja-img-thumb">
                      <img src={fileUrl(im.ruta)} alt="" loading="lazy"
                        onClick={() => abrirViewer(urls, i)} style={{ cursor: 'pointer' }} />
                      {extra > 0 && <span className="caja-img-overlay" onClick={() => abrirViewer(urls, i)}>+{extra}</span>}
                      <button onClick={() => eliminarImagenCaja(detalleCaja.id, im.id)} title="Eliminar imagen">{Icon.close}</button>
                    </div>
                  );
                })}
                {(detalleCaja.imagenes || []).length === 0 && (
                  <div className="caja-img-ph-grande">{Icon.image} <span>Sin imágenes</span></div>
                )}
              </div>

              <div className="caja-detalle-chips">{estadoBadge(detalleCaja.estado)}</div>
              {detalleCaja.detalles && <Field label="Detalles" value={detalleCaja.detalles} pre />}

              <div className="prod-section-head">
                <h4>Productos ({productosTotal})</h4>
                <button className="cajas-add small" onClick={abrirNuevoProducto}>{Icon.plus} Agregar producto</button>
              </div>

              {productosTotal === 0 ? (
                <button type="button" className="prod-empty-cta" onClick={abrirNuevoProducto}>
                  <span className="prod-empty-icon">{Icon.plus}</span>
                  <span>
                    <strong>Esta caja aún no tiene productos</strong>
                    <small>Toca aquí para agregar el primero</small>
                  </span>
                </button>
              ) : (
                <div className="prod-list">
                  {productosCaja.map((p) => (
                    <div key={p.id} className="prod-card-wrap">
                    <div className="prod-card">
                      <div className="prod-imgs">
                        {p.imagenes && p.imagenes.length > 0
                          ? p.imagenes.slice(0, 3).map((im, i) => {
                              const urls = p.imagenes!.map((x) => fileUrl(x.ruta));
                              const extra = (p.imagenes!.length > 3 && i === 2) ? p.imagenes!.length - 3 : 0;
                              return (
                                <div key={im.id} className="prod-img-wrap" onClick={(e) => { e.stopPropagation(); abrirViewer(urls, i, [`${p.nombre} - foto ${i+1}`]); }}>
                                  <img src={fileUrl(im.ruta)} alt="" loading="lazy" />
                                  {extra > 0 && <span className="prod-img-overlay">+{extra}</span>}
                                </div>
                              );
                            })
                          : <div className="prod-img-ph">{Icon.image}</div>}
                      </div>
                      <div className="prod-body">
                        <div className="prod-head">
                          <strong>{p.nombre}</strong>
                          {estadoBadge(p.estado)}
                        </div>
                        <div className="prod-meta">
                          {p.marca && <span><b>Marca:</b> {p.marca}</span>}
                          {p.modelo && <span><b>Modelo:</b> {p.modelo}</span>}
                          {p.tipo && <span><b>Tipo:</b> {p.tipo}</span>}
                          {p.cantidad > 1 && <span><b>Cant.:</b> {p.cantidad}</span>}
                        </div>
                        {p.categoria_nombre && (
                          <span className="cajas-badge" style={{ background: (p.categoria_color || '#64748b') + '22', color: p.categoria_color || '#334155' }}>
                            {p.categoria_nombre}
                          </span>
                        )}
                        {p.numero_serie && <code className="prod-sn">S/N: {p.numero_serie}</code>}
                      </div>
                      <div className="prod-card-actions">
                        <button className="prod-hist-btn" onClick={() => toggleHistorialProducto(p.id)} title="Ver historial">
                          {prodHistId === p.id ? 'Ocultar' : 'Historial'}
                        </button>
                        <button className="prod-del" onClick={() => eliminarProducto(p)} title="Eliminar producto">{Icon.trash}</button>
                      </div>
                    </div>
                    {prodHistId === p.id && (
                      <div className="prod-hist-inline">
                        {prodHist.length === 0 ? (
                          <p className="prod-hist-empty">Sin eventos registrados para este producto</p>
                        ) : (
                          <ul className="hist-timeline">
                            {prodHist.map((h) => (
                              <li key={h.id} className="hist-item">
                                <div className="hist-dot" />
                                <div className="hist-content">
                                  <div className="hist-head">
                                    <span className="hist-accion">{h.accion.replace('_', ' ')}</span>
                                    <time>{new Date(h.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}</time>
                                  </div>
                                  {h.descripcion && <p>{h.descripcion}</p>}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    </div>
                  ))}
                </div>
              )}

              {productosTotalPages > 1 && (
                <div className="cajas-pagination" style={{ marginTop: 12 }}>
                  <span>{productosTotal} productos · página {productosPage} de {productosTotalPages}</span>
                  <div>
                    <button disabled={productosPage <= 1}
                      onClick={() => detalleCaja && cargarProductosCaja(detalleCaja.id, productosPage - 1)}>Anterior</button>
                    <button disabled={productosPage >= productosTotalPages}
                      onClick={() => detalleCaja && cargarProductosCaja(detalleCaja.id, productosPage + 1)}>Siguiente</button>
                  </div>
                </div>
              )}

              {/* Historial — colapsable */}
              <button
                type="button"
                className="hist-toggle-btn"
                onClick={() => setVerHistorial((v) => !v)}
              >
                <span>Historial ({historial.length})</span>
                <span className="hist-toggle-arrow">{verHistorial ? '−' : '+'}</span>
              </button>
              {verHistorial && (
                historial.length === 0 ? (
                  <p className="prod-empty">Sin eventos registrados</p>
                ) : (
                  <ul className="hist-timeline">
                    {historial.map((h) => (
                      <li key={h.id} className="hist-item">
                        <div className="hist-dot" />
                        <div className="hist-content">
                          <div className="hist-head">
                            <span className="hist-accion">{h.accion.replace('_', ' ')}</span>
                            <time>{new Date(h.fecha).toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</time>
                          </div>
                          {h.descripcion && <p>{h.descripcion}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )
              )}
          </div>
        </div>
      )}

      {/* Modal nuevo producto */}
      {prodModal && detalleCaja && (
        <div className="cajas-overlay" onClick={() => setProdModal(false)}>
          <div className="cajas-modal wide" onClick={(e) => e.stopPropagation()}>
            <div className="cajas-modal-head">
              <h3>Nuevo producto en {detalleCaja.codigo_qr}</h3>
              <button onClick={() => setProdModal(false)}>{Icon.close}</button>
            </div>
            <form onSubmit={guardarProducto} className="cajas-form">
              <div className="cajas-form-grid">
                <label className="full"><span>Nombre del producto *</span>
                  <input autoFocus value={prodForm.nombre} onChange={(e) => setProdForm({ ...prodForm, nombre: e.target.value })} required />
                </label>
                <label className="full"><span>N° de serie (S/N)</span>
                  <input placeholder="Escanea desde el app o escribe" value={prodForm.numero_serie} onChange={(e) => setProdForm({ ...prodForm, numero_serie: e.target.value })} />
                </label>
                <label><span>Categoría</span>
                  <select value={prodForm.categoria_id} onChange={(e) => setProdForm({ ...prodForm, categoria_id: e.target.value })}>
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </label>
                <label><span>Estado</span>
                  <select value={prodForm.estado} onChange={(e) => setProdForm({ ...prodForm, estado: e.target.value })}>
                    {ESTADOS_PROD.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                  </select>
                </label>
                <label className="full"><span>Imágenes (sugerido mín. 3, máximo 6)</span>
                  <input type="file" accept="image/*" multiple onChange={async (e) => setProdImgs(await resizeImageFiles(Array.from(e.target.files || []).slice(0, 6)))} />
                  {prodImgs.length > 0 && <small>{prodImgs.length} foto(s) seleccionadas {prodImgs.length < 3 && '· se recomiendan al menos 3'}</small>}
                </label>
              </div>

              <button type="button" className="ver-mas-btn" onClick={() => setVerMasDetalles((v) => !v)}>
                {verMasDetalles ? '− Ocultar' : '+ Más detalles'} (marca, modelo, tipo, descripción…)
              </button>

              {verMasDetalles && (
                <div className="cajas-form-grid">
                  <label><span>Cantidad</span>
                    <input type="number" min={1} value={prodForm.cantidad} onChange={(e) => setProdForm({ ...prodForm, cantidad: Number(e.target.value) })} />
                  </label>
                  <label><span>Marca</span>
                    <input value={prodForm.marca} onChange={(e) => setProdForm({ ...prodForm, marca: e.target.value })} />
                  </label>
                  <label><span>Modelo</span>
                    <input value={prodForm.modelo} onChange={(e) => setProdForm({ ...prodForm, modelo: e.target.value })} />
                  </label>
                  <label><span>Tipo</span>
                    <input value={prodForm.tipo} onChange={(e) => setProdForm({ ...prodForm, tipo: e.target.value })} />
                  </label>
                  <label className="full"><span>Descripción</span>
                    <textarea rows={2} value={prodForm.descripcion} onChange={(e) => setProdForm({ ...prodForm, descripcion: e.target.value })} />
                  </label>
                  <label className="full"><span>Uso</span>
                    <textarea rows={2} value={prodForm.uso} onChange={(e) => setProdForm({ ...prodForm, uso: e.target.value })} />
                  </label>
                  <label className="full"><span>Características</span>
                    <textarea rows={3} value={prodForm.caracteristicas} onChange={(e) => setProdForm({ ...prodForm, caracteristicas: e.target.value })} />
                  </label>
                </div>
              )}

              <div className="cajas-form-actions">
                <button type="button" onClick={() => setProdModal(false)}>Cancelar</button>
                <button type="submit" className="primary">Registrar producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visor de imágenes (lightbox) */}
      {viewer && (
        <div className="viewer-overlay" onClick={() => setViewer(null)}>
          <button className="viewer-close" onClick={() => setViewer(null)}>{Icon.close}</button>
          <a
            className="viewer-download"
            href={viewer.urls[viewer.index]}
            download
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >{Icon.download} Descargar</a>
          <div className="viewer-counter">{viewer.index + 1} / {viewer.urls.length}</div>
          <button
            className="viewer-arrow viewer-prev"
            disabled={viewer.index === 0}
            onClick={(e) => { e.stopPropagation(); setViewer({ ...viewer, index: Math.max(0, viewer.index - 1) }); }}
          >‹</button>
          <img
            className="viewer-img"
            src={viewer.urls[viewer.index]}
            alt=""
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="viewer-arrow viewer-next"
            disabled={viewer.index === viewer.urls.length - 1}
            onClick={(e) => { e.stopPropagation(); setViewer({ ...viewer, index: Math.min(viewer.urls.length - 1, viewer.index + 1) }); }}
          >›</button>
        </div>
      )}

      {/* Confirm dialog bonito */}
      {confirmar && (
        <div className="cajas-overlay" onClick={() => setConfirmar(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-icon ${confirmar.peligro ? 'danger' : 'info'}`}>
              {confirmar.peligro ? '!' : '?'}
            </div>
            <h3>{confirmar.titulo}</h3>
            <p>{confirmar.mensaje}</p>
            <div className="confirm-actions">
              <button onClick={() => setConfirmar(null)}>Cancelar</button>
              <button
                className={confirmar.peligro ? 'danger' : 'primary'}
                onClick={() => { const fn = confirmar.onOk; setConfirmar(null); fn(); }}
                autoFocus
              >
                {confirmar.peligro ? 'Eliminar' : 'Continuar'}
              </button>
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
