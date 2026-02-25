import { useState, useRef, useCallback, useEffect } from "react";

/* ── API ───────────────────────────────────────────────────────────────────── */
const API_BASE = "http://localhost:8000/api";
const getToken = () => localStorage.getItem("ih_token");

async function api(path, opts = {}) {
  try {
    const headers = { "Content-Type": "application/json", ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}), ...(opts.headers || {}) };
    const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn(`[API] ${path} failed — using mock data`, e.message);
    return null;
  }
}

async function apiFile(path, formData) {
  try {
    const headers = getToken() ? { Authorization: `Bearer ${getToken()}` } : {};
    const res = await fetch(`${API_BASE}${path}`, { method: "POST", headers, body: formData });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn(`[API FILE] ${path} failed`, e.message);
    return null;
  }
}

/* ── STYLES ─────────────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0a0a0f;--bg2:#111118;--bg3:#18181f;--border:#2a2a38;
  --amber:#f5a623;--amber2:#ffd166;--red:#ef4444;--green:#22c55e;
  --blue:#3b82f6;--text:#e8e8f0;--muted:#6b6b80;--card:#14141c;--r:12px;
}
body{background:var(--bg);color:var(--text);font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.6;min-height:100vh}
h1,h2,h3,h4{font-family:'Syne',sans-serif}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:var(--bg)}::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}

/* layout */
.app{display:flex;min-height:100vh}
.sidebar{width:240px;min-height:100vh;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;padding:28px 0;position:fixed;top:0;left:0;z-index:100;overflow-y:auto}
.s-logo{padding:0 24px 24px;border-bottom:1px solid var(--border);margin-bottom:16px;display:flex;align-items:center;gap:10px}
.logo-icon{width:36px;height:36px;background:var(--amber);border-radius:8px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:800;font-size:18px;color:#0a0a0f;flex-shrink:0}
.logo-text{font-family:'Syne',sans-serif;font-weight:700;font-size:17px;color:var(--text)}
.logo-text span{color:var(--amber)}
.nav-section{padding:0 12px}
.nav-lbl{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--muted);padding:8px 12px 6px;font-weight:600}
.nav-btn{display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;cursor:pointer;color:var(--muted);font-size:14px;font-weight:500;transition:all .18s;border:none;background:none;width:100%;text-align:left;margin-bottom:2px;font-family:'DM Sans',sans-serif}
.nav-btn:hover{background:var(--bg3);color:var(--text)}
.nav-btn.active{background:rgba(245,166,35,.12);color:var(--amber)}
.nav-icon{width:18px;height:18px;flex-shrink:0}
.s-user{margin-top:auto;padding:16px 24px 0;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer}
.main{margin-left:240px;flex:1;padding:36px 40px;max-width:calc(100vw - 240px)}
.topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:36px;flex-wrap:wrap;gap:16px}
.page-title{font-size:26px;font-weight:800;letter-spacing:-.02em}
.page-sub{color:var(--muted);font-size:14px;margin-top:2px}
.tbar-right{display:flex;gap:10px;align-items:center;flex-wrap:wrap}

/* avatar */
.avatar{border-radius:50%;background:linear-gradient(135deg,var(--amber),#e07b00);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;color:#0a0a0f;flex-shrink:0}

/* buttons */
.btn{display:inline-flex;align-items:center;gap:7px;padding:9px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .18s;font-family:'DM Sans',sans-serif;white-space:nowrap}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;box-shadow:none!important}
.btn-p{background:var(--amber);color:#0a0a0f}
.btn-p:hover:not(:disabled){background:var(--amber2);transform:translateY(-1px);box-shadow:0 4px 16px rgba(245,166,35,.3)}
.btn-g{background:var(--bg3);color:var(--text);border:1px solid var(--border)}
.btn-g:hover:not(:disabled){background:var(--border)}
.btn-d{background:rgba(239,68,68,.15);color:var(--red);border:1px solid rgba(239,68,68,.3)}
.btn-d:hover:not(:disabled){background:rgba(239,68,68,.25)}
.btn-sm{padding:6px 12px;font-size:13px}
.btn-icon{padding:7px;border-radius:8px;width:34px;height:34px;justify-content:center}

/* cards */
.card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:24px}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:var(--r);padding:20px;position:relative;overflow:hidden;transition:border-color .2s}
.stat-card:hover{border-color:rgba(245,166,35,.3)}
.stat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:var(--amber);opacity:0;transition:opacity .2s}
.stat-card:hover::before{opacity:1}
.stat-val{font-family:'Syne',sans-serif;font-size:32px;font-weight:800;line-height:1;margin-bottom:6px}
.stat-lbl{font-size:13px;color:var(--muted);font-weight:500}
.stat-note{font-size:12px;margin-top:8px;font-weight:500;color:var(--muted)}

/* grid */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px}
.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.g5{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}

/* badge */
.badge{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize}
.b-applied{background:rgba(59,130,246,.15);color:var(--blue)}
.b-interviewing{background:rgba(245,166,35,.15);color:var(--amber)}
.b-offer{background:rgba(34,197,94,.15);color:var(--green)}
.b-rejected{background:rgba(239,68,68,.12);color:var(--red)}
.b-ghosted{background:rgba(107,107,128,.15);color:var(--muted)}
.b-safe{background:rgba(34,197,94,.15);color:var(--green)}
.b-risky{background:rgba(245,166,35,.15);color:var(--amber)}
.b-scam{background:rgba(239,68,68,.15);color:var(--red)}

/* table */
.tbl-wrap{overflow-x:auto}
table{width:100%;border-collapse:collapse}
th{text-align:left;padding:12px 16px;font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);font-weight:600;border-bottom:1px solid var(--border);font-family:'DM Sans',sans-serif}
td{padding:13px 16px;font-size:14px;border-bottom:1px solid rgba(42,42,56,.5);vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(255,255,255,.02)}

/* forms */
.fg{margin-bottom:20px}
label{display:block;font-size:12px;font-weight:600;color:var(--muted);margin-bottom:7px;text-transform:uppercase;letter-spacing:.06em}
input[type=text],input[type=email],input[type=password],input[type=url],input[type=number],select,textarea{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:11px 14px;color:var(--text);font-size:14px;font-family:'DM Sans',sans-serif;transition:border-color .18s;outline:none}
input:focus,select:focus,textarea:focus{border-color:var(--amber);box-shadow:0 0 0 3px rgba(245,166,35,.1)}
input:disabled,textarea:disabled{opacity:.5;cursor:not-allowed}
textarea{resize:vertical;min-height:88px}
select{cursor:pointer}select option{background:var(--bg2)}

/* upload */
.upload-zone{border:2px dashed var(--border);border-radius:12px;padding:48px 24px;text-align:center;cursor:pointer;transition:all .2s}
.upload-zone:hover,.upload-zone.drag{border-color:var(--amber);background:rgba(245,166,35,.04)}
.up-icon{font-size:40px;margin-bottom:12px}
.up-txt{color:var(--muted);font-size:14px}
.up-txt strong{color:var(--amber)}

/* score ring */
.ring-wrap{display:flex;flex-direction:column;align-items:center;padding:32px 0}
.ring{width:160px;height:160px;position:relative}
.ring svg{width:100%;height:100%;transform:rotate(-90deg)}
.ring circle{fill:none;stroke-width:12;stroke-linecap:round}
.ring-val{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.ring-num{font-family:'Syne',sans-serif;font-size:38px;font-weight:800;line-height:1}
.ring-sub{font-size:13px;color:var(--muted)}

/* flags */
.flag{display:flex;align-items:flex-start;gap:12px;padding:12px 16px;background:var(--bg3);border-radius:8px;margin-bottom:8px;border-left:3px solid transparent}
.flag.danger{border-left-color:var(--red)}.flag.warning{border-left-color:var(--amber)}.flag.ok{border-left-color:var(--green)}
.flag-lbl{font-weight:600;margin-bottom:2px;font-size:14px}
.flag-det{font-size:12px;color:var(--muted)}

/* bars */
.bar-wrap{margin-bottom:10px}
.bar-top{display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px}
.bar-bg{background:var(--bg3);border-radius:4px;height:7px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}

/* tabs */
.tabs{display:flex;gap:4px;background:var(--bg3);padding:4px;border-radius:10px;width:fit-content;margin-bottom:20px}
.tab{padding:8px 18px;border-radius:7px;cursor:pointer;font-size:13px;font-weight:600;border:none;background:none;color:var(--muted);font-family:'DM Sans',sans-serif;transition:all .18s}
.tab.active{background:var(--card);color:var(--text);box-shadow:0 1px 4px rgba(0,0,0,.3)}

/* steps */
.steps{display:flex;margin-bottom:32px}
.step{flex:1;text-align:center;position:relative}
.step:not(:last-child)::after{content:'';position:absolute;top:15px;left:55%;width:90%;height:1px;background:var(--border)}
.step.done:not(:last-child)::after{background:var(--amber)}
.step-dot{width:30px;height:30px;border-radius:50%;background:var(--bg3);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:12px;font-weight:700;position:relative;z-index:1;transition:all .2s}
.step.active .step-dot{border-color:var(--amber);color:var(--amber)}
.step.done .step-dot{background:var(--amber);border-color:var(--amber);color:#0a0a0f}
.step-lbl{font-size:12px;color:var(--muted);font-weight:500}
.step.active .step-lbl,.step.done .step-lbl{color:var(--text)}

/* toast */
.toast-wrap{position:fixed;bottom:28px;right:28px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none}
.toast{display:flex;align-items:center;gap:12px;padding:14px 18px;border-radius:10px;background:var(--bg2);border:1px solid var(--border);box-shadow:0 8px 32px rgba(0,0,0,.5);min-width:280px;animation:sIn .3s ease;font-size:14px;font-weight:500}
.toast.success{border-color:rgba(34,197,94,.4)}.toast.error{border-color:rgba(239,68,68,.4)}.toast.info{border-color:rgba(59,130,246,.3)}
@keyframes sIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}

/* modal */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
.modal{background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:32px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.6);animation:fi .2s ease}
.modal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.modal-title{font-size:20px;font-weight:800}
.modal-x{background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;border-radius:6px;display:flex;transition:all .15s}
.modal-x:hover{color:var(--text);background:var(--bg3)}

/* toggle */
.tog-row{display:flex;align-items:center;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--border)}
.tog{width:40px;height:22px;background:var(--bg3);border-radius:11px;position:relative;cursor:pointer;border:1px solid var(--border);transition:background .2s;flex-shrink:0}
.tog.on{background:var(--green);border-color:var(--green)}
.tog::after{content:'';position:absolute;top:2px;left:2px;width:16px;height:16px;background:#fff;border-radius:50%;transition:transform .2s}
.tog.on::after{transform:translateX(18px)}

/* chip */
.chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;font-size:12px;color:var(--muted);font-weight:500}
.chip-x{cursor:pointer;display:inline-flex;align-items:center;opacity:.6;transition:opacity .15s;width:12px;height:12px}
.chip-x:hover{opacity:1;color:var(--red)}

/* file pill */
.fpill{display:flex;align-items:center;gap:12px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px 18px}

/* sel inline */
.isel{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 10px;font-size:13px;color:var(--text);cursor:pointer;outline:none;font-family:'DM Sans',sans-serif}
.isel:focus{border-color:var(--amber)}

/* auth */
.auth-page{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.auth-bg{position:absolute;inset:0;background:radial-gradient(circle at 20% 50%,rgba(245,166,35,.06) 0%,transparent 50%),radial-gradient(circle at 80% 20%,rgba(59,130,246,.05) 0%,transparent 40%)}
.auth-grid{position:absolute;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:48px 48px;opacity:.3}
.auth-card{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:44px;width:100%;max-width:440px;position:relative;z-index:1;box-shadow:0 32px 80px rgba(0,0,0,.5)}
.a-title{font-size:24px;font-weight:800;margin-bottom:6px}
.a-sub{color:var(--muted);font-size:14px;margin-bottom:28px}
.a-div{text-align:center;position:relative;margin:18px 0;color:var(--muted);font-size:13px}
.a-div::before,.a-div::after{content:'';position:absolute;top:50%;width:42%;height:1px;background:var(--border)}
.a-div::before{left:0}.a-div::after{right:0}
.a-sw{text-align:center;margin-top:24px;font-size:14px;color:var(--muted)}
.a-sw a{color:var(--amber);cursor:pointer;font-weight:600}
.pw-wrap{position:relative}
.pw-eye{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);display:flex;padding:0}
.pw-eye:hover{color:var(--text)}

/* misc */
.sep{height:1px;background:var(--border);margin:24px 0}
.fl{display:flex}.fla{align-items:center}.flb{justify-content:space-between}
.g2{gap:8px}.g3x{gap:12px}.g4x{gap:16px}
.mb3{margin-bottom:12px}.mb4{margin-bottom:16px}.mb6{margin-bottom:24px}.mb8{margin-bottom:32px}
.sm{font-size:13px}.xs{font-size:12px}.mu{color:var(--muted)}.am{color:var(--amber)}.gn{color:var(--green)}.rd{color:var(--red)}
.fw6{font-weight:600}.fw7{font-weight:700}.wf{width:100%}
.empty{text-align:center;padding:60px 24px;color:var(--muted)}
.empty-ic{font-size:48px;margin-bottom:16px}
.err{color:var(--red);font-size:13px;margin-top:6px}
@keyframes fi{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
.fin{animation:fi .3s ease forwards}
@keyframes sp{to{transform:rotate(360deg)}}
.spin-ic{animation:sp .8s linear infinite;display:inline-block}
@keyframes pu{0%,100%{opacity:1}50%{opacity:.4}}
.pulse{animation:pu 1.8s infinite}
`;

/* ── TOAST SYSTEM ────────────────────────────────────────────────────────────── */
let _tid = 0;
function useToast() {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg, type = "info") => {
    const id = ++_tid;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3600);
  }, []);
  return { toasts, toast };
}
function Toasts({ list }) {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  return <div className="toast-wrap">{list.map(t => <div key={t.id} className={`toast ${t.type}`}><span>{icons[t.type]}</span><span>{t.msg}</span></div>)}</div>;
}

/* ── ICONS ───────────────────────────────────────────────────────────────────── */
const Svg = (props) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props} />;
const Home = () => <Svg><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Svg>;
const Shield = () => <Svg><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Svg>;
const Brief = () => <Svg><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></Svg>;
const FileT = () => <Svg><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Svg>;
const UserIc = () => <Svg><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></Svg>;
const Plus = () => <Svg strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Svg>;
const X = () => <Svg><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Svg>;
const Check = () => <Svg strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></Svg>;
const Logout = () => <Svg><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Svg>;
const Trash = () => <Svg><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></Svg>;
const Edit = () => <Svg><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></Svg>;
const Download = () => <Svg><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></Svg>;
const Flag = () => <Svg><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Svg>;
const EyeOn = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const Spin = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="spin-ic"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>;

/* ── HELPERS ─────────────────────────────────────────────────────────────────── */
function Badge({ s }) {
  const m = { applied: "b-applied", interviewing: "b-interviewing", offer: "b-offer", rejected: "b-rejected", ghosted: "b-ghosted" };
  return <span className={`badge ${m[s] || "b-applied"}`}>{s}</span>;
}

function ScoreRing({ score }) {
  const col = score >= 70 ? "var(--green)" : score >= 40 ? "var(--amber)" : "var(--red)";
  return (
    <div className="ring">
      <svg viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.9155" stroke="var(--bg3)" strokeDasharray="100 0" />
        <circle cx="18" cy="18" r="15.9155" stroke={col} strokeDasharray={`${score} ${100 - score}`} style={{ transition: "stroke-dasharray 1.2s ease" }} />
      </svg>
      <div className="ring-val">
        <span className="ring-num" style={{ color: col }}>{score}</span>
        <span className="ring-sub">/ 100</span>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal fin" style={wide ? { maxWidth: 620 } : {}}>
        <div className="modal-hd">
          <h2 className="modal-title">{title}</h2>
          <button className="modal-x" onClick={onClose}><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadZone({ onFile, label = "Click to upload or drag & drop", hint = "PDF · DOCX · Max 5MB" }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const handle = f => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { alert("Max 5 MB."); return; }
    onFile(f);
  };
  return (
    <div className={`upload-zone ${drag ? "drag" : ""}`}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]); }}>
      <input ref={ref} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => handle(e.target.files[0])} />
      <div className="up-icon">📋</div>
      <p className="up-txt"><strong>{label}</strong></p>
      <p className="up-txt" style={{ fontSize: 12, marginTop: 4 }}>{hint}</p>
    </div>
  );
}

/* ── MOCK DATA ───────────────────────────────────────────────────────────────── */
const INIT_APPS = [
  { id: 1, company: "Google", role: "SWE Intern", status: "interviewing", date: "Feb 10", location: "Bangalore", stipend: "₹80K/mo", via: "LinkedIn", notes: "Round 2 scheduled" },
  { id: 2, company: "Razorpay", role: "Product Intern", status: "applied", date: "Feb 14", location: "Remote", stipend: "₹50K/mo", via: "Direct", notes: "" },
  { id: 3, company: "Microsoft", role: "PM Intern", status: "offer", date: "Jan 28", location: "Hyderabad", stipend: "₹90K/mo", via: "Referral", notes: "Deadline Mar 1" },
  { id: 4, company: "Groww", role: "Data Intern", status: "rejected", date: "Feb 1", location: "Bangalore", stipend: "₹40K/mo", via: "Internshala", notes: "" },
  { id: 5, company: "Startup XYZ", role: "ML Intern", status: "ghosted", date: "Jan 15", location: "Remote", stipend: "₹20K/mo", via: "WhatsApp", notes: "" },
  { id: 6, company: "Zerodha", role: "Backend Intern", status: "applied", date: "Feb 17", location: "Bangalore", stipend: "₹60K/mo", via: "LinkedIn", notes: "" },
];

/* ── AUTH ────────────────────────────────────────────────────────────────────── */
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState(1);
  const [f, setF] = useState({ name: "", email: "", password: "", college: "", branch: "", cgpa: "", bio: "" });
  const [skills, setSkills] = useState(["React", "Python", "SQL"]);
  const [ski, setSki] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [resume, setResume] = useState(null);
  const up = (k, v) => setF(p => ({ ...p, [k]: v }));

  // const doLogin = async () => {
  //   if (!f.email) { setErr("Email required."); return; }
  //   setLoading(true); setErr("");
  //   const data = await api("/auth/login", { method: "POST", body: JSON.stringify({ email: f.email, password: f.password }) });
  //   setLoading(false);
  //   if (data?.access_token) localStorage.setItem("ih_token", data.access_token);
  //   onLogin({ name: data?.name || f.email.split("@")[0], email: f.email });
  // };
  const doLogin = async () => {
  if (!f.email || !f.password) {
    setErr("Email and password required.");
    return;
  }

  setLoading(true);
  setErr("");

  const data = await api("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: f.email,
      password: f.password
    })
  });

  setLoading(false);

  if (!data?.access_token) {
    setErr("Invalid credentials.");
    return;
  }

  localStorage.setItem("ih_token", data.access_token);
  onLogin({ name: f.email.split("@")[0], email: f.email });
};
  const doSignup = async () => {
    if (!f.name || !f.email || !f.password) { setErr("All fields required."); return; }
    if (f.password.length < 6) { setErr("Password min 6 chars."); return; }
    setLoading(true); setErr("");
    const data = await api("/auth/signup", { method: "POST", body: JSON.stringify({ name: f.name, email: f.email, password: f.password }) });
    setLoading(false);
    if (data?.access_token) localStorage.setItem("ih_token", data.access_token);
    setStep(2);
  };

  const doProfile = async () => {
    setLoading(true);
    await api("/profile", { method: "PATCH", body: JSON.stringify({ college: f.college, branch: f.branch, cgpa: f.cgpa, bio: f.bio, skills }) });
    setLoading(false); setStep(3);
  };

  const doResume = async file => {
    setResume(file);
    const fd = new FormData(); fd.append("resume", file);
    await apiFile("/resume/upload", fd);
  };

  const addSkill = () => { const s = ski.trim(); if (s && !skills.includes(s)) setSkills(p => [...p, s]); setSki(""); };

  return (
    <div className="auth-page fin">
      <div className="auth-bg" /><div className="auth-grid" />
      <div className="auth-card" style={{ maxWidth: mode === "signup" && step > 1 ? 540 : 440 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <div className="logo-icon">IH</div>
          <span className="logo-text">Intern<span>Hub</span></span>
        </div>

        {mode === "signup" && (
          <div className="steps">
            {["Account", "Profile", "Resume"].map((s, i) => (
              <div key={s} className={`step ${step > i + 1 ? "done" : step === i + 1 ? "active" : ""}`}>
                <div className="step-dot">{step > i + 1 ? <Check /> : i + 1}</div>
                <div className="step-lbl">{s}</div>
              </div>
            ))}
          </div>
        )}

        {/* LOGIN */}
        {mode === "login" && <>
          <h2 className="a-title">Welcome back</h2>
          <p className="a-sub">Sign in to your placement dashboard</p>
          <div className="fg"><label>Email</label>
            <input type="email" placeholder="arjun@iitd.ac.in" value={f.email} onChange={e => up("email", e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
          </div>
          <div className="fg" style={{ marginBottom: 8 }}><label>Password</label>
            <div className="pw-wrap">
              <input type={showPw ? "text" : "password"} placeholder="••••••••" value={f.password} onChange={e => up("password", e.target.value)} onKeyDown={e => e.key === "Enter" && doLogin()} />
              <button className="pw-eye" onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff /> : <EyeOn />}</button>
            </div>
          </div>
          {err && <p className="err">{err}</p>}
          <div style={{ textAlign: "right", marginBottom: 16 }}><span className="sm am" style={{ cursor: "pointer" }}>Forgot password?</span></div>
          <button className="btn btn-p wf" style={{ justifyContent: "center", padding: "13px" }} onClick={doLogin} disabled={loading}>
            {loading ? <><Spin /> Signing in…</> : "Sign In"}
          </button>
          <div className="a-div">or</div>
          <button className="btn btn-g wf" style={{ justifyContent: "center", marginBottom: 8 }} onClick={() => onLogin({ name: "Demo User", email: "demo@internhub.app" })}>
            🎓 Continue as Demo
          </button>
          <div className="a-sw">Don't have an account? <a onClick={() => { setMode("signup"); setStep(1); setErr(""); }}>Sign up free</a></div>
        </>}

        {/* SIGNUP step 1 */}
        {mode === "signup" && step === 1 && <>
          <h2 className="a-title">Create account</h2>
          <p className="a-sub">Start your placement journey today</p>
          <div className="fg"><label>Full Name</label><input type="text" placeholder="Arjun Sharma" value={f.name} onChange={e => up("name", e.target.value)} /></div>
          <div className="fg"><label>Email</label><input type="email" placeholder="arjun@iitd.ac.in" value={f.email} onChange={e => up("email", e.target.value)} /></div>
          <div className="fg" style={{ marginBottom: 8 }}><label>Password</label>
            <div className="pw-wrap">
              <input type={showPw ? "text" : "password"} placeholder="Min 6 characters" value={f.password} onChange={e => up("password", e.target.value)} />
              <button className="pw-eye" onClick={() => setShowPw(v => !v)}>{showPw ? <EyeOff /> : <EyeOn />}</button>
            </div>
          </div>
          {err && <p className="err">{err}</p>}
          <button className="btn btn-p wf" style={{ justifyContent: "center", padding: 13, marginTop: 12 }} onClick={doSignup} disabled={loading}>
            {loading ? <><Spin /> Creating…</> : "Create Account →"}
          </button>
          <div className="a-sw" style={{ marginTop: 20 }}>Already have an account? <a onClick={() => { setMode("login"); setErr(""); }}>Sign in</a></div>
        </>}

        {/* SIGNUP step 2 */}
        {mode === "signup" && step === 2 && <>
          <h2 className="a-title">Your Profile</h2>
          <p className="a-sub">Help us personalize your experience</p>
          <div className="g2" style={{ gap: 12 }}>
            <div className="fg"><label>College</label><input type="text" placeholder="IIT Delhi" value={f.college} onChange={e => up("college", e.target.value)} /></div>
            <div className="fg"><label>Branch & Year</label><input type="text" placeholder="CSE · 2025" value={f.branch} onChange={e => up("branch", e.target.value)} /></div>
          </div>
          <div className="fg"><label>CGPA</label><input type="number" placeholder="8.5" step="0.1" min="0" max="10" value={f.cgpa} onChange={e => up("cgpa", e.target.value)} /></div>
          <div className="fg">
            <label>Skills</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {skills.map(s => <span key={s} className="chip">{s}<span className="chip-x" onClick={() => setSkills(p => p.filter(x => x !== s))}><X /></span></span>)}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input type="text" placeholder="Add skill + Enter" value={ski} onChange={e => setSki(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} style={{ flex: 1 }} />
              <button className="btn btn-g btn-sm" onClick={addSkill}><Plus /></button>
            </div>
          </div>
          <div className="fg"><label>Bio</label><textarea placeholder="Tell us about yourself…" value={f.bio} onChange={e => up("bio", e.target.value)} rows={3} /></div>
          <button className="btn btn-p wf" style={{ justifyContent: "center" }} onClick={doProfile} disabled={loading}>
            {loading ? <><Spin /> Saving…</> : "Continue →"}
          </button>
        </>}

        {/* SIGNUP step 3 */}
        {mode === "signup" && step === 3 && <>
          <h2 className="a-title">Upload Resume</h2>
          <p className="a-sub">Upload once, apply everywhere</p>
          {resume ? (
            <div className="fpill mb6">
              <span style={{ fontSize: 28 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{resume.name}</div>
                <div className="xs mu">{(resume.size / 1024).toFixed(0)} KB · Uploaded ✅</div>
              </div>
            </div>
          ) : <UploadZone onFile={doResume} label="Click to upload your resume" />}
          <div className="sep" />
          <button className="btn btn-p wf" style={{ justifyContent: "center" }} onClick={() => onLogin({ name: f.name, email: f.email })}>
            {resume ? "Enter Dashboard →" : "Skip for Now →"}
          </button>
        </>}
      </div>
    </div>
  );
}

/* ── DASHBOARD ───────────────────────────────────────────────────────────────── */
function Dashboard({ apps, goTo }) {
  const cnt = s => apps.filter(a => a.status === s).length;
  const stats = [
    { v: apps.length, l: "Total Applications", note: `${apps.filter(a => ["Feb 14","Feb 17"].includes(a.date)).length} added recently`, col: "var(--text)" },
    { v: cnt("interviewing"), l: "Active Interviews", note: apps.filter(a => a.status === "interviewing").map(a => a.company).join(", ") || "None", col: "var(--amber)" },
    { v: cnt("offer"), l: "Offers Received", note: cnt("offer") > 0 ? apps.filter(a => a.status === "offer").map(a => a.company).join(", ") + " 🎉" : "Keep going!", col: "var(--green)" },
    { v: cnt("applied"), l: "Awaiting Reply", note: `Response rate: ${Math.round((cnt("interviewing") + cnt("offer")) / Math.max(apps.length, 1) * 100)}%`, col: "var(--blue)" },
  ];

  return (
    <div className="fin">
      <div className="topbar">
        <div><h1 className="page-title">Dashboard 👋</h1><p className="page-sub">Your placement overview at a glance.</p></div>
        <button className="btn btn-p" onClick={() => goTo("tracker")}><Plus /> Add Application</button>
      </div>
      <div className="g4 mb8">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-val" style={{ color: s.col }}>{s.v}</div>
            <div className="stat-lbl">{s.l}</div>
            <div className="stat-note">{s.note}</div>
          </div>
        ))}
      </div>
      <div className="g2">
        <div className="card">
          <div className="fl fla flb mb4">
            <h3 style={{ fontSize: 16, fontWeight: 700 }}>Recent Applications</h3>
            <span className="sm am" style={{ cursor: "pointer" }} onClick={() => goTo("tracker")}>View all →</span>
          </div>
          {apps.slice(0, 5).map(a => (
            <div key={a.id} className="fl fla flb" style={{ padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
              <div className="fl fla" style={{ gap: 12 }}>
                <div className="avatar" style={{ width: 36, height: 36, fontSize: 13, borderRadius: 8 }}>{a.company[0]}</div>
                <div><div style={{ fontSize: 14, fontWeight: 600 }}>{a.company}</div><div className="sm mu">{a.role} · {a.date}</div></div>
              </div>
              <Badge s={a.status} />
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>Pipeline Breakdown</h3>
          {["applied", "interviewing", "offer", "rejected", "ghosted"].map(s => {
            const cols = { applied: "var(--blue)", interviewing: "var(--amber)", offer: "var(--green)", rejected: "var(--red)", ghosted: "var(--muted)" };
            const n = cnt(s); const pct = apps.length ? Math.round(n / apps.length * 100) : 0;
            return (
              <div key={s} className="bar-wrap">
                <div className="bar-top"><span className="mu" style={{ textTransform: "capitalize" }}>{s}</span><span>{n} ({pct}%)</span></div>
                <div className="bar-bg"><div className="bar-fill" style={{ width: pct + "%", background: cols[s] }} /></div>
              </div>
            );
          })}
          <div className="sep" />
          <div className="sm mu">💡 <strong style={{ color: "var(--text)" }}>Tip:</strong> Use <span className="am" style={{ cursor: "pointer" }} onClick={() => goTo("truthlens")}>TruthLens</span> before applying to unknown listings.</div>
        </div>
      </div>
    </div>
  );
}

/* ── TRUTHLENS ───────────────────────────────────────────────────────────────── */
function TruthLens({ toast }) {
  const [tab, setTab] = useState("url");
  const [url, setUrl] = useState("");
  const [jd, setJd] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reported, setReported] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");

  const canAnalyze = tab === "url" ? url.trim().length > 5 : jd.trim().length > 20;

  const analyze = async () => {
    if (!canAnalyze) { toast("Enter a valid URL or job description.", "error"); return; }
    setLoading(true); setResult(null);
    const data = await api("/scamshield/analyze", { method: "POST", body: JSON.stringify({ url: tab === "url" ? url : "", jd: tab === "jd" ? jd : "", recruiter_email: email }) });
    const mock = {
      score: 38, verdict: "High Risk", badge: "scam", community_reports: 3,
      flags: [
        { t: "danger", icon: "🚨", label: "WhatsApp-only contact", detail: "Legitimate companies use official email domains for hiring." },
        { t: "danger", icon: "💸", label: "Upfront fee mentioned", detail: "Detected phrase: 'registration fee of ₹500'. Major red flag." },
        { t: "warning", icon: "⚠️", label: "Unverified email domain", detail: ".tk domains are free and frequently used in scam listings." },
        { t: "warning", icon: "📈", label: "Unrealistic salary", detail: "₹1,20,000/month for a fresher is far above market rate." },
        { t: "ok", icon: "✅", label: "Company name verifiable", detail: "Found a matching LinkedIn company page with 500+ employees." },
      ],
    };
    setTimeout(() => { setResult(data || mock); setLoading(false); toast("Analysis complete!", "success"); }, 1800);
  };

  const submitReport = async () => {
    if (!reportReason) { toast("Please select a reason.", "error"); return; }
    await api("/scamshield/report", { method: "POST", body: JSON.stringify({ url, jd, reason: reportReason }) });
    setReported(true); setReportModal(false);
    toast("Report submitted. Thank you for keeping the community safe!", "success");
  };

  return (
    <div className="fin">
      {reportModal && (
        <Modal title="🚩 Report Listing" onClose={() => setReportModal(false)}>
          <div className="fg"><label>Reason</label>
            <select value={reportReason} onChange={e => setReportReason(e.target.value)}>
              <option value="">Select…</option>
              <option value="scam">Scam / Fraudulent</option>
              <option value="fee">Asking for money</option>
              <option value="fake">Fake company</option>
              <option value="misleading">Misleading info</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="fg"><label>Additional details (optional)</label><textarea placeholder="Tell us more…" rows={3} /></div>
          <div className="fl" style={{ gap: 12 }}>
            <button className="btn btn-d" style={{ flex: 1, justifyContent: "center" }} onClick={submitReport}>Submit Report</button>
            <button className="btn btn-g" onClick={() => setReportModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}

      <div className="topbar">
        <div><h1 className="page-title">TruthLens 🔍</h1><p className="page-sub">ScamShield — verify any internship before applying</p></div>
        <div className="fl fla" style={{ gap: 10 }}>
          <span style={{ width: 7, height: 7, background: "var(--green)", borderRadius: "50%", display: "inline-block" }} className="pulse" />
          <span className="sm mu">Live Analysis</span>
          {result && <button className="btn btn-g btn-sm" onClick={() => { setResult(null); setUrl(""); setJd(""); setEmail(""); setReported(false); }}>← New</button>}
        </div>
      </div>

      <div className="g2" style={{ alignItems: "start" }}>
        <div>
          <div className="card mb6">
            <div className="tabs">
              <button className={`tab ${tab === "url" ? "active" : ""}`} onClick={() => setTab("url")}>Paste URL</button>
              <button className={`tab ${tab === "jd" ? "active" : ""}`} onClick={() => setTab("jd")}>Job Description</button>
            </div>
            {tab === "url"
              ? <div className="fg"><label>Job Listing URL</label><input type="url" placeholder="https://internshala.com/internship/…" value={url} onChange={e => setUrl(e.target.value)} /></div>
              : <div className="fg"><label>Job Description</label><textarea placeholder="Paste the full internship listing here…" rows={7} value={jd} onChange={e => setJd(e.target.value)} /></div>
            }
            <div className="fg" style={{ marginBottom: 20 }}><label>Recruiter Email (optional)</label><input type="email" placeholder="recruiter@company.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button className="btn btn-p wf" style={{ justifyContent: "center", padding: 13 }} onClick={analyze} disabled={loading || !canAnalyze}>
              {loading ? <><Spin /> Analyzing…</> : <><Shield /> Analyze with ScamShield</>}
            </button>
          </div>
          {result && (
            <div className="card fin">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Community Reports</h3>
              <div className="sm mu" style={{ marginBottom: 16 }}>
                {reported ? "Your report has been submitted. Thank you!" : `${result.community_reports} students flagged this listing.`}
              </div>
              <button className="btn btn-d wf" style={{ justifyContent: "center" }} onClick={() => setReportModal(true)} disabled={reported}>
                <Flag /> {reported ? "Reported ✓" : "Report this Listing"}
              </button>
            </div>
          )}
        </div>
        <div>
          {!result && !loading && (
            <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🛡️</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Paste a listing to analyze</h3>
              <p className="mu" style={{ fontSize: 14, maxWidth: 280, margin: "0 auto" }}>ScamShield checks domains, keywords, salary claims, and community reports to give you a trust score.</p>
            </div>
          )}
          {loading && (
            <div className="card" style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }} className="pulse">🔍</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Scanning listing…</h3>
              <p className="mu sm">Checking domain reputation, scam keywords, salary ranges, community data…</p>
            </div>
          )}
          {result && (
            <div className="fin">
              <div className="card mb6">
                <div className="ring-wrap">
                  <ScoreRing score={result.score} />
                  <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, marginTop: 16 }}>{result.verdict}</h3>
                  <span className={`badge b-${result.badge}`} style={{ marginTop: 6 }}>ScamShield verdict</span>
                </div>
              </div>
              <div className="card">
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Risk Flags ({result.flags.length})</h3>
                {result.flags.map((fl, i) => (
                  <div key={i} className={`flag ${fl.t}`}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{fl.icon}</span>
                    <div><div className="flag-lbl">{fl.label}</div><div className="flag-det">{fl.detail}</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── TRACKER ─────────────────────────────────────────────────────────────────── */
const STATUSES = ["applied", "interviewing", "offer", "rejected", "ghosted"];
const BLANK = { company: "", role: "", stipend: "", location: "", via: "", notes: "", status: "applied" };

function Tracker({ apps, setApps, toast }) {
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [savingId, setSavingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const setF = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  const openAdd = () => { setForm(BLANK); setEditApp(null); setModal(true); };
  const openEdit = a => { setForm({ ...a }); setEditApp(a); setModal(true); };

  const save = async () => {
    if (!form.company || !form.role) { toast("Company and role required.", "error"); return; }
    if (editApp) {
      const data = await api(`/applications/${editApp.id}`, { method: "PATCH", body: JSON.stringify({status: form.status}) });
      setApps(p => p.map(a => a.id === editApp.id ? (data || { ...form, id: editApp.id }) : a));
      toast("Application updated!", "success");
    } else {
      const data = await api("/applications", { method: "POST", body: JSON.stringify(form) });
      const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
      // setApps(p => [data || { ...form, id: Date.now(), date: now }, ...p]);
      if (data) {
        setApps(p => [data, ...p]);
      }
      toast("Application added!", "success");
    }
    setModal(false);
  };

  const updateStatus = async (id, status) => {
    setSavingId(id);
    setApps(p => p.map(a => a.id === id ? { ...a, status } : a));
    await api(`/applications/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    setSavingId(null);
    toast(`Status → ${status}`, "success");
  };

  const del = async id => {
    await api(`/applications/${id}`, { method: "DELETE" });
    setApps(p => p.filter(a => a.id !== id));
    setDeleteId(null);
    toast("Removed.", "info");
  };

  return (
    <div className="fin">
      {modal && (
        <Modal title={editApp ? "Edit Application" : "Add Application"} onClose={() => setModal(false)} wide>
          <div className="g2" style={{ gap: 12 }}>
            <div className="fg"><label>Company *</label><input type="text" placeholder="Google" value={form.company} onChange={e => setF("company", e.target.value)} /></div>
            <div className="fg"><label>Role *</label><input type="text" placeholder="SWE Intern" value={form.role} onChange={e => setF("role", e.target.value)} /></div>
            <div className="fg"><label>Stipend</label><input type="text" placeholder="₹50K/mo" value={form.stipend} onChange={e => setF("stipend", e.target.value)} /></div>
            <div className="fg"><label>Location</label><input type="text" placeholder="Bangalore / Remote" value={form.location} onChange={e => setF("location", e.target.value)} /></div>
            <div className="fg"><label>Applied Via</label><input type="text" placeholder="LinkedIn, Direct…" value={form.via} onChange={e => setF("via", e.target.value)} /></div>
            <div className="fg"><label>Status</label>
              <select value={form.status} onChange={e => setF("status", e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="fg"><label>Notes</label><textarea placeholder="Anything to remember…" value={form.notes} onChange={e => setF("notes", e.target.value)} rows={3} /></div>
          <div className="fl" style={{ gap: 12 }}>
            <button className="btn btn-p" style={{ flex: 1, justifyContent: "center" }} onClick={save}>{editApp ? "Save Changes" : "Add Application"}</button>
            <button className="btn btn-g" onClick={() => setModal(false)}>Cancel</button>
          </div>
        </Modal>
      )}
      {deleteId && (
        <Modal title="Delete Application" onClose={() => setDeleteId(null)}>
          <p className="mu" style={{ marginBottom: 24 }}>Remove this application? This cannot be undone.</p>
          <div className="fl" style={{ gap: 12 }}>
            <button className="btn btn-d" style={{ flex: 1, justifyContent: "center" }} onClick={() => del(deleteId)}>Delete</button>
            <button className="btn btn-g" onClick={() => setDeleteId(null)}>Cancel</button>
          </div>
        </Modal>
      )}

      <div className="topbar">
        <div><h1 className="page-title">Opportunity Tracker</h1><p className="page-sub">Track every application. Stay organized.</p></div>
        <div className="tbar-right">
          <select className="isel" value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: "9px 14px", fontSize: 14 }}>
            <option value="all">All ({apps.length})</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)} ({apps.filter(a => a.status === s).length})</option>)}
          </select>
          <button className="btn btn-p" onClick={openAdd}><Plus /> Add</button>
        </div>
      </div>

      <div className="card mb6">
        <div className="tbl-wrap">
          {filtered.length === 0
            ? <div className="empty"><div className="empty-ic">📭</div><p>No applications. <span className="am" style={{ cursor: "pointer" }} onClick={openAdd}>Add your first one!</span></p></div>
            : <table>
              <thead><tr><th>Company</th><th>Role</th><th>Stipend</th><th>Location</th><th>Via</th><th>Date</th><th>Status</th><th>Update</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td><div className="fl fla" style={{ gap: 8 }}><div className="avatar" style={{ width: 30, height: 30, fontSize: 11, borderRadius: 6 }}>{a.company[0]}</div><span style={{ fontWeight: 600 }}>{a.company}</span></div></td>
                    <td className="mu">{a.role}</td>
                    <td style={{ fontWeight: 600, color: "var(--green)" }}>{a.stipend || "—"}</td>
                    <td className="mu">{a.location || "—"}</td>
                    <td><span className="chip">{a.via || "—"}</span></td>
                    <td className="mu">{a.date}</td>
                    <td><Badge s={a.status} /></td>
                    <td>
                      <div className="fl fla" style={{ gap: 6 }}>
                        {savingId === a.id && <Spin />}
                        <select className="isel" value={a.status} onChange={e => updateStatus(a.id, e.target.value)}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </td>
                    <td>
                      <div className="fl" style={{ gap: 6 }}>
                        <button className="btn btn-g btn-icon" title="Edit" onClick={() => openEdit(a)} style={{ color: "var(--muted)" }}><Edit /></button>
                        <button className="btn btn-g btn-icon" title="Delete" onClick={() => setDeleteId(a.id)} style={{ color: "var(--muted)" }}><Trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        </div>
      </div>

      <div className="g5">
        {STATUSES.map(s => {
          const cols = { applied: "var(--blue)", interviewing: "var(--amber)", offer: "var(--green)", rejected: "var(--red)", ghosted: "var(--muted)" };
          const n = apps.filter(a => a.status === s).length;
          return (
            <div key={s} className="stat-card" style={{ cursor: "pointer" }} onClick={() => setFilter(filter === s ? "all" : s)}>
              <div className="stat-val" style={{ fontSize: 24, color: cols[s] }}>{n}</div>
              <div style={{ marginTop: 6 }}><Badge s={s} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── ATS CHECKER ─────────────────────────────────────────────────────────────── */
function ATSChecker({ toast }) {
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState("");
  const [showJd, setShowJd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFile = async f => {
    setFile(f); setLoading(true); setResult(null);
    const fd = new FormData(); fd.append("resume", f);
    if (jd) fd.append("job_description", jd);
    const data = await apiFile("/ats/check", fd);
    const mock = {
      overall: 67,
      categories: [
        { label: "Keyword Match", score: 62, color: "var(--amber)" },
        { label: "Formatting", score: 88, color: "var(--green)" },
        { label: "Section Structure", score: 75, color: "var(--green)" },
        { label: "Action Verbs", score: 45, color: "var(--red)" },
        { label: "Quantification", score: 30, color: "var(--red)" },
        { label: "Length & Density", score: 90, color: "var(--green)" },
      ],
      suggestions: [
        { icon: "🎯", title: "Add more keywords", detail: "Missing: 'REST API', 'CI/CD', 'Agile', 'Docker'. Add these to match target JDs." },
        { icon: "📊", title: "Quantify achievements", detail: "Replace 'improved performance' → 'improved API response time by 40%'." },
        { icon: "⚡", title: "Stronger action verbs", detail: "Replace 'worked on', 'helped with' → 'Engineered', 'Architected', 'Optimized'." },
        { icon: "📄", title: "Add a summary section", detail: "A 2–3 line professional summary at the top significantly boosts ATS ranking." },
        { icon: "🔗", title: "Include project links", detail: "Add GitHub or live demo links to your projects." },
      ],
    };
    setTimeout(() => { setResult(data || mock); setLoading(false); toast("Resume analysis complete!", "success"); }, 1800);
  };

  const downloadTips = () => {
    if (!result) return;
    const txt = `InternHub ATS Report\n\nOverall Score: ${result.overall}/100\n\nSuggestions:\n${result.suggestions.map((s, i) => `${i + 1}. ${s.title}\n   ${s.detail}`).join("\n\n")}`;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/plain" }));
    a.download = "ats_tips.txt"; a.click();
    toast("Tips downloaded!", "success");
  };

  return (
    <div className="fin">
      <div className="topbar">
        <div><h1 className="page-title">Resume ATS Checker</h1><p className="page-sub">Score your resume against ATS systems used by top companies</p></div>
        <div className="fl" style={{ gap: 8 }}>
          {result && <button className="btn btn-g btn-sm" onClick={() => { setFile(null); setResult(null); }}>← Upload Another</button>}
          <button className="btn btn-g btn-sm" onClick={() => setShowJd(v => !v)}>
            {showJd ? "Hide JD" : "Add Job Description"}
          </button>
        </div>
      </div>

      {showJd && (
        <div className="card mb6 fin">
          <div className="fg" style={{ marginBottom: 0 }}>
            <label>Target Job Description (for better keyword matching)</label>
            <textarea placeholder="Paste the JD you're applying for…" rows={4} value={jd} onChange={e => setJd(e.target.value)} />
          </div>
        </div>
      )}

      {!file && !loading && (
        <div style={{ maxWidth: 540, margin: "0 auto" }}>
          <UploadZone onFile={handleFile} label="Click to upload your resume" hint="PDF or DOCX · Max 5MB · Your resume is never stored" />
          <div className="fl fla" style={{ justifyContent: "center", gap: 12, marginTop: 20 }}>
            <span className="chip">✅ Confidential</span>
            <span className="chip">✅ Instant results</span>
            <span className="chip">✅ ATS-accurate</span>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: "center", padding: "60px 24px", maxWidth: 520, margin: "0 auto" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }} className="pulse">🤖</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Scanning resume…</h3>
          <p className="mu sm">Parsing sections, checking keywords, evaluating formatting…</p>
          <div className="xs mu" style={{ marginTop: 16 }}>{file?.name}</div>
        </div>
      )}

      {result && (
        <div className="g2 fin" style={{ alignItems: "start" }}>
          <div>
            <div className="card mb6">
              <div className="ring-wrap">
                <ScoreRing score={result.overall} />
                <h3 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 20, marginTop: 16 }}>
                  {result.overall >= 70 ? "ATS Friendly ✅" : result.overall >= 50 ? "Needs Work ⚠️" : "ATS Unfriendly ❌"}
                </h3>
                <p className="mu sm" style={{ marginTop: 4 }}>{file?.name} · {(file?.size / 1024).toFixed(0)} KB</p>
              </div>
            </div>
            <div className="card">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Category Breakdown</h3>
              {result.categories.map(c => (
                <div key={c.label} className="bar-wrap" style={{ marginBottom: 14 }}>
                  <div className="bar-top"><span>{c.label}</span><span style={{ color: c.color, fontWeight: 700 }}>{c.score}%</span></div>
                  <div className="bar-bg" style={{ height: 8 }}><div className="bar-fill" style={{ width: c.score + "%", background: c.color }} /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Improvement Suggestions</h3>
            <p className="mu sm" style={{ marginBottom: 20 }}>Apply these fixes to significantly boost your score</p>
            {result.suggestions.map((s, i) => (
              <div key={i} style={{ padding: "16px 0", borderBottom: i < result.suggestions.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div className="fl" style={{ gap: 12 }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                  <div><div style={{ fontWeight: 600, marginBottom: 4 }}>{s.title}</div><div className="sm mu">{s.detail}</div></div>
                </div>
              </div>
            ))}
            <div className="sep" />
            <button className="btn btn-p wf" style={{ justifyContent: "center" }} onClick={downloadTips}><Download /> Download Tips as TXT</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── PROFILE ─────────────────────────────────────────────────────────────────── */
function Profile({ user, setUser, onLogout, toast }) {
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ name: user.name, email: user.email, college: "IIT Delhi", branch: "B.Tech CSE · 2025", cgpa: "8.7", bio: "Final year CSE student passionate about product and ML.", roles: "SWE Intern, Product Intern, ML Intern", locations: "Bangalore, Mumbai, Remote", stipend: "₹40,000/month" });
  const [skills, setSkills] = useState(["React", "Node.js", "Python", "TensorFlow", "SQL", "Docker", "Git", "Figma", "ML"]);
  const [ski, setSki] = useState("");
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [togs, setTogs] = useState({ emailNotifs: true, scamAlerts: true, publicProfile: false });
  const fileRef = useRef(null);
  const up = (k, v) => setF(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    await api("/profile", { method: "PATCH", body: JSON.stringify({ ...f, skills }) });
    setUser(p => ({ ...p, name: f.name }));
    setSaving(false); setEdit(false);
    toast("Profile saved!", "success");
  };

  const handleResume = async file => {
    setResume(file);
    const fd = new FormData(); fd.append("resume", file);
    await apiFile("/resume/upload", fd);
    toast("Resume updated!", "success");
  };

  const togToggle = async key => {
    const next = !togs[key];
    setTogs(p => ({ ...p, [key]: next }));
    await api("/profile/settings", { method: "PATCH", body: JSON.stringify({ [key]: next }) });
    toast(`${key === "emailNotifs" ? "Email notifications" : key === "scamAlerts" ? "ScamShield alerts" : "Public profile"} ${next ? "enabled" : "disabled"}`, "info");
  };

  const addSkill = () => { const s = ski.trim(); if (s && !skills.includes(s)) setSkills(p => [...p, s]); setSki(""); };

  return (
    <div className="fin">
      <div className="topbar">
        <div><h1 className="page-title">My Profile</h1><p className="page-sub">Manage your information and preferences</p></div>
        <div className="fl" style={{ gap: 8 }}>
          {edit ? (
            <>
              <button className="btn btn-g" onClick={() => setEdit(false)}>Cancel</button>
              <button className="btn btn-p" onClick={save} disabled={saving}>{saving ? <><Spin /> Saving…</> : <><Check /> Save Changes</>}</button>
            </>
          ) : (
            <button className="btn btn-g" onClick={() => setEdit(true)}><Edit /> Edit Profile</button>
          )}
        </div>
      </div>

      <div className="g2" style={{ alignItems: "start" }}>
        <div>
          <div className="card mb6">
            <div className="fl" style={{ gap: 16, alignItems: "center", marginBottom: 24 }}>
              <div className="avatar" style={{ width: 72, height: 72, fontSize: 28, borderRadius: 16 }}>{f.name?.[0]?.toUpperCase() || "U"}</div>
              <div>
                <div style={{ fontFamily: "Syne", fontSize: 20, fontWeight: 800 }}>{f.name}</div>
                <div className="mu sm">{f.email}</div>
                <span className="chip" style={{ marginTop: 6 }}>{f.college} · {f.branch}</span>
              </div>
            </div>
            <div className="fg"><label>Full Name</label><input type="text" value={f.name} disabled={!edit} onChange={e => up("name", e.target.value)} /></div>
            <div className="fg"><label>Email</label><input type="email" value={f.email} disabled={!edit} onChange={e => up("email", e.target.value)} /></div>
            <div className="g2" style={{ gap: 12 }}>
              <div className="fg"><label>College</label><input type="text" value={f.college} disabled={!edit} onChange={e => up("college", e.target.value)} /></div>
              <div className="fg"><label>CGPA</label><input type="text" value={f.cgpa} disabled={!edit} onChange={e => up("cgpa", e.target.value)} /></div>
            </div>
            <div className="fg" style={{ marginBottom: 0 }}><label>Bio</label><textarea value={f.bio} disabled={!edit} onChange={e => up("bio", e.target.value)} rows={3} /></div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Resume</h3>
            <div className="fpill mb4">
              <span style={{ fontSize: 28 }}>📄</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{resume ? resume.name : "Arjun_Resume_2025.pdf"}</div>
                <div className="xs mu">{resume ? `${(resume.size / 1024).toFixed(0)} KB · Just uploaded` : "Uploaded Feb 14 · 245 KB"}</div>
              </div>
              {resume && <span style={{ color: "var(--green)" }}>✅</span>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.docx" style={{ display: "none" }} onChange={e => handleResume(e.target.files[0])} />
            <button className="btn btn-g wf" style={{ justifyContent: "center" }} onClick={() => fileRef.current.click()}>Replace Resume</button>
          </div>
        </div>

        <div>
          <div className="card mb6">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: edit ? 12 : 0 }}>
              {skills.map(s => (
                <span key={s} className="chip">{s}
                  {edit && <span className="chip-x" onClick={() => setSkills(p => p.filter(x => x !== s))}><X /></span>}
                </span>
              ))}
            </div>
            {edit && (
              <div className="fl" style={{ gap: 8 }}>
                <input type="text" placeholder="Add skill…" value={ski} onChange={e => setSki(e.target.value)} onKeyDown={e => e.key === "Enter" && addSkill()} style={{ flex: 1 }} />
                <button className="btn btn-g btn-sm" onClick={addSkill}><Plus /></button>
              </div>
            )}
          </div>

          <div className="card mb6">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Target Preferences</h3>
            <div className="fg"><label>Desired Roles</label><input type="text" value={f.roles} disabled={!edit} onChange={e => up("roles", e.target.value)} /></div>
            <div className="fg"><label>Preferred Locations</label><input type="text" value={f.locations} disabled={!edit} onChange={e => up("locations", e.target.value)} /></div>
            <div className="fg" style={{ marginBottom: 0 }}><label>Min Stipend</label><input type="text" value={f.stipend} disabled={!edit} onChange={e => up("stipend", e.target.value)} /></div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Settings</h3>
            {[
              { k: "emailNotifs", label: "Email notifications", desc: "Application updates & reminders" },
              { k: "scamAlerts", label: "ScamShield alerts", desc: "Flagged listings in your saved searches" },
              { k: "publicProfile", label: "Public profile", desc: "Visible to seniors & alumni for referrals" },
            ].map(t => (
              <div key={t.k} className="tog-row">
                <div><div style={{ fontSize: 14, fontWeight: 500 }}>{t.label}</div><div className="xs mu">{t.desc}</div></div>
                <div className={`tog ${togs[t.k] ? "on" : ""}`} onClick={() => togToggle(t.k)} />
              </div>
            ))}
            <div className="sep" />
            <button className="btn btn-d wf" style={{ justifyContent: "center" }} onClick={onLogout}><Logout /> Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── APP SHELL ───────────────────────────────────────────────────────────────── */
// export default function App() {
//   const [authed, setAuthed] = useState(false);
//   const [user, setUser] = useState({ name: "", email: "" });
//   const [page, setPage] = useState("dashboard");
//   const [apps, setApps] = useState(INIT_APPS);
//   const { toasts, toast } = useToast();

//   const login = u => { setUser(u); setAuthed(true); setPage("dashboard"); };
//   const logout = () => { localStorage.removeItem("ih_token"); setAuthed(false); toast("Signed out.", "info"); };

//   const nav = [
//     { id: "dashboard", label: "Dashboard", Icon: Home },
//     { id: "truthlens", label: "TruthLens", Icon: Shield, badge: "NEW" },
//     { id: "tracker", label: "Tracker", Icon: Brief, count: apps.filter(a => a.status === "applied").length },
//     { id: "ats", label: "ATS Checker", Icon: FileT },
//     { id: "profile", label: "Profile", Icon: UserIc },
//   ];

//   if (!authed) return (
//     <>
//       <style>{CSS}</style>
//       <AuthPage onLogin={login} />
//       <Toasts list={toasts} />
//     </>
//   );

//   return (
//     <>
//       <style>{CSS}</style>
//       <div className="app">
//         <nav className="sidebar">
//           <div className="s-logo">
//             <div className="logo-icon">IH</div>
//             <span className="logo-text">Intern<span>Hub</span></span>
//           </div>
//           <div className="nav-section">
//             <div className="nav-lbl">Navigation</div>
//             {nav.map(n => (
//               <button key={n.id} className={`nav-btn ${page === n.id ? "active" : ""}`} onClick={() => setPage(n.id)}>
//                 <span className="nav-icon"><n.Icon /></span>
//                 {n.label}
//                 {n.badge && <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "rgba(245,166,35,.2)", color: "var(--amber)", padding: "2px 7px", borderRadius: 20 }}>{n.badge}</span>}
//                 {n.count > 0 && !n.badge && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "var(--bg3)", color: "var(--muted)", padding: "2px 8px", borderRadius: 20 }}>{n.count}</span>}
//               </button>
//             ))}
//           </div>
//           <div className="s-user">
//             <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>{user.name?.[0]?.toUpperCase() || "U"}</div>
//             <div style={{ flex: 1, overflow: "hidden" }}>
//               <div className="user-name">{user.name}</div>
//               <div className="user-role">{user.email}</div>
//             </div>
//           </div>
//         </nav>

//         <main className="main">
//           {page === "dashboard" && <Dashboard apps={apps} goTo={setPage} />}
//           {page === "truthlens" && <TruthLens toast={toast} />}
//           {page === "tracker" && <Tracker apps={apps} setApps={setApps} toast={toast} />}
//           {page === "ats" && <ATSChecker toast={toast} />}
//           {page === "profile" && <Profile user={user} setUser={setUser} onLogout={logout} toast={toast} />}
//         </main>
//       </div>
//       <Toasts list={toasts} />
//     </>
//   );
// }

export default function App() {
  const [authed, setAuthed] = useState(!!localStorage.getItem("ih_token"));
  const [user, setUser] = useState({ name: "", email: "" });
  const [page, setPage] = useState("dashboard");
  const [apps, setApps] = useState([]);
  const { toasts, toast } = useToast();

  const login = u => {
    setUser(u);
    setAuthed(true);
    setPage("dashboard");
  };

  const logout = () => {
    localStorage.removeItem("ih_token");
    setAuthed(false);
    setApps([]);
    toast("Signed out.", "info");
  };

  // FETCH APPLICATIONS FROM BACKEND AFTER LOGIN
  useEffect(() => {
    const fetchApps = async () => {
      const data = await api("/applications/");
      if (data) setApps(data);
    };

    if (authed) {
      fetchApps();
    }
  }, [authed]);

  const nav = [
    { id: "dashboard", label: "Dashboard", Icon: Home },
    { id: "truthlens", label: "TruthLens", Icon: Shield, badge: "NEW" },
    { id: "tracker", label: "Tracker", Icon: Brief, count: apps.filter(a => a.status === "applied").length },
    { id: "ats", label: "ATS Checker", Icon: FileT },
    { id: "profile", label: "Profile", Icon: UserIc },
  ];

  if (!authed)
    return (
      <>
        <style>{CSS}</style>
        <AuthPage onLogin={login} />
        <Toasts list={toasts} />
      </>
    );

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <nav className="sidebar">
          <div className="s-logo">
            <div className="logo-icon">IH</div>
            <span className="logo-text">Intern<span>Hub</span></span>
          </div>

          <div className="nav-section">
            <div className="nav-lbl">Navigation</div>
            {nav.map(n => (
              <button
                key={n.id}
                className={`nav-btn ${page === n.id ? "active" : ""}`}
                onClick={() => setPage(n.id)}
              >
                <span className="nav-icon"><n.Icon /></span>
                {n.label}
                {n.badge && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 10,
                    fontWeight: 700,
                    background: "rgba(245,166,35,.2)",
                    color: "var(--amber)",
                    padding: "2px 7px",
                    borderRadius: 20
                  }}>
                    {n.badge}
                  </span>
                )}
                {n.count > 0 && !n.badge && (
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 700,
                    background: "var(--bg3)",
                    color: "var(--muted)",
                    padding: "2px 8px",
                    borderRadius: 20
                  }}>
                    {n.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="s-user">
            <div className="avatar" style={{ width: 34, height: 34, fontSize: 13 }}>
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div className="user-name">{user.name}</div>
              <div className="user-role">{user.email}</div>
            </div>
          </div>
        </nav>

        <main className="main">
          {page === "dashboard" && <Dashboard apps={apps} goTo={setPage} />}
          {page === "truthlens" && <TruthLens toast={toast} />}
          {page === "tracker" && <Tracker apps={apps} setApps={setApps} toast={toast} />}
          {page === "ats" && <ATSChecker toast={toast} />}
          {page === "profile" && (
            <Profile
              user={user}
              setUser={setUser}
              onLogout={logout}
              toast={toast}
            />
          )}
        </main>
      </div>

      <Toasts list={toasts} />
    </>
  );
}
