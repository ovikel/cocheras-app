import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ohsyyattsstncnvyieou.supabase.co";
const SUPABASE_KEY = "sb_publishable_isSVbz7s090bWoF5htrfmw_hVML_LNv";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TIPOS = ["auto", "moto", "camioneta", "otro"];
const TIPO_ICON = { auto: "🚗", moto: "🏍️", camioneta: "🚙", otro: "🅿️" };

// Hook para detectar mobile
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

const Badge = ({ status }) => {
  const map = {
    pagado: { label: "Pagado", bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    pendiente: { label: "Pendiente", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  };
  const s = map[status] || map.pendiente;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

// ── MODAL CAMBIO DE CONTRASEÑA ────────────────────────────────────────────────
function ModalCambioPassword({ user, onClose }) {
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    setErr("");
    if (actual !== user.password) { setErr("La contraseña actual es incorrecta"); return; }
    if (nueva.length < 4) { setErr("Mínimo 4 caracteres"); return; }
    if (nueva !== confirmar) { setErr("Las contraseñas no coinciden"); return; }
    setLoading(true);
    const { error } = await supabase.from("clientes").update({ password: nueva }).eq("id", user.id);
    if (error) setErr("Error al guardar.");
    else { setOk(true); setTimeout(onClose, 1500); }
    setLoading(false);
  };

  const inp = { width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none", marginBottom: 12 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
      <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Cambiar contraseña</h3>
          <button onClick={onClose} style={{ background: "transparent", color: "#555", fontSize: 24, lineHeight: 1, border: "none", cursor: "pointer" }}>×</button>
        </div>
        {ok ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <div style={{ color: "#10b981", fontWeight: 700 }}>¡Contraseña actualizada!</div>
          </div>
        ) : (
          <>
            {[["Contraseña actual", actual, setActual], ["Nueva contraseña", nueva, setNueva], ["Confirmar nueva contraseña", confirmar, setConfirmar]].map(([label, val, set]) => (
              <div key={label}>
                <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{label}</label>
                <input type="password" value={val} onChange={e => { set(e.target.value); setErr(""); }} style={inp} />
              </div>
            ))}
            {err && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{err}</p>}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", background: "#1a1a28", color: "#aaa", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={handleGuardar} disabled={loading} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", opacity: loading ? .7 : 1 }}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


// ── MODAL PAGO ────────────────────────────────────────────────────────────────
function ModalPago({ pago, onClose, onPagadoMP }) {
  const [copiado, setCopiado] = useState(null);
  const CBU = '0000003100005338259326';
  const ALIAS = 'ezequiel.oviedo.mp';

  const copiar = (texto, tipo) => {
    navigator.clipboard.writeText(texto);
    setCopiado(tipo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ background: '#111118', border: '1px solid #1e1e2e', borderRadius: 20, padding: 28, width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#fff' }}>Pagar cuota</h3>
          <button onClick={onClose} style={{ background: 'transparent', color: '#555', fontSize: 24, lineHeight: 1, border: 'none', cursor: 'pointer' }}>x</button>
        </div>

        <div style={{ background: '#1a1020', border: '1px solid #3b1f63', borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ color: '#aaa', fontSize: 12, marginBottom: 4 }}>Monto a pagar</div>
          <div style={{ color: '#a78bfa', fontSize: 28, fontWeight: 800 }}>{fmt(pago.monto)}</div>
          <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{pago.mes} {pago.anio}</div>
        </div>

        {/* Opción 1: Transferencia */}
        <div style={{ background: '#0d1117', border: '1px solid #1a2030', borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 12 }}>🏦 Transferencia bancaria</div>
          <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>CBU / CVU</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080b10', borderRadius: 8, padding: '10px 12px', marginBottom: 8 }}>
            <span style={{ color: '#fff', fontSize: 13, fontFamily: 'monospace', letterSpacing: 1 }}>{CBU}</span>
            <button onClick={() => copiar(CBU, 'cbu')} style={{ background: copiado === 'cbu' ? '#064e3b' : '#1e3a5f', color: copiado === 'cbu' ? '#34d399' : '#60a5fa', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
              {copiado === 'cbu' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <div style={{ color: '#666', fontSize: 11, marginBottom: 4 }}>Alias</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#080b10', borderRadius: 8, padding: '10px 12px' }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{ALIAS}</span>
            <button onClick={() => copiar(ALIAS, 'alias')} style={{ background: copiado === 'alias' ? '#064e3b' : '#1e3a5f', color: copiado === 'alias' ? '#34d399' : '#60a5fa', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, marginLeft: 8 }}>
              {copiado === 'alias' ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <p style={{ color: '#555', fontSize: 11, marginTop: 10, lineHeight: 1.4 }}>
            Una vez realizada la transferencia el administrador confirmará el pago.
          </p>
        </div>

        {/* Opción 2: Mercado Pago */}
        <div style={{ background: '#0d1117', border: '1px solid #1a2030', borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 14, marginBottom: 8 }}>💙 Mercado Pago</div>
          <p style={{ color: '#666', fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
            Enviá dinero a <strong style={{ color: '#fff' }}>{ALIAS}</strong> directamente desde tu app de Mercado Pago.
          </p>
          <button onClick={() => copiar(ALIAS, 'mp')} style={{ width: '100%', background: '#009ee3', color: '#fff', padding: '11px', borderRadius: 10, fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer' }}>
            {copiado === 'mp' ? '✓ Alias copiado!' : '📋 Copiar alias de MP'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true); setErr("");
    if (email === "admin@cocheras.com" && pass === "admin123") {
      onLogin({ role: "admin", name: "Administrador" }); setLoading(false); return;
    }
    const { data, error } = await supabase.from("clientes").select("*").eq("email", email).single();
    if (error || !data) setErr("Email no encontrado");
    else if (pass !== data.password) setErr("Contraseña incorrecta");
    else onLogin({ ...data, role: "client" });
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input,button{outline:none;} button{cursor:pointer;border:none;}`}</style>
      <div style={{ position: "relative", width: "100%", maxWidth: 400, padding: "40px 32px", background: "#111118", borderRadius: 24, border: "1px solid #1e1e2e", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "radial-gradient(circle, rgba(139,92,246,.25) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🅿️</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, color: "#fff", fontWeight: 800 }}>CocherasApp</h1>
          <p style={{ color: "#666", fontSize: 14, marginTop: 6 }}>Gestión de alquileres mensuales</p>
        </div>
        {[
          { label: "Email", val: email, set: setEmail, type: "email", ph: "tu@email.com" },
          { label: "Contraseña", val: pass, set: setPass, type: "password", ph: "••••••••" },
        ].map(f => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", color: "#aaa", fontSize: 13, fontWeight: 500, marginBottom: 6 }}>{f.label}</label>
            <input type={f.type} value={f.val} placeholder={f.ph}
              onChange={e => { f.set(e.target.value); setErr(""); }}
              onKeyDown={e => e.key === "Enter" && handle()}
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "13px 16px", color: "#fff", fontSize: 16 }}
            />
          </div>
        ))}
        {err && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</p>}
        <button onClick={handle} disabled={loading}
          style={{ width: "100%", padding: "15px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 16, marginTop: 8, opacity: loading ? .7 : 1 }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </div>
    </div>
  );
}

// ── CLIENT VIEW ───────────────────────────────────────────────────────────────
function ClientView({ user, onLogout }) {
  const isMobile = useIsMobile();
  const [cocheras, setCocheras] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [tab, setTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);
  const [showCambioPass, setShowCambioPass] = useState(false);
  const [pagoModal, setPagoModal] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: coch }, { data: pags }] = await Promise.all([
        supabase.from("cocheras").select("*").eq("cliente_id", user.id).eq("activo", true),
        supabase.from("pagos").select("*").eq("cliente_id", user.id).order("anio").order("mes"),
      ]);
      setCocheras(coch || []);
      setPagos(pags || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handlePagar = async (pago) => {
    setPayingId(pago.id);
    await supabase.from("pagos").update({ estado: "pagado", metodo: "transferencia", fecha_pago: new Date().toISOString().split("T")[0] }).eq("id", pago.id);
    const { data } = await supabase.from("pagos").select("*").eq("cliente_id", user.id).order("anio").order("mes");
    setPagos(data || []);
    setPayingId(null);
  };

  const totalMensual = cocheras.reduce((a, c) => a + Number(c.monto_mensual), 0);
  const pagados = pagos.filter(p => p.estado === "pagado");
  const pendientes = pagos.filter(p => p.estado === "pendiente");
  const lista = tab === "todos" ? pagos : tab === "pagados" ? pagados : pendientes;

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#e5e5e5" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;border:none;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#111;} ::-webkit-scrollbar-thumb{background:#333;border-radius:3px;}`}</style>

      {pagoModal && <ModalPago pago={pagoModal} onClose={() => setPagoModal(null)} />}
      {showCambioPass && <ModalCambioPassword user={currentUser} onClose={() => {
        setShowCambioPass(false);
        supabase.from("clientes").select("*").eq("id", user.id).single().then(({ data }) => { if (data) setCurrentUser({ ...data, role: "client" }); });
      }} />}

      {/* Header */}
      <div style={{ background: "#111118", borderBottom: "1px solid #1e1e2e", padding: isMobile ? "12px 16px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 18 : 20, color: "#fff", fontWeight: 800 }}>🅿️ CocherasApp</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!isMobile && <div style={{ textAlign: "right" }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{user.nombre}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{cocheras.length} lugar{cocheras.length !== 1 ? "es" : ""}</div>
          </div>}
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 15, flexShrink: 0 }}>{user.nombre[0]}</div>
          {isMobile ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setShowMenu(!showMenu)} style={{ background: "#1a1a28", color: "#aaa", padding: "8px 12px", borderRadius: 8, fontSize: 18, fontWeight: 600 }}>☰</button>
              {showMenu && (
                <div style={{ position: "absolute", right: 0, top: 44, background: "#1a1a28", border: "1px solid #2a2a3e", borderRadius: 12, padding: 8, minWidth: 160, zIndex: 100 }}>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, padding: "8px 12px", borderBottom: "1px solid #2a2a3e", marginBottom: 4 }}>{user.nombre}</div>
                  <button onClick={() => { setShowCambioPass(true); setShowMenu(false); }} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", color: "#aaa", padding: "8px 12px", fontSize: 14, borderRadius: 8 }}>🔑 Contraseña</button>
                  <button onClick={onLogout} style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", color: "#ef4444", padding: "8px 12px", fontSize: 14, borderRadius: 8 }}>Salir</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setShowCambioPass(true)} style={{ background: "#1a1a28", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>🔑 Contraseña</button>
              <button onClick={onLogout} style={{ background: "#1a1a28", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Salir</button>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "20px 14px" : "32px 20px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 22 : 24, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Mi cuenta</h2>

        {/* Cocheras */}
        {cocheras.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ color: "#666", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Mis lugares</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {cocheras.map(c => (
                <div key={c.id} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 12, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8, flex: isMobile ? "1 1 calc(50% - 4px)" : "0 0 auto", minWidth: 0 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{TIPO_ICON[c.tipo] || "🅿️"}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: "#666", textTransform: "capitalize" }}>{c.tipo} · {fmt(c.monto_mensual)}/mes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: isMobile ? 8 : 16, marginBottom: 20 }}>
          {[
            { label: "Pendiente", val: fmt(pendientes.reduce((a,p)=>a+Number(p.monto),0)), color: "#f59e0b" },
            { label: "Cuota/mes", val: fmt(totalMensual), color: "#7c3aed" },
          ].map(st => (
            <div key={st.label} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 12, padding: isMobile ? "14px 10px" : "20px 24px" }}>
              <div style={{ color: "#666", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>{st.label}</div>
              <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 700, color: st.color }}>{st.val}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#111118", border: "1px solid #1e1e2e", borderRadius: 12, padding: 5 }}>
          {[["todos","Todos"],["pagados","Pagados ✓"],["pendientes","Pendientes"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: isMobile ? "9px 6px" : "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: isMobile ? 12 : 14, border: "none", background: tab===k ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: tab===k ? "#fff" : "#666" }}>{l}</button>
          ))}
        </div>

        {/* Lista pagos */}
        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 16, padding: isMobile ? "12px 14px" : 24 }}>
          {loading ? <div style={{ textAlign: "center", color: "#555", padding: 40 }}>Cargando...</div>
          : lista.length === 0 ? <div style={{ textAlign: "center", color: "#555", padding: 40 }}>No hay pagos en esta categoría</div>
          : lista.map((p, i) => (
            <div key={p.id} style={{ padding: "12px 0", borderBottom: i<lista.length-1 ? "1px solid #1a1a28" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: p.estado==="pagado" ? "#052e16" : "#431407", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                    {p.estado === "pagado" ? "✅" : "📋"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{p.mes} {p.anio}</div>
                    <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                      {p.estado === "pagado" ? `${p.metodo==="transferencia" ? "🔄 Transfer." : "💵 Efectivo"} · ${p.fecha_pago}` : "Sin abonar"}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-end" : "center", gap: 8, flexShrink: 0 }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{fmt(p.monto)}</div>
                    <Badge status={p.estado} />
                  </div>
                  {p.estado === "pendiente" && (
                    <button onClick={() => setPagoModal(p)}
                      style={{ padding: isMobile ? "7px 12px" : "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: isMobile ? 12 : 13, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", opacity: payingId===p.id ? .6 : 1, whiteSpace: "nowrap" }}>
                      {payingId === p.id ? "..." : "💳 Pagar"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── ADMIN VIEW ────────────────────────────────────────────────────────────────
function AdminView({ onLogout }) {
  const isMobile = useIsMobile();
  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [cocheras, setCocheras] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const [showAddPago, setShowAddPago] = useState(false);
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [showAddCochera, setShowAddCochera] = useState(false);
  const [newPago, setNewPago] = useState({ mes: "Enero", anio: new Date().getFullYear(), monto: "" });
  const [newCliente, setNewCliente] = useState({ nombre: "", email: "", password: "1234" });
  const [newCochera, setNewCochera] = useState({ nombre: "", tipo: "auto", monto_mensual: "" });
  const [editCliente, setEditCliente] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [uploadingFoto, setUploadingFoto] = useState(null);
  const [editCochera, setEditCochera] = useState(null);
  const [pagoParcial, setPagoParcial] = useState(null);
  const [montoParcial, setMontoParcial] = useState("");
  const [tabPanel, setTabPanel] = useState("clientes");
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const cargarClientes = async () => {
      const { data: clientesData } = await supabase.from("clientes").select("*").order("nombre", { nullsFirst: false });
      const clientes = (clientesData || []).filter(c => c.nombre);
      // Cargar estado de pagos del mes actual para cada cliente
      const mes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][new Date().getMonth()];
      const anio = new Date().getFullYear();
      const { data: pagosData } = await supabase.from("pagos").select("cliente_id, estado").eq("mes", mes).eq("anio", anio);
      const pagosMap = {};
      (pagosData || []).forEach(p => { pagosMap[p.cliente_id] = p.estado; });
      setClientes(clientes.map(c => ({ ...c, estadoMes: pagosMap[c.id] || "sin cuota" })));
      setLoadingClientes(false);
    };
    cargarClientes();
    cargarAnalytics();
  }, []);

  const cargarAnalytics = async () => {
    const mes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][new Date().getMonth()];
    const anio = new Date().getFullYear();
    const { data: todosPagos } = await supabase.from("pagos").select("*").eq("anio", anio);
    const { data: clientesData } = await supabase.from("clientes").select("id").eq("activo", true);
    const { data: cocherasData } = await supabase.from("cocheras").select("monto_mensual").eq("activo", true);
    
    const pagosMes = (todosPagos || []).filter(p => p.mes === mes);
    const pagadosMes = pagosMes.filter(p => p.estado === "pagado");
    const pendientesMes = pagosMes.filter(p => p.estado === "pendiente");
    const totalAnio = (todosPagos || []).filter(p => p.estado === "pagado").reduce((a,p) => a + Number(p.monto), 0);
    
    // Recaudacion por mes del año
    const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
    const recaudacionPorMes = meses.map(m => ({
      mes: m.substring(0,3),
      total: (todosPagos || []).filter(p => p.mes === m && p.estado === "pagado").reduce((a,p) => a + Number(p.monto), 0)
    }));

    setAnalytics({
      mes,
      totalCobradoMes: pagadosMes.reduce((a,p) => a + Number(p.monto), 0),
      totalPendienteMes: pendientesMes.reduce((a,p) => a + Number(p.monto), 0),
      cantPagadosMes: pagadosMes.length,
      cantPendientesMes: pendientesMes.length,
      totalClientes: (clientesData || []).length,
      totalAnio,
      cuotaMensualTotal: (cocherasData || []).reduce((a,c) => a + Number(c.monto_mensual), 0),
      recaudacionPorMes,
    });
  };

  const fetchDetalle = async (clienteId) => {
    setLoadingDetalle(true);
    const [{ data: coch }, { data: pags }] = await Promise.all([
      supabase.from("cocheras").select("*").eq("cliente_id", clienteId).eq("activo", true),
      supabase.from("pagos").select("*").eq("cliente_id", clienteId).order("anio").order("mes"),
    ]);
    setCocheras(coch || []);
    setPagos(pags || []);
    setLoadingDetalle(false);
  };

  const selectCliente = (c) => {
    setSelected(c);
    fetchDetalle(c.id);
    setShowAddPago(false);
    setShowAddCochera(false);
    if (isMobile) setShowSidebar(false);
  };

  const markEfectivo = async (pagoId) => {
    await supabase.from("pagos").update({ estado: "pagado", metodo: "efectivo", fecha_pago: new Date().toISOString().split("T")[0] }).eq("id", pagoId);
    setConfirmId(pagoId);
    await fetchDetalle(selected.id);
    setTimeout(() => setConfirmId(null), 2000);
    // Actualizar estado del cliente en la lista y en el analítico
    const mes = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][new Date().getMonth()];
    const anio = new Date().getFullYear();
    const { data: pagosMes } = await supabase.from("pagos").select("estado").eq("cliente_id", selected.id).eq("mes", mes).eq("anio", anio);
    const todosPageados = pagosMes && pagosMes.length > 0 && pagosMes.every(p => p.estado === "pagado");
    const hayPendiente = pagosMes && pagosMes.some(p => p.estado === "pendiente");
    const nuevoEstado = todosPageados ? "pagado" : hayPendiente ? "pendiente" : "sin cuota";
    setClientes(prev => prev.map(c => c.id === selected.id ? { ...c, estadoMes: nuevoEstado } : c));
    // Actualizar analítico
    cargarAnalytics();
  };

  const addPago = async () => {
    if (!newPago.monto) return;
    await supabase.from("pagos").insert({ cliente_id: selected.id, mes: newPago.mes, anio: Number(newPago.anio), monto: Number(newPago.monto), estado: "pendiente" });
    setShowAddPago(false);
    setNewPago({ mes: "Enero", anio: new Date().getFullYear(), monto: "" });
    await fetchDetalle(selected.id);
    // Actualizar estado en lista si es el mes actual
    const mesActual = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][new Date().getMonth()];
    if (newPago.mes === mesActual) {
      setClientes(prev => prev.map(c => c.id === selected.id ? { ...c, estadoMes: "pendiente" } : c));
      cargarAnalytics();
    }
  };

  const addCliente = async () => {
    if (!newCliente.nombre || !newCliente.email) return;
    const { data, error } = await supabase.from("clientes").insert({ ...newCliente, activo: true }).select().single();
    if (error) { alert("Error: " + error.message); return; }
    if (data) setClientes(prev => [...prev, data].sort((a,b) => (a.nombre||"").localeCompare(b.nombre||"")));
    setShowAddCliente(false);
    setNewCliente({ nombre: "", email: "", password: "1234" });
  };

  const addCochera = async () => {
    if (!newCochera.nombre || !newCochera.monto_mensual) return;
    await supabase.from("cocheras").insert({ cliente_id: selected.id, ...newCochera, monto_mensual: Number(newCochera.monto_mensual), activo: true });
    setShowAddCochera(false);
    setNewCochera({ nombre: "", tipo: "auto", monto_mensual: "" });
    fetchDetalle(selected.id);
  };

  const handleFotoUpload = async (clienteId, file) => {
    if (!file) return;
    setUploadingFoto(clienteId);
    const ext = file.name.split(".").pop();
    const path = `fotos/${clienteId}.${ext}`;
    const { error } = await supabase.storage.from("clientes").upload(path, file, { upsert: true });
    if (!error) {
      const { data } = supabase.storage.from("clientes").getPublicUrl(path);
      const url = data.publicUrl + "?t=" + Date.now();
      await supabase.from("clientes").update({ foto_url: url }).eq("id", clienteId);
      setClientes(prev => prev.map(c => c.id === clienteId ? { ...c, foto_url: url } : c));
      if (selected?.id === clienteId) setSelected(prev => ({ ...prev, foto_url: url }));
      if (editCliente?.id === clienteId) setEditCliente(prev => ({ ...prev, foto_url: url }));
    }
    setUploadingFoto(null);
  };

  const saveEditCliente = async () => {
    if (!editCliente) return;
    await supabase.from("clientes").update({ nombre: editCliente.nombre, email: editCliente.email, password: editCliente.password, telefono: editCliente.telefono, domicilio: editCliente.domicilio }).eq("id", editCliente.id);
    setClientes(prev => prev.map(c => c.id === editCliente.id ? { ...c, ...editCliente } : c));
    if (selected?.id === editCliente.id) setSelected(prev => ({ ...prev, ...editCliente }));
    setEditCliente(null);
  };

  const saveEditCochera = async () => {
    if (!editCochera) return;
    await supabase.from("cocheras").update({ nombre: editCochera.nombre, tipo: editCochera.tipo, monto_mensual: Number(editCochera.monto_mensual) }).eq("id", editCochera.id);
    setEditCochera(null);
    fetchDetalle(selected.id);
  };

  const addPagoParcial = async () => {
    if (!montoParcial || !pagoParcial) return;
    await supabase.from("pagos").insert({ cliente_id: selected.id, mes: pagoParcial.mes, anio: pagoParcial.anio, monto: Number(montoParcial), estado: "pagado", metodo: "efectivo", fecha_pago: new Date().toISOString().split("T")[0] });
    setPagoParcial(null);
    setMontoParcial("");
    await fetchDetalle(selected.id);
    cargarAnalytics();
  };

  const deleteCochera = async (cocheraId, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}"?`)) return;
    await supabase.from("cocheras").update({ activo: false }).eq("id", cocheraId);
    fetchDetalle(selected.id);
  };

  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()));
  const inp = { background: "#080b10", border: "1px solid #1a2030", borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none" };
  const totalMensual = cocheras.reduce((a,c) => a + Number(c.monto_mensual), 0);
  const totalPagados = pagos.filter(p=>p.estado==="pagado").reduce((a,p)=>a+Number(p.monto),0);
  const totalPendientes = pagos.filter(p=>p.estado==="pendiente").reduce((a,p)=>a+Number(p.monto),0);

  const SIDEBAR_W = 260;

  return (
    <div style={{ minHeight: "100vh", minHeight: "100dvh", background: "#080b10", fontFamily: "'DM Sans', sans-serif", color: "#e5e5e5" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;border:none;} select,input{outline:none;} ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-track{background:#0d1117;} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px;}`}</style>

      {/* Modal editar cliente */}
      {editCliente && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20, overflowY: "auto" }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 420, margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Editar cliente</h3>
              <button onClick={() => setEditCliente(null)} style={{ background: "transparent", color: "#555", fontSize: 24, border: "none", cursor: "pointer" }}>x</button>
            </div>

            {/* Foto de perfil */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20, padding: 16, background: "#0d0d14", borderRadius: 14 }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                {editCliente.foto_url ? (
                  <img src={editCliente.foto_url} alt="" style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }} />
                ) : (
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff" }}>
                    {editCliente.nombre ? editCliente.nombre[0] : "?"}
                  </div>
                )}
                {uploadingFoto === editCliente.id && (
                  <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(0,0,0,.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>...</div>
                )}
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>Foto de perfil</div>
                <label style={{ background: "#1e3a5f", color: "#60a5fa", padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Subir foto
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFotoUpload(editCliente.id, e.target.files[0])} />
                </label>
              </div>
            </div>

            {/* Campos */}
            {[["Nombre completo","nombre"],["Email","email"],["Contrasena","password"],["Telefono","telefono"],["Domicilio","domicilio"]].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>{label}</label>
                <input value={editCliente[key] || ""} onChange={e => setEditCliente({...editCliente, [key]: e.target.value})}
                  style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setEditCliente(null)} style={{ flex: 1, padding: "11px", background: "#1a1a28", color: "#aaa", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveEditCliente} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal preview foto */}
      {fotoPreview && (
        <div onClick={() => setFotoPreview(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 300, cursor: "pointer" }}>
          <div style={{ textAlign: "center" }}>
            <img src={fotoPreview.url} alt="" style={{ width: "min(80vw, 400px)", height: "min(80vw, 400px)", borderRadius: "50%", objectFit: "cover", border: "3px solid #7c3aed", boxShadow: "0 0 60px rgba(124,58,237,.4)" }} />
            <div style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginTop: 16, fontFamily: "'Syne',sans-serif" }}>{fotoPreview.nombre}</div>
            <div style={{ color: "#666", fontSize: 13, marginTop: 4 }}>Toca para cerrar</div>
          </div>
        </div>
      )}

      {/* Modal editar cochera */}
      {editCochera && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Editar lugar</h3>
              <button onClick={() => setEditCochera(null)} style={{ background: "transparent", color: "#555", fontSize: 24, border: "none", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Nombre / Número</label>
              <input value={editCochera.nombre || ""} onChange={e => setEditCochera({...editCochera, nombre: e.target.value})}
                style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Tipo</label>
              <select value={editCochera.tipo} onChange={e => setEditCochera({...editCochera, tipo: e.target.value})}
                style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }}>
                {["auto","moto","camioneta","otro"].map(t => <option key={t} style={{ background: "#0d0d14" }}>{t}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Monto mensual $</label>
              <input type="number" value={editCochera.monto_mensual || ""} onChange={e => setEditCochera({...editCochera, monto_mensual: e.target.value})}
                style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "11px 14px", color: "#fff", fontSize: 14, outline: "none" }} />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditCochera(null)} style={{ flex: 1, padding: "11px", background: "#1a1a28", color: "#aaa", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={saveEditCochera} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal pago parcial */}
      {pagoParcial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, padding: 20 }}>
          <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 20, padding: 28, width: "100%", maxWidth: 360 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Pago parcial</h3>
              <button onClick={() => { setPagoParcial(null); setMontoParcial(""); }} style={{ background: "transparent", color: "#555", fontSize: 24, border: "none", cursor: "pointer" }}>×</button>
            </div>
            <div style={{ background: "#1a1020", border: "1px solid #3b1f63", borderRadius: 10, padding: "10px 14px", marginBottom: 16, textAlign: "center" }}>
              <div style={{ color: "#aaa", fontSize: 12 }}>Cuota pendiente</div>
              <div style={{ color: "#a78bfa", fontSize: 22, fontWeight: 800 }}>{fmt(pagoParcial.monto)}</div>
              <div style={{ color: "#666", fontSize: 12 }}>{pagoParcial.mes} {pagoParcial.anio}</div>
            </div>
            <label style={{ display: "block", color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 5 }}>Monto parcial a registrar $</label>
            <input type="number" value={montoParcial} placeholder="Ej: 5000" onChange={e => setMontoParcial(e.target.value)}
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 15, outline: "none", marginBottom: 16 }} />
            <p style={{ color: "#555", fontSize: 12, marginBottom: 16, lineHeight: 1.4 }}>Se va a registrar como un pago adicional en efectivo del mismo mes. La cuota original sigue pendiente hasta que la marques como pagada.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setPagoParcial(null); setMontoParcial(""); }} style={{ flex: 1, padding: "11px", background: "#1a1a28", color: "#aaa", borderRadius: 10, fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" }}>Cancelar</button>
              <button onClick={addPagoParcial} style={{ flex: 1, padding: "11px", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer" }}>Registrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1a2030", padding: isMobile ? "12px 16px" : "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isMobile && (
            <button onClick={() => setShowSidebar(!showSidebar)} style={{ background: "#1a2030", color: "#aaa", padding: "7px 11px", borderRadius: 8, fontSize: 16 }}>☰</button>
          )}
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 17 : 20, color: "#fff", fontWeight: 800 }}>
            🅿️ CocherasApp <span style={{ fontSize: 10, color: "#3b82f6", background: "#1e3a5f", padding: "2px 7px", borderRadius: 20, marginLeft: 4 }}>ADMIN</span>
          </span>
        </div>
        <button onClick={onLogout} style={{ background: "#1a2030", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Salir</button>
      </div>

      {/* Sidebar overlay mobile */}
      {isMobile && showSidebar && (
        <div onClick={() => setShowSidebar(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width: SIDEBAR_W, background: "#0d1117", borderRight: "1px solid #1a2030",
        position: "fixed", top: 57, left: 0, bottom: 0, overflowY: "auto", padding: "16px 10px",
        zIndex: 45, transform: isMobile && !showSidebar ? `translateX(-${SIDEBAR_W}px)` : "translateX(0)",
        transition: "transform .25s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 4 }}>
          <span style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Clientes</span>
          <button onClick={() => setShowAddCliente(!showAddCliente)} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>+ Nuevo</button>
        </div>

        {/* Buscador */}
        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 14 }}>🔍</span>
          <input
            placeholder="Buscar cliente..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: "100%", background: "#080b10", border: "1px solid #1a2030", borderRadius: 8, padding: "8px 10px 8px 30px", color: "#fff", fontSize: 13, outline: "none" }}
          />
          {busqueda && (
            <button onClick={() => setBusqueda("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#555", fontSize: 16, border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
          )}
        </div>

        {showAddCliente && (
          <div style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: 10, marginBottom: 10 }}>
            {[["Nombre completo","nombre"],["Email","email"],["Contraseña inicial","password"]].map(([ph, key]) => (
              <input key={key} placeholder={ph} value={newCliente[key]}
                onChange={e => setNewCliente({...newCliente, [key]: e.target.value})}
                style={{ ...inp, width: "100%", marginBottom: 6, fontSize: 13 }} />
            ))}
            <button onClick={addCliente} style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "8px", borderRadius: 7, fontWeight: 700, fontSize: 13 }}>Guardar</button>
          </div>
        )}

        {loadingClientes ? <div style={{ color: "#444", fontSize: 13, padding: 8 }}>Cargando...</div>
        : clientesFiltrados.length === 0 ? <div style={{ color: "#555", fontSize: 13, padding: 8, textAlign: "center" }}>Sin resultados</div>
        : clientesFiltrados.map(c => (
          <div key={c.id} style={{ padding: "10px 12px", borderRadius: 10, marginBottom: 4, background: selected?.id===c.id ? "#131e35" : "transparent", border: selected?.id===c.id ? "1px solid #1e3a5f" : "1px solid transparent" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div onClick={(e) => { e.stopPropagation(); if(c.foto_url) setFotoPreview({url: c.foto_url, nombre: c.nombre}); }}
                style={{ flexShrink: 0, cursor: c.foto_url ? "zoom-in" : "default", position: "relative" }}>
                {c.foto_url ? (
                  <img src={c.foto_url} alt="" style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 14 }}>{c.nombre[0]}</div>
                )}
                <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", background: c.estadoMes === "pagado" ? "#10b981" : c.estadoMes === "pendiente" ? "#ef4444" : "#555", border: "2px solid #0d1117" }} />
              </div>
              <div onClick={() => selectCliente(c)} style={{ cursor: "pointer", flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: "#fff", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: c.estadoMes === "pagado" ? "#10b981" : c.estadoMes === "pendiente" ? "#ef4444" : "#555", marginTop: 1 }}>
                  {c.estadoMes === "pagado" ? "Al dia" : c.estadoMes === "pendiente" ? "Pago pendiente" : "Sin cuota"}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={(e) => { e.stopPropagation(); setEditCliente({...c}); }}
                style={{ background: "transparent", color: "#60a5fa", fontSize: 11, fontWeight: 600, padding: 0, border: "none", cursor: "pointer" }}>
                ✏️ Editar
              </button>
              <button onClick={async (e) => {
                e.stopPropagation();
                if (!window.confirm(`¿Eliminar a ${c.nombre}?`)) return;
                await supabase.from("clientes").delete().eq("id", c.id);
                setClientes(prev => prev.filter(x => x.id !== c.id));
                if (selected?.id === c.id) setSelected(null);
              }} style={{ background: "transparent", color: "#ef4444", fontSize: 11, fontWeight: 600, padding: 0, border: "none", cursor: "pointer" }}>
                🗑 Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ marginLeft: isMobile ? 0 : SIDEBAR_W, padding: isMobile ? "70px 14px 30px" : "80px 28px 40px" }}>
        {!selected ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#fff" }}>Panel de control</h2>
              <div style={{ display: "flex", gap: 6, background: "#0d1117", border: "1px solid #1a2030", borderRadius: 10, padding: 4 }}>
                <button onClick={() => setTabPanel("clientes")} style={{ padding: "7px 16px", borderRadius: 7, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", background: tabPanel==="clientes" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: tabPanel==="clientes" ? "#fff" : "#666" }}>👥 Clientes</button>
                <button onClick={() => setTabPanel("analytics")} style={{ padding: "7px 16px", borderRadius: 7, fontWeight: 600, fontSize: 13, border: "none", cursor: "pointer", background: tabPanel==="analytics" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: tabPanel==="analytics" ? "#fff" : "#666" }}>📊 Analítico</button>
              </div>
            </div>

            {tabPanel === "analytics" && analytics && (
              <>
                {/* Stats principales */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                  {[
                    { icon: "💰", label: `Cobrado en ${analytics.mes}`, val: fmt(analytics.totalCobradoMes), color: "#34d399", bg: "#052e16" },
                    { icon: "⏳", label: `Pendiente en ${analytics.mes}`, val: fmt(analytics.totalPendienteMes), color: "#f59e0b", bg: "#431407" },
                    { icon: "📅", label: "Cobrado en el año", val: fmt(analytics.totalAnio), color: "#a78bfa", bg: "#1a1020" },
                    { icon: "🎯", label: "Cuota mensual total", val: fmt(analytics.cuotaMensualTotal), color: "#60a5fa", bg: "#0c1a2e" },
                  ].map(s => (
                    <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                      <div style={{ color: "#666", fontSize: 10, fontWeight: 700, letterSpacing: .8, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: s.color }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Porcentajes del mes */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 14, padding: "20px 22px" }}>
                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 16, fontSize: 14 }}>📈 Estado del mes — {analytics.mes}</div>
                    {(() => {
                      const total = analytics.cantPagadosMes + analytics.cantPendientesMes;
                      const pct = total > 0 ? Math.round(analytics.cantPagadosMes / total * 100) : 0;
                      return (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ color: "#10b981", fontSize: 13, fontWeight: 600 }}>✓ Pagados: {analytics.cantPagadosMes}</span>
                            <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 600 }}>⏳ Pendientes: {analytics.cantPendientesMes}</span>
                          </div>
                          <div style={{ background: "#1a2030", borderRadius: 99, height: 12, overflow: "hidden", marginBottom: 8 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#10b981,#34d399)", borderRadius: 99, transition: "width .5s" }} />
                          </div>
                          <div style={{ textAlign: "center", color: pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444", fontSize: 28, fontWeight: 800 }}>{pct}%</div>
                          <div style={{ textAlign: "center", color: "#555", fontSize: 12 }}>de cobro completado</div>
                        </>
                      );
                    })()}
                  </div>

                  <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 14, padding: "20px 22px" }}>
                    <div style={{ fontWeight: 700, color: "#fff", marginBottom: 16, fontSize: 14 }}>👥 Resumen general</div>
                    {[
                      { label: "Clientes activos", val: analytics.totalClientes, icon: "👤" },
                      { label: "Pagaron este mes", val: analytics.cantPagadosMes, icon: "✅" },
                      { label: "Deben este mes", val: analytics.cantPendientesMes, icon: "🔴" },
                      { label: "Sin cuota generada", val: analytics.totalClientes - analytics.cantPagadosMes - analytics.cantPendientesMes, icon: "⚪" },
                    ].map(r => (
                      <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #151d2a" }}>
                        <span style={{ color: "#aaa", fontSize: 13 }}>{r.icon} {r.label}</span>
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gráfico de barras por mes */}
                <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 14, padding: "20px 22px" }}>
                  <div style={{ fontWeight: 700, color: "#fff", marginBottom: 20, fontSize: 14 }}>📊 Recaudación mensual {new Date().getFullYear()}</div>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 4 : 8, height: 120 }}>
                    {(() => {
                      const max = Math.max(...analytics.recaudacionPorMes.map(m => m.total), 1);
                      const mesActual = analytics.mes.substring(0,3);
                      return analytics.recaudacionPorMes.map((m, i) => (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                          <div style={{ fontSize: 9, color: "#555", fontWeight: 600 }}>
                            {m.total > 0 ? `$${Math.round(m.total/1000)}k` : ""}
                          </div>
                          <div style={{
                            width: "100%", borderRadius: "4px 4px 0 0",
                            height: `${Math.max(m.total / max * 90, m.total > 0 ? 4 : 0)}px`,
                            background: m.mes === mesActual ? "linear-gradient(180deg,#7c3aed,#4f46e5)" : m.total > 0 ? "#1e3a5f" : "#0d1117",
                            border: m.mes === mesActual ? "none" : m.total > 0 ? "1px solid #1e3a5f" : "1px solid #151d2a",
                            transition: "height .4s",
                            minHeight: 3
                          }} />
                          <div style={{ fontSize: isMobile ? 8 : 9, color: m.mes === mesActual ? "#a78bfa" : "#555", fontWeight: m.mes === mesActual ? 700 : 400 }}>{m.mes}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </>
            )}

            {tabPanel === "analytics" && !analytics && (
              <div style={{ textAlign: "center", color: "#555", padding: 40 }}>Cargando analítico...</div>
            )}

            {tabPanel === "clientes" && (
              <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 16, padding: isMobile ? 16 : 24 }}>
              <div style={{ position: "relative", marginBottom: 16 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#555", fontSize: 16 }}>🔍</span>
                <input placeholder="Buscar cliente..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                  style={{ width: "100%", background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: "12px 12px 12px 38px", color: "#fff", fontSize: 14, outline: "none" }} />
                {busqueda && <button onClick={() => setBusqueda("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "transparent", color: "#555", fontSize: 20, border: "none", cursor: "pointer" }}>×</button>}
              </div>
              {clientesFiltrados.length === 0 ? <div style={{ color: "#555", textAlign: "center", padding: 20 }}>Sin resultados</div> : null}
              {clientesFiltrados.map((c, i) => (
                <div key={c.id} onClick={() => selectCliente(c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i<clientes.length-1 ? "1px solid #151d2a" : "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div onClick={(e) => { e.stopPropagation(); if(c.foto_url) setFotoPreview({url: c.foto_url, nombre: c.nombre}); }}
                      style={{ flexShrink: 0, cursor: c.foto_url ? "zoom-in" : "default", position: "relative" }}>
                      {c.foto_url ? (
                        <img src={c.foto_url} alt="" style={{ width: 42, height: 42, borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }} />
                      ) : (
                        <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 16 }}>{c.nombre[0]}</div>
                      )}
                      <span style={{ position: "absolute", bottom: 0, right: 0, width: 11, height: 11, borderRadius: "50%", background: c.estadoMes === "pagado" ? "#10b981" : c.estadoMes === "pendiente" ? "#ef4444" : "#555", border: "2px solid #0d1117" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{c.nombre}</div>
                      <div style={{ fontSize: 11, marginTop: 2, color: c.estadoMes === "pagado" ? "#10b981" : c.estadoMes === "pendiente" ? "#ef4444" : "#555" }}>
                        {c.estadoMes === "pagado" ? "Al dia" : c.estadoMes === "pendiente" ? "Pago pendiente" : c.email}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: "#3b82f6", flexShrink: 0 }}>Ver</span>
                </div>
              ))}
            </div>
            )}          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
              <button onClick={() => setSelected(null)} style={{ background: "#1a2030", color: "#aaa", padding: "7px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>←</button>
              <div onClick={() => { if(selected.foto_url) setFotoPreview({url: selected.foto_url, nombre: selected.nombre}); }}
                style={{ flexShrink: 0, cursor: selected.foto_url ? "zoom-in" : "default", position: "relative" }}>
                {selected.foto_url ? (
                  <img src={selected.foto_url} alt="" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid #7c3aed" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff", fontSize: 20 }}>{selected.nombre[0]}</div>
                )}
              </div>
              <div>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#fff" }}>{selected.nombre}</h2>
                <div style={{ display: "flex", gap: 12, marginTop: 3, flexWrap: "wrap" }}>
                  {selected.telefono && <span style={{ fontSize: 12, color: "#60a5fa" }}>📞 {selected.telefono}</span>}
                  {selected.domicilio && <span style={{ fontSize: 12, color: "#aaa" }}>📍 {selected.domicilio}</span>}
                  {selected.email && <span style={{ fontSize: 12, color: "#555" }}>{selected.email}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: isMobile ? 8 : 14, marginBottom: 16 }}>
              {[
                { label: "Cobrado", val: fmt(totalPagados), color: "#34d399" },
                { label: "Pendiente", val: fmt(totalPendientes), color: "#f59e0b" },
                { label: "Cuota/mes", val: fmt(totalMensual), color: "#a78bfa" },
              ].map(st => (
                <div key={st.label} style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 12, padding: isMobile ? "12px 10px" : "18px 20px" }}>
                  <div style={{ color: "#555", fontSize: isMobile ? 9 : 11, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 4 }}>{st.label}</div>
                  <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: st.color }}>{st.val}</div>
                </div>
              ))}
            </div>

            {/* Cocheras */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 14, padding: isMobile ? 14 : 22, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Lugares alquilados</div>
                <button onClick={() => setShowAddCochera(!showAddCochera)} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {showAddCochera ? "Cancelar" : "+ Agregar"}
                </button>
              </div>

              {showAddCochera && (
                <div style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 100px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Nombre/Número</div>
                    <input placeholder="A-01" value={newCochera.nombre} onChange={e => setNewCochera({...newCochera, nombre: e.target.value})} style={{ ...inp, width: "100%" }} />
                  </div>
                  <div style={{ flex: "1 1 90px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Tipo</div>
                    <select value={newCochera.tipo} onChange={e => setNewCochera({...newCochera, tipo: e.target.value})} style={{ ...inp, width: "100%", background: "#0d1117" }}>
                      {TIPOS.map(t => <option key={t} style={{ background: "#0d1117" }}>{t}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: "1 1 100px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Monto $</div>
                    <input type="number" placeholder="15000" value={newCochera.monto_mensual} onChange={e => setNewCochera({...newCochera, monto_mensual: e.target.value})} style={{ ...inp, width: "100%" }} />
                  </div>
                  <button onClick={addCochera} style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Guardar</button>
                </div>
              )}

              {cocheras.length === 0 ? <div style={{ color: "#555", fontSize: 13 }}>Sin lugares. Agregá uno arriba.</div>
              : <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {cocheras.map(c => (
                    <div key={c.id} style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 18 }}>{TIPO_ICON[c.tipo] || "🅿️"}</span>
                      <div>
                        <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{c.nombre}</div>
                        <div style={{ fontSize: 11, color: "#555", textTransform: "capitalize" }}>{c.tipo} · {fmt(c.monto_mensual)}/mes</div>
                      </div>
                      <button onClick={() => setEditCochera({...c})} style={{ background: "transparent", color: "#60a5fa", fontSize: 13, padding: "0 4px", border: "none", cursor: "pointer" }}>✏️</button>
                      <button onClick={() => deleteCochera(c.id, c.nombre)} style={{ background: "transparent", color: "#ef4444", fontSize: 18, padding: "0 0 0 4px", border: "none", cursor: "pointer", lineHeight: 1 }}>×</button>
                    </div>
                  ))}
                </div>
              }
            </div>

            {/* Pagos */}
            <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 14, padding: isMobile ? 14 : 22 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>Historial de pagos</div>
                <button onClick={() => setShowAddPago(!showAddPago)} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                  {showAddPago ? "Cancelar" : "+ Cuota"}
                </button>
              </div>

              {showAddPago && (
                <div style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: 12, marginBottom: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: "1 1 120px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Mes</div>
                    <select value={newPago.mes} onChange={e => setNewPago({...newPago, mes: e.target.value})} style={{ ...inp, width: "100%", background: "#0d1117" }}>
                      {MESES.map(m => <option key={m} style={{ background: "#0d1117" }}>{m}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: "0 0 80px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Año</div>
                    <input type="number" value={newPago.anio} onChange={e => setNewPago({...newPago, anio: e.target.value})} style={{ ...inp, width: "100%" }} />
                  </div>
                  <div style={{ flex: "1 1 100px" }}>
                    <div style={{ color: "#555", fontSize: 11, marginBottom: 4 }}>Monto $</div>
                    <input type="number" value={newPago.monto} placeholder={totalMensual} onChange={e => setNewPago({...newPago, monto: e.target.value})} style={{ ...inp, width: "100%" }} />
                  </div>
                  <button onClick={addPago} style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "9px 16px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Guardar</button>
                </div>
              )}

              {loadingDetalle ? <div style={{ textAlign: "center", color: "#555", padding: 24 }}>Cargando...</div>
              : pagos.length === 0 ? <div style={{ textAlign: "center", color: "#555", padding: 24, fontSize: 14 }}>Sin cuotas. Usá "+ Cuota".</div>
              : pagos.map((p, i) => (
                <div key={p.id} style={{ padding: "11px 0", borderBottom: i<pagos.length-1 ? "1px solid #151d2a" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: p.estado==="pagado" ? "#052e16" : "#431407", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>
                        {p.estado === "pagado" ? "✅" : "📋"}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#fff", fontSize: 13 }}>{p.mes} {p.anio}</div>
                        <div style={{ fontSize: 11, color: "#555", marginTop: 1 }}>
                          {p.estado === "pagado" ? `${p.metodo==="transferencia" ? "🔄" : "💵"} ${p.fecha_pago}` : "Sin abonar"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-end" : "center", gap: 6, flexShrink: 0 }}>
                      <span style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>{fmt(p.monto)}</span>
                      <Badge status={p.estado} />
                      {p.estado === "pendiente" && (
                        confirmId === p.id
                          ? <span style={{ color: "#34d399", fontSize: 12, fontWeight: 700 }}>¡Marcado! ✓</span>
                          : <div style={{ display: "flex", gap: 5, flexDirection: "column" }}>
                              <button onClick={() => markEfectivo(p.id)}
                                style={{ background: "#064e3b", color: "#34d399", padding: "5px 10px", borderRadius: 7, fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", border: "none", cursor: "pointer" }}>
                                💵 Pagado
                              </button>
                              <button onClick={() => { setPagoParcial(p); setMontoParcial(""); }}
                                style={{ background: "#1e3a5f", color: "#60a5fa", padding: "5px 10px", borderRadius: 7, fontWeight: 700, fontSize: 11, whiteSpace: "nowrap", border: "none", cursor: "pointer" }}>
                                💸 Parcial
                              </button>
                            </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("cocheras_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (u) => {
    setUser(u);
    try { localStorage.setItem("cocheras_user", JSON.stringify(u)); } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    try { localStorage.removeItem("cocheras_user"); } catch {}
  };
  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role === "admin") return <AdminView onLogout={handleLogout} />;
  return <ClientView user={user} onLogout={handleLogout} />;
}
