import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ohsyyattsstncnvyieou.supabase.co";
const SUPABASE_KEY = "sb_publishable_isSVbz7s090bWoF5htrfmw_hVML_LNv";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const Badge = ({ status }) => {
  const map = {
    pagado: { label: "Pagado", bg: "#d1fae5", color: "#065f46", dot: "#10b981" },
    pendiente: { label: "Pendiente", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  };
  const s = map[status] || map.pendiente;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
};

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    setErr("");
    if (email === "admin@cocheras.com" && pass === "admin123") {
      onLogin({ role: "admin", name: "Administrador" });
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.from("clientes").select("*").eq("email", email).single();
    if (error || !data) {
      setErr("Email no encontrado");
    } else if (pass !== "1234") {
      setErr("Contraseña incorrecta");
    } else {
      onLogin({ ...data, role: "client" });
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} input{outline:none;} button{cursor:pointer;border:none;}`}</style>
      <div style={{ position: "relative", width: 420, padding: 48, background: "#111118", borderRadius: 24, border: "1px solid #1e1e2e", boxShadow: "0 40px 80px rgba(0,0,0,.6)" }}>
        <div style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 200, height: 200, background: "radial-gradient(circle, rgba(139,92,246,.25) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🅿️</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 26, color: "#fff", fontWeight: 800 }}>CocherasApp</h1>
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
              style={{ width: "100%", background: "#0d0d14", border: "1px solid #2a2a3e", borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15 }}
              onFocus={e => e.target.style.borderColor = "#7c3aed"}
              onBlur={e => e.target.style.borderColor = "#2a2a3e"}
            />
          </div>
        ))}
        {err && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{err}</p>}
        <button onClick={handle} disabled={loading}
          style={{ width: "100%", padding: "14px", background: "linear-gradient(135deg, #7c3aed, #4f46e5)", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, marginTop: 8, opacity: loading ? .7 : 1 }}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
        <p style={{ color: "#444", fontSize: 12, textAlign: "center", marginTop: 20 }}>
          Clientes: su email / 1234 &nbsp;|&nbsp; Admin: admin@cocheras.com / admin123
        </p>
      </div>
    </div>
  );
}

function ClientView({ user, onLogout }) {
  const [pagos, setPagos] = useState([]);
  const [tab, setTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null);

  const fetchPagos = async () => {
    const { data } = await supabase.from("pagos").select("*").eq("cliente_id", user.id).order("anio").order("mes");
    setPagos(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchPagos(); }, []);

  const handlePagar = async (pago) => {
    setPayingId(pago.id);
    await supabase.from("pagos").update({ estado: "pagado", metodo: "transferencia", fecha_pago: new Date().toISOString().split("T")[0] }).eq("id", pago.id);
    await fetchPagos();
    setPayingId(null);
  };

  const pagados = pagos.filter(p => p.estado === "pagado");
  const pendientes = pagos.filter(p => p.estado === "pendiente");
  const lista = tab === "todos" ? pagos : tab === "pagados" ? pagados : pendientes;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#e5e5e5" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;border:none;} ::-webkit-scrollbar{width:6px;} ::-webkit-scrollbar-track{background:#111;} ::-webkit-scrollbar-thumb{background:#333;border-radius:3px;}`}</style>
      <div style={{ background: "#111118", borderBottom: "1px solid #1e1e2e", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, color: "#fff", fontWeight: 800 }}>🅿️ CocherasApp</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: "#fff" }}>{user.nombre}</div>
            <div style={{ fontSize: 12, color: "#666" }}>Cochera {user.cochera}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>{user.nombre[0]}</div>
          <button onClick={onLogout} style={{ background: "#1a1a28", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Salir</button>
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Mi cuenta</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total pagado", val: fmt(pagados.reduce((a,p)=>a+Number(p.monto),0)), color: "#10b981" },
            { label: "Total pendiente", val: fmt(pendientes.reduce((a,p)=>a+Number(p.monto),0)), color: "#f59e0b" },
            { label: "Cuota mensual", val: fmt(user.monto_mensual), color: "#7c3aed" },
          ].map(st => (
            <div key={st.label} style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 14, padding: "20px 24px" }}>
              <div style={{ color: "#666", fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{st.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: st.color }}>{st.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "#111118", border: "1px solid #1e1e2e", borderRadius: 12, padding: 6 }}>
          {[["todos","Todos"],["pagados","Pagados ✓"],["pendientes","Pendientes"]].map(([k,l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ padding: "9px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, border: "none", background: tab===k ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "transparent", color: tab===k ? "#fff" : "#666" }}>{l}</button>
          ))}
        </div>

        <div style={{ background: "#111118", border: "1px solid #1e1e2e", borderRadius: 16, padding: 24 }}>
          {loading ? <div style={{ textAlign: "center", color: "#555", padding: 40 }}>Cargando pagos...</div>
          : lista.length === 0 ? <div style={{ textAlign: "center", color: "#555", padding: 40 }}>No hay pagos en esta categoría</div>
          : lista.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: i < lista.length-1 ? "1px solid #1a1a28" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: p.estado==="pagado" ? "#052e16" : "#431407", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                  {p.estado === "pagado" ? "✅" : "📋"}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: "#fff" }}>{p.mes} {p.anio}</div>
                  <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>
                    {p.estado === "pagado" ? `${p.metodo==="transferencia" ? "🔄 Transferencia" : "💵 Efectivo"} · ${p.fecha_pago}` : "Sin abonar"}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#fff" }}>{fmt(p.monto)}</div>
                  <Badge status={p.estado} />
                </div>
                {p.estado === "pendiente" && (
                  <button onClick={() => handlePagar(p)} disabled={payingId===p.id}
                    style={{ padding: "8px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13, border: "none", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", opacity: payingId===p.id ? .6 : 1, minWidth: 130 }}>
                    {payingId === p.id ? "Procesando..." : "💳 Pagar ahora"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminView({ onLogout }) {
  const [clientes, setClientes] = useState([]);
  const [selected, setSelected] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [loadingClientes, setLoadingClientes] = useState(true);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [showAddPago, setShowAddPago] = useState(false);
  const [showAddCliente, setShowAddCliente] = useState(false);
  const [newPago, setNewPago] = useState({ mes: "Enero", anio: new Date().getFullYear(), monto: "" });
  const [newCliente, setNewCliente] = useState({ nombre: "", email: "", cochera: "", monto_mensual: "" });

  useEffect(() => {
    supabase.from("clientes").select("*").order("nombre").then(({ data }) => {
      setClientes(data || []);
      setLoadingClientes(false);
    });
  }, []);

  const fetchPagos = async (clienteId) => {
    setLoadingPagos(true);
    const { data } = await supabase.from("pagos").select("*").eq("cliente_id", clienteId).order("anio").order("mes");
    setPagos(data || []);
    setLoadingPagos(false);
  };

  const selectCliente = (c) => { setSelected(c); fetchPagos(c.id); setShowAddPago(false); };

  const markEfectivo = async (pagoId) => {
    await supabase.from("pagos").update({ estado: "pagado", metodo: "efectivo", fecha_pago: new Date().toISOString().split("T")[0] }).eq("id", pagoId);
    setConfirmId(pagoId);
    await fetchPagos(selected.id);
    setTimeout(() => setConfirmId(null), 2000);
  };

  const addPago = async () => {
    if (!newPago.monto) return;
    await supabase.from("pagos").insert({ cliente_id: selected.id, mes: newPago.mes, anio: Number(newPago.anio), monto: Number(newPago.monto), estado: "pendiente" });
    setShowAddPago(false);
    setNewPago({ mes: "Enero", anio: new Date().getFullYear(), monto: "" });
    fetchPagos(selected.id);
  };

  const addCliente = async () => {
    if (!newCliente.nombre || !newCliente.email || !newCliente.cochera || !newCliente.monto_mensual) return;
    const { data } = await supabase.from("clientes").insert({ ...newCliente, monto_mensual: Number(newCliente.monto_mensual), activo: true }).select().single();
    setClientes(prev => [...prev, data].sort((a,b) => a.nombre.localeCompare(b.nombre)));
    setShowAddCliente(false);
    setNewCliente({ nombre: "", email: "", cochera: "", monto_mensual: "" });
  };

  const inputStyle = { background: "#080b10", border: "1px solid #1a2030", borderRadius: 8, padding: "9px 14px", color: "#fff", fontSize: 14, outline: "none" };
  const totalPagados = pagos.filter(p=>p.estado==="pagado").reduce((a,p)=>a+Number(p.monto),0);
  const totalPendientes = pagos.filter(p=>p.estado==="pendiente").reduce((a,p)=>a+Number(p.monto),0);

  return (
    <div style={{ minHeight: "100vh", background: "#080b10", fontFamily: "'DM Sans', sans-serif", color: "#e5e5e5" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;} button{cursor:pointer;border:none;} select,input{outline:none;} ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:#0d1117;} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px;}`}</style>

      {/* Header */}
      <div style={{ background: "#0d1117", borderBottom: "1px solid #1a2030", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "fixed", top: 0, left: 0, right: 0, zIndex: 10 }}>
        <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, color: "#fff", fontWeight: 800 }}>
          🅿️ CocherasApp <span style={{ fontSize: 11, color: "#3b82f6", background: "#1e3a5f", padding: "2px 8px", borderRadius: 20, marginLeft: 6 }}>ADMIN</span>
        </span>
        <button onClick={onLogout} style={{ background: "#1a2030", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>Salir</button>
      </div>

      {/* Sidebar */}
      <div style={{ width: 270, background: "#0d1117", borderRight: "1px solid #1a2030", position: "fixed", top: 65, left: 0, bottom: 0, overflowY: "auto", padding: "20px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingLeft: 4 }}>
          <span style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>Clientes</span>
          <button onClick={() => setShowAddCliente(!showAddCliente)} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>+ Nuevo</button>
        </div>

        {showAddCliente && (
          <div style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 10, padding: 12, marginBottom: 12 }}>
            {[
              { ph: "Nombre completo", key: "nombre" },
              { ph: "Email", key: "email" },
              { ph: "Cochera (ej: A-01)", key: "cochera" },
              { ph: "Monto mensual $", key: "monto_mensual" },
            ].map(f => (
              <input key={f.key} placeholder={f.ph} value={newCliente[f.key]}
                onChange={e => setNewCliente({...newCliente, [f.key]: e.target.value})}
                style={{ ...inputStyle, width: "100%", marginBottom: 6, fontSize: 13 }} />
            ))}
            <button onClick={addCliente} style={{ width: "100%", background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "8px", borderRadius: 7, fontWeight: 700, fontSize: 13 }}>Guardar cliente</button>
          </div>
        )}

        {loadingClientes ? <div style={{ color: "#444", fontSize: 13, padding: 8 }}>Cargando...</div>
        : clientes.map(c => (
          <div key={c.id} onClick={() => selectCliente(c)}
            style={{ padding: "12px 14px", borderRadius: 10, marginBottom: 5, cursor: "pointer", background: selected?.id===c.id ? "#131e35" : "transparent", border: selected?.id===c.id ? "1px solid #1e3a5f" : "1px solid transparent" }}>
            <div style={{ fontWeight: 600, color: "#fff", fontSize: 14 }}>{c.nombre}</div>
            <div style={{ fontSize: 12, color: "#555", marginTop: 2 }}>Cochera {c.cochera}</div>
          </div>
        ))}
      </div>

      {/* Main */}
      <div style={{ marginLeft: 270, padding: "90px 32px 40px" }}>
        {!selected ? (
          <>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 24 }}>Panel de control</h2>
            <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 16, padding: 24 }}>
              <div style={{ fontWeight: 700, color: "#fff", marginBottom: 16 }}>Seleccioná un cliente del panel izquierdo para ver sus pagos</div>
              {clientes.map((c, i) => (
                <div key={c.id} onClick={() => selectCliente(c)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i<clientes.length-1 ? "1px solid #151d2a" : "none", cursor: "pointer" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#1e3a5f,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#fff" }}>{c.nombre[0]}</div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{c.nombre}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>{c.email} · Cochera {c.cochera} · {fmt(c.monto_mensual)}/mes</div>
                    </div>
                  </div>
                  <span style={{ fontSize: 13, color: "#3b82f6" }}>Ver pagos →</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button onClick={() => setSelected(null)} style={{ background: "#1a2030", color: "#aaa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>← Volver</button>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>{selected.nombre}</h2>
              <span style={{ color: "#555", fontSize: 14 }}>Cochera {selected.cochera}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Total cobrado", val: fmt(totalPagados), color: "#34d399" },
                { label: "Total pendiente", val: fmt(totalPendientes), color: "#f59e0b" },
                { label: "Cuota mensual", val: fmt(selected.monto_mensual), color: "#a78bfa" },
              ].map(st => (
                <div key={st.label} style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ color: "#555", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>{st.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: st.color }}>{st.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#0d1117", border: "1px solid #1a2030", borderRadius: 16, padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontWeight: 700, color: "#fff" }}>Historial de pagos</div>
                <button onClick={() => setShowAddPago(!showAddPago)} style={{ background: "#1e3a5f", color: "#60a5fa", padding: "7px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                  {showAddPago ? "Cancelar" : "+ Agregar cuota"}
                </button>
              </div>

              {showAddPago && (
                <div style={{ background: "#080b10", border: "1px solid #1a2030", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <div style={{ color: "#555", fontSize: 12, marginBottom: 4 }}>Mes</div>
                    <select value={newPago.mes} onChange={e => setNewPago({...newPago, mes: e.target.value})}
                      style={{ ...inputStyle, width: 130, background: "#0d1117" }}>
                      {MESES.map(m => <option key={m} style={{ background: "#0d1117" }}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={{ color: "#555", fontSize: 12, marginBottom: 4 }}>Año</div>
                    <input type="number" value={newPago.anio} onChange={e => setNewPago({...newPago, anio: e.target.value})}
                      style={{ ...inputStyle, width: 90, background: "#0d1117" }} />
                  </div>
                  <div>
                    <div style={{ color: "#555", fontSize: 12, marginBottom: 4 }}>Monto $</div>
                    <input type="number" value={newPago.monto} placeholder={selected.monto_mensual}
                      onChange={e => setNewPago({...newPago, monto: e.target.value})}
                      style={{ ...inputStyle, width: 130, background: "#0d1117" }} />
                  </div>
                  <button onClick={addPago} style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", color: "#fff", padding: "9px 18px", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Guardar</button>
                </div>
              )}

              {loadingPagos ? <div style={{ textAlign: "center", color: "#555", padding: 30 }}>Cargando...</div>
              : pagos.length === 0 ? <div style={{ textAlign: "center", color: "#555", padding: 30 }}>No hay cuotas. Usá "+ Agregar cuota" para comenzar.</div>
              : pagos.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i<pagos.length-1 ? "1px solid #151d2a" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: p.estado==="pagado" ? "#052e16" : "#431407", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                      {p.estado === "pagado" ? "✅" : "📋"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#fff" }}>{p.mes} {p.anio}</div>
                      <div style={{ fontSize: 12, color: "#555", marginTop: 1 }}>
                        {p.estado === "pagado" ? `${p.metodo==="transferencia" ? "🔄 Transferencia" : "💵 Efectivo"} · ${p.fecha_pago}` : "Sin abonar"}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontWeight: 700, color: "#fff" }}>{fmt(p.monto)}</span>
                    <Badge status={p.estado} />
                    {p.estado === "pendiente" && (
                      confirmId === p.id
                        ? <span style={{ color: "#34d399", fontSize: 13, fontWeight: 700 }}>¡Marcado! ✓</span>
                        : <button onClick={() => markEfectivo(p.id)}
                            style={{ background: "#064e3b", color: "#34d399", padding: "6px 14px", borderRadius: 7, fontWeight: 700, fontSize: 12 }}>
                            💵 Marcar efectivo
                          </button>
                    )}
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
  const [user, setUser] = useState(null);
  if (!user) return <Login onLogin={setUser} />;
  if (user.role === "admin") return <AdminView onLogout={() => setUser(null)} />;
  return <ClientView user={user} onLogout={() => setUser(null)} />;
}
