import { useState, useEffect } from "react";

// ─── Design Tokens ───────────────────────────────────────────────────────────
// Aesthetic: Dark corporate-tech with amber/gold accents. Editorial layout.
// Fonts: Syne (headings) + DM Sans (body)

const style = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --bg2: #111118;
    --bg3: #18181f;
    --border: #2a2a38;
    --amber: #f5a623;
    --amber2: #ffd166;
    --red: #ef4444;
    --green: #22c55e;
    --blue: #3b82f6;
    --text: #e8e8f0;
    --muted: #6b6b80;
    --card: #14141c;
    --radius: 12px;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
  }

  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

  /* Layout */
  .app { display: flex; min-height: 100vh; }

  .sidebar {
    width: 240px;
    min-height: 100vh;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 28px 0;
    position: fixed;
    top: 0; left: 0;
    z-index: 100;
  }

  .sidebar-logo {
    padding: 0 24px 28px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 16px;
  }

  .logo-mark {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .logo-icon {
    width: 36px; height: 36px;
    background: var(--amber);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: #0a0a0f;
  }

  .logo-text {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 17px;
    color: var(--text);
  }

  .logo-text span { color: var(--amber); }

  .nav-group { padding: 0 12px; }
  .nav-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--muted);
    padding: 8px 12px 6px;
    font-weight: 600;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--muted);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.18s ease;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    margin-bottom: 2px;
  }

  .nav-item:hover { background: var(--bg3); color: var(--text); }
  .nav-item.active {
    background: rgba(245, 166, 35, 0.12);
    color: var(--amber);
  }
  .nav-item.active svg { color: var(--amber); }

  .nav-icon { width: 18px; height: 18px; flex-shrink: 0; }

  .sidebar-user {
    margin-top: auto;
    padding: 16px 24px 0;
    border-top: 1px solid var(--border);
  }

  .user-chip {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 8px 0;
  }

  .avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--amber), #e07b00);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 13px;
    color: #0a0a0f;
    flex-shrink: 0;
  }

  .user-info { flex: 1; overflow: hidden; }
  .user-name { font-size: 13px; font-weight: 600; color: var(--text); truncate; }
  .user-role { font-size: 11px; color: var(--muted); }

  /* Main */
  .main { margin-left: 240px; flex: 1; padding: 36px 40px; max-width: calc(100vw - 240px); }

  /* Top bar */
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .page-title { font-size: 26px; font-weight: 800; letter-spacing: -0.02em; }
  .page-sub { color: var(--muted); font-size: 14px; margin-top: 2px; }

  .topbar-actions { display: flex; gap: 10px; align-items: center; }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.18s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-primary {
    background: var(--amber);
    color: #0a0a0f;
  }
  .btn-primary:hover { background: var(--amber2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(245,166,35,0.3); }

  .btn-ghost {
    background: var(--bg3);
    color: var(--text);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { background: var(--border); }

  .btn-danger { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }
  .btn-danger:hover { background: rgba(239,68,68,0.25); }

  /* Cards */
  .card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 24px;
  }

  .card-sm { padding: 18px; }

  /* Grid */
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }

  /* Stat cards */
  .stat-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    position: relative;
    overflow: hidden;
  }

  .stat-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: var(--amber);
    opacity: 0;
    transition: opacity 0.2s;
  }

  .stat-card:hover::before { opacity: 1; }

  .stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label { font-size: 13px; color: var(--muted); font-weight: 500; }
  .stat-change { font-size: 12px; margin-top: 8px; color: var(--green); font-weight: 500; }

  /* Badge */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
  }

  .badge-applied { background: rgba(59,130,246,0.15); color: var(--blue); }
  .badge-interviewing { background: rgba(245,166,35,0.15); color: var(--amber); }
  .badge-offer { background: rgba(34,197,94,0.15); color: var(--green); }
  .badge-rejected { background: rgba(239,68,68,0.12); color: var(--red); }
  .badge-ghosted { background: rgba(107,107,128,0.15); color: var(--muted); }
  .badge-safe { background: rgba(34,197,94,0.15); color: var(--green); }
  .badge-risky { background: rgba(245,166,35,0.15); color: var(--amber); }
  .badge-scam { background: rgba(239,68,68,0.15); color: var(--red); }

  /* Table */
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left;
    padding: 12px 16px;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--muted);
    font-weight: 600;
    border-bottom: 1px solid var(--border);
    font-family: 'DM Sans', sans-serif;
  }
  td { padding: 14px 16px; font-size: 14px; border-bottom: 1px solid rgba(42,42,56,0.5); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }

  /* Forms */
  .form-group { margin-bottom: 20px; }
  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 7px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  input[type="text"],
  input[type="email"],
  input[type="password"],
  input[type="url"],
  select,
  textarea {
    width: 100%;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 11px 14px;
    color: var(--text);
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s;
    outline: none;
  }

  input:focus, select:focus, textarea:focus {
    border-color: var(--amber);
    box-shadow: 0 0 0 3px rgba(245,166,35,0.1);
  }

  textarea { resize: vertical; min-height: 100px; }
  select { cursor: pointer; }
  select option { background: var(--bg2); }

  /* Auth pages */
  .auth-page {
    min-height: 100vh;
    background: var(--bg);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-bg-pattern {
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at 20% 50%, rgba(245,166,35,0.06) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(59,130,246,0.05) 0%, transparent 40%);
  }

  .auth-grid {
    position: absolute;
    inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
                      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
    opacity: 0.3;
  }

  .auth-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 44px;
    width: 100%;
    max-width: 440px;
    position: relative;
    z-index: 1;
    box-shadow: 0 32px 80px rgba(0,0,0,0.5);
  }

  .auth-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 36px;
  }

  .auth-title { font-size: 24px; font-weight: 800; margin-bottom: 6px; }
  .auth-sub { color: var(--muted); font-size: 14px; margin-bottom: 32px; }

  .divider {
    text-align: center;
    position: relative;
    margin: 20px 0;
    color: var(--muted);
    font-size: 13px;
  }

  .divider::before, .divider::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 42%;
    height: 1px;
    background: var(--border);
  }
  .divider::before { left: 0; }
  .divider::after { right: 0; }

  .auth-switch { text-align: center; margin-top: 24px; font-size: 14px; color: var(--muted); }
  .auth-switch a { color: var(--amber); cursor: pointer; font-weight: 600; text-decoration: none; }
  .auth-switch a:hover { text-decoration: underline; }

  /* Score ring */
  .score-ring-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 0;
  }

  .score-ring {
    width: 160px;
    height: 160px;
    position: relative;
  }

  .score-ring svg { width: 100%; height: 100%; transform: rotate(-90deg); }
  .score-ring circle {
    fill: none;
    stroke-width: 12;
    stroke-linecap: round;
  }

  .score-value {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .score-num {
    font-family: 'Syne', sans-serif;
    font-size: 38px;
    font-weight: 800;
    line-height: 1;
  }

  .score-out-of { font-size: 13px; color: var(--muted); }

  /* Flag items */
  .flag-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
    background: var(--bg3);
    border-radius: 8px;
    margin-bottom: 8px;
    border-left: 3px solid transparent;
  }

  .flag-item.danger { border-left-color: var(--red); }
  .flag-item.warning { border-left-color: var(--amber); }
  .flag-item.success { border-left-color: var(--green); }

  .flag-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .flag-text { font-size: 14px; }
  .flag-label { font-weight: 600; margin-bottom: 2px; }
  .flag-detail { font-size: 12px; color: var(--muted); }

  /* ATS Score */
  .ats-bar-wrap { margin-bottom: 10px; }
  .ats-bar-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
  .ats-bar-label span:last-child { font-weight: 600; }
  .ats-bar-bg { background: var(--bg3); border-radius: 4px; height: 7px; overflow: hidden; }
  .ats-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease; }

  /* Upload zone */
  .upload-zone {
    border: 2px dashed var(--border);
    border-radius: 12px;
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .upload-zone:hover {
    border-color: var(--amber);
    background: rgba(245,166,35,0.04);
  }
  .upload-icon { font-size: 40px; margin-bottom: 12px; }
  .upload-text { color: var(--muted); font-size: 14px; }
  .upload-text strong { color: var(--amber); }

  /* Timeline dot */
  .status-dot {
    width: 9px; height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
    margin-top: 5px;
  }

  /* Tabs */
  .tabs { display: flex; gap: 4px; margin-bottom: 24px; background: var(--bg3); padding: 4px; border-radius: 10px; width: fit-content; }
  .tab {
    padding: 8px 18px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    border: none;
    background: none;
    color: var(--muted);
    font-family: 'DM Sans', sans-serif;
    transition: all 0.18s;
  }
  .tab.active { background: var(--card); color: var(--text); box-shadow: 0 1px 4px rgba(0,0,0,0.3); }

  /* Progress step */
  .steps { display: flex; gap: 0; margin-bottom: 32px; }
  .step { flex: 1; text-align: center; position: relative; }
  .step:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 15px;
    right: 0;
    width: 100%;
    height: 1px;
    background: var(--border);
  }
  .step.done::after { background: var(--amber); }
  .step-dot {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: var(--bg3);
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 8px;
    font-size: 12px;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }
  .step.active .step-dot { border-color: var(--amber); color: var(--amber); }
  .step.done .step-dot { background: var(--amber); border-color: var(--amber); color: #0a0a0f; }
  .step-label { font-size: 12px; color: var(--muted); font-weight: 500; }
  .step.active .step-label { color: var(--text); }

  /* Select dropdown override */
  .status-select {
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 13px;
    color: var(--text);
    cursor: pointer;
    outline: none;
  }

  /* Notification dot */
  .notif-dot {
    width: 7px; height: 7px;
    background: var(--amber);
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* Separator */
  .sep { height: 1px; background: var(--border); margin: 24px 0; }

  /* Misc helpers */
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .gap-2 { gap: 8px; }
  .gap-3 { gap: 12px; }
  .gap-4 { gap: 16px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mb-8 { margin-bottom: 32px; }
  .text-sm { font-size: 13px; }
  .text-xs { font-size: 12px; }
  .text-muted { color: var(--muted); }
  .text-amber { color: var(--amber); }
  .text-green { color: var(--green); }
  .text-red { color: var(--red); }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .w-full { width: 100%; }

  /* Animation */
  @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .fade-in { animation: fadeIn 0.3s ease forwards; }

  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  .pulse { animation: pulse 2s infinite; }

  .chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    background: var(--bg3);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: var(--muted);
    font-weight: 500;
  }
`;

// ─── Icons (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Briefcase: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
    </svg>
  ),
  FileText: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Upload: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Bell: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Link: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockApplications = [
  { id: 1, company: "Google", role: "SWE Intern", status: "interviewing", date: "Feb 10", location: "Bangalore", stipend: "₹80K/mo", via: "LinkedIn" },
  { id: 2, company: "Razorpay", role: "Product Intern", status: "applied", date: "Feb 14", location: "Remote", stipend: "₹50K/mo", via: "Direct" },
  { id: 3, company: "Microsoft", role: "PM Intern", status: "offer", date: "Jan 28", location: "Hyderabad", stipend: "₹90K/mo", via: "Referral" },
  { id: 4, company: "Groww", role: "Data Intern", status: "rejected", date: "Feb 1", location: "Bangalore", stipend: "₹40K/mo", via: "Internshala" },
  { id: 5, company: "Startup XYZ", role: "ML Intern", status: "ghosted", date: "Jan 15", location: "Remote", stipend: "₹20K/mo", via: "WhatsApp" },
  { id: 6, company: "Zerodha", role: "Backend Intern", status: "applied", date: "Feb 17", location: "Bangalore", stipend: "₹60K/mo", via: "LinkedIn" },
];

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}

// ─── Page: Dashboard ─────────────────────────────────────────────────────────
function DashboardPage() {
  const stats = [
    { value: 6, label: "Total Applications", change: "+3 this week" },
    { value: 1, label: "Interviews Active", change: "Google · Round 2" },
    { value: 1, label: "Offers Received", change: "Microsoft 🎉" },
    { value: 2, label: "Awaiting Reply", change: "Razorpay · Zerodha" },
  ];

  return (
    <div className="fade-in">
      <div className="topbar">
        <div>
          <h1 className="page-title">Dashboard 👋</h1>
          <p className="page-sub">Welcome back, Arjun. Here's your placement overview.</p>
        </div>
        <div className="topbar-actions">
          <button className="btn btn-ghost" style={{fontSize: 13}}>
            <span style={{fontSize:16}}>🔔</span> Alerts
          </button>
          <button className="btn btn-primary">
            <Icon.Plus /> Add Application
          </button>
        </div>
      </div>

      <div className="grid-4 mb-8">
        {stats.map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-value" style={{color: i===2 ? "var(--green)" : "var(--text)"}}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-change">{s.change}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{fontSize: 16, fontWeight: 700}}>Recent Applications</h3>
            <span className="text-sm text-amber" style={{cursor:"pointer"}}>View all →</span>
          </div>
          {mockApplications.slice(0, 4).map(app => (
            <div key={app.id} className="flex items-center justify-between" style={{padding: "12px 0", borderBottom: "1px solid var(--border)"}}>
              <div className="flex items-center gap-3">
                <div className="avatar" style={{width:36, height:36, fontSize:13, borderRadius: 8}}>
                  {app.company[0]}
                </div>
                <div>
                  <div style={{fontSize: 14, fontWeight: 600}}>{app.company}</div>
                  <div className="text-sm text-muted">{app.role}</div>
                </div>
              </div>
              <StatusBadge status={app.status} />
            </div>
          ))}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{fontSize: 16, fontWeight: 700}}>Application Pipeline</h3>
          </div>
          {[
            { label: "Applied", count: 2, color: "var(--blue)", pct: 33 },
            { label: "Interviewing", count: 1, color: "var(--amber)", pct: 17 },
            { label: "Offers", count: 1, color: "var(--green)", pct: 17 },
            { label: "Rejected", count: 1, color: "var(--red)", pct: 17 },
            { label: "Ghosted", count: 1, color: "var(--muted)", pct: 17 },
          ].map(p => (
            <div className="ats-bar-wrap" key={p.label}>
              <div className="ats-bar-label">
                <span style={{color: "var(--muted)", fontSize: 13}}>{p.label}</span>
                <span style={{fontSize: 13}}>{p.count} apps</span>
              </div>
              <div className="ats-bar-bg">
                <div className="ats-bar-fill" style={{width: p.pct+"%", background: p.color}} />
              </div>
            </div>
          ))}

          <div className="sep" />

          <div style={{fontSize:13, color:"var(--muted)"}}>
            💡 <strong style={{color:"var(--text)"}}>Tip:</strong> Your response rate is 33%. Try personalizing your cover letters!
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page: Auth ───────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // login | signup | profile
  const [step, setStep] = useState(1);

  if (mode === "profile") {
    return (
      <div className="auth-page fade-in">
        <div className="auth-bg-pattern" />
        <div className="auth-grid" />
        <div className="auth-card" style={{maxWidth: 520}}>
          <div className="auth-logo">
            <div className="logo-icon">IH</div>
            <span className="logo-text">Intern<span>Hub</span></span>
          </div>

          <div className="steps" style={{marginBottom: 32}}>
            {["Account", "Profile", "Resume"].map((s, i) => (
              <div className={`step ${step > i+1 ? "done" : step === i+1 ? "active" : ""}`} key={s}>
                <div className="step-dot">{step > i+1 ? "✓" : i+1}</div>
                <div className="step-label">{s}</div>
              </div>
            ))}
          </div>

          {step === 2 && (
            <div className="fade-in">
              <h2 className="auth-title">Your Profile</h2>
              <p className="auth-sub">Help us personalize your experience</p>
              <div className="grid-2">
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" defaultValue="Arjun Sharma" />
                </div>
                <div className="form-group">
                  <label>College</label>
                  <input type="text" placeholder="IIT Delhi" />
                </div>
              </div>
              <div className="form-group">
                <label>Branch / Degree</label>
                <input type="text" placeholder="B.Tech CSE · 2025" />
              </div>
              <div className="form-group">
                <label>Skills</label>
                <div className="flex gap-2" style={{flexWrap:"wrap", marginBottom:8}}>
                  {["React", "Python", "SQL", "ML"].map(s => (
                    <span className="chip" key={s}>{s} ×</span>
                  ))}
                </div>
                <input type="text" placeholder="Add skill + Enter" />
              </div>
              <div className="form-group">
                <label>Target Roles</label>
                <input type="text" placeholder="SWE, PM, Data Science..." />
              </div>
              <button className="btn btn-primary w-full" style={{justifyContent:"center"}} onClick={() => setStep(3)}>
                Continue →
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 className="auth-title">Upload Resume</h2>
              <p className="auth-sub">Upload once, apply everywhere with ease</p>
              <div className="upload-zone" onClick={onLogin}>
                <div className="upload-icon">📄</div>
                <p className="upload-text"><strong>Click to upload</strong> or drag & drop</p>
                <p className="upload-text" style={{fontSize:12, marginTop:4}}>PDF · DOCX · Max 5MB</p>
              </div>
              <div className="sep" />
              <button className="btn btn-primary w-full" style={{justifyContent:"center"}} onClick={onLogin}>
                Skip for Now — Enter Dashboard
              </button>
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <h2 className="auth-title">Almost there!</h2>
              <p className="auth-sub">Just a few more details</p>
              <button className="btn btn-primary w-full" style={{justifyContent:"center"}} onClick={() => setStep(2)}>
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page fade-in">
      <div className="auth-bg-pattern" />
      <div className="auth-grid" />
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">IH</div>
          <span className="logo-text">Intern<span>Hub</span></span>
        </div>

        <h2 className="auth-title">{mode === "login" ? "Welcome back" : "Create account"}</h2>
        <p className="auth-sub">
          {mode === "login" ? "Sign in to your placement dashboard" : "Start your placement journey today"}
        </p>

        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="arjun@iitd.ac.in" />
        </div>
        {mode === "signup" && (
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Arjun Sharma" />
          </div>
        )}
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" />
        </div>

        {mode === "login" && (
          <div style={{textAlign:"right", marginTop:-12, marginBottom:16}}>
            <span style={{fontSize:13, color:"var(--amber)", cursor:"pointer"}}>Forgot password?</span>
          </div>
        )}

        <button className="btn btn-primary w-full" style={{justifyContent:"center", padding:"12px"}}
          onClick={() => mode === "login" ? onLogin() : setMode("profile")}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <div className="divider" style={{marginTop:20}}>or continue with</div>

        <button className="btn btn-ghost w-full" style={{justifyContent:"center", marginBottom:8}}>
          <span>🎓</span> Sign in with College SSO
        </button>
        <button className="btn btn-ghost w-full" style={{justifyContent:"center"}}>
          <span>G</span> Continue with Google
        </button>

        <div className="auth-switch">
          {mode === "login" ? (
            <>Don't have an account? <a onClick={() => setMode("signup")}>Sign up free</a></>
          ) : (
            <>Already have an account? <a onClick={() => setMode("login")}>Sign in</a></>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page: TruthLens (ScamShield) ────────────────────────────────────────────
function TruthLensPage() {
  const [url, setUrl] = useState("");
  const [jd, setJd] = useState("");
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("url");

  const analyze = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 1800);
  };

  const score = 38;
  const scoreColor = score < 40 ? "var(--red)" : score < 70 ? "var(--amber)" : "var(--green)";
  const verdict = score < 40 ? "High Risk" : score < 70 ? "Suspicious" : "Looks Safe";
  const verdictBadge = score < 40 ? "scam" : score < 70 ? "risky" : "safe";

  const flags = [
    { type: "danger", icon: "🚨", label: "WhatsApp-only contact", detail: "Legitimate companies use official email domains for hiring." },
    { type: "danger", icon: "💸", label: "Upfront fee mentioned", detail: "Detected phrase: 'registration fee of ₹500'. This is a major red flag." },
    { type: "warning", icon: "⚠️", label: "Unverified domain", detail: "recruiter@getjob-india.tk — .tk domains are often free and used for scams." },
    { type: "warning", icon: "📈", label: "Unrealistic salary", detail: "₹1,20,000/month for a freshers internship is significantly above market." },
    { type: "success", icon: "✅", label: "Company name verifiable", detail: "Found a matching LinkedIn company page." },
  ];

  return (
    <div className="fade-in">
      <div className="topbar">
        <div>
          <h1 className="page-title">TruthLens 🔍</h1>
          <p className="page-sub">ScamShield — verify any internship opportunity before applying</p>
        </div>
        <div className="chip">
          <span className="pulse" style={{width:6,height:6,background:"var(--green)",borderRadius:"50%",display:"inline-block"}} />
          Live AI Analysis
        </div>
      </div>

      <div className="grid-2" style={{alignItems:"start"}}>
        <div>
          <div className="card mb-6">
            <div className="tabs" style={{marginBottom:20}}>
              <button className={`tab ${tab==="url"?"active":""}`} onClick={()=>setTab("url")}>Paste URL</button>
              <button className={`tab ${tab==="jd"?"active":""}`} onClick={()=>setTab("jd")}>Job Description</button>
            </div>

            {tab === "url" ? (
              <div className="form-group" style={{marginBottom:16}}>
                <label>Job Listing URL</label>
                <div className="flex gap-2">
                  <input type="url" placeholder="https://internshala.com/internship/..." value={url} onChange={e=>setUrl(e.target.value)} style={{flex:1}} />
                </div>
              </div>
            ) : (
              <div className="form-group" style={{marginBottom:16}}>
                <label>Paste Job Description</label>
                <textarea placeholder="Paste the full internship listing text here..." rows={8} value={jd} onChange={e=>setJd(e.target.value)} />
              </div>
            )}

            <div className="form-group" style={{marginBottom:16}}>
              <label>Recruiter Email (optional)</label>
              <input type="email" placeholder="recruiter@company.com" />
            </div>

            <button className="btn btn-primary w-full" style={{justifyContent:"center", padding:"13px"}} onClick={analyze} disabled={loading}>
              {loading ? (
                <span className="pulse">Analyzing…</span>
              ) : (
                <><Icon.Shield /> Analyze with ScamShield</>
              )}
            </button>
          </div>

          {analyzed && (
            <div className="card fade-in">
              <h3 style={{fontSize:15, fontWeight:700, marginBottom:16}}>Community Reports</h3>
              <div style={{fontSize:14, color:"var(--muted)"}}>3 students have reported this listing as suspicious.</div>
              <div className="sep" />
              <button className="btn btn-danger w-full" style={{justifyContent:"center"}}>
                🚩 Report this Listing
              </button>
            </div>
          )}
        </div>

        <div>
          {!analyzed && !loading && (
            <div className="card" style={{textAlign:"center", padding:"60px 24px"}}>
              <div style={{fontSize:48, marginBottom:16}}>🛡️</div>
              <h3 style={{fontSize:18, fontWeight:700, marginBottom:8}}>Paste a listing to analyze</h3>
              <p className="text-muted" style={{fontSize:14}}>ScamShield checks email domains, keywords, salary claims, and community reports to give you a credibility score.</p>
            </div>
          )}

          {loading && (
            <div className="card" style={{textAlign:"center", padding:"60px 24px"}}>
              <div style={{fontSize:48, marginBottom:16}} className="pulse">🔍</div>
              <h3 style={{fontSize:18, fontWeight:700, marginBottom:8}}>Analyzing listing…</h3>
              <p className="text-muted" style={{fontSize:14}}>Checking domain reputation, keywords, salary ranges, community database…</p>
            </div>
          )}

          {analyzed && (
            <div className="fade-in">
              <div className="card mb-6">
                <div className="score-ring-wrap">
                  <div className="score-ring">
                    <svg viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9155" stroke="var(--bg3)" strokeDasharray="100 0" />
                      <circle cx="18" cy="18" r="15.9155" stroke={scoreColor}
                        strokeDasharray={`${score} ${100-score}`} style={{transition:"stroke-dasharray 1s ease"}} />
                    </svg>
                    <div className="score-value">
                      <span className="score-num" style={{color: scoreColor}}>{score}</span>
                      <span className="score-out-of">/ 100</span>
                    </div>
                  </div>
                  <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:20,marginTop:16}}>{verdict}</h3>
                  <span className={`badge badge-${verdictBadge}`} style={{marginTop:6}}>ScamShield verdict</span>
                </div>
              </div>

              <div className="card">
                <h3 style={{fontSize:15, fontWeight:700, marginBottom:16}}>Risk Flags</h3>
                {flags.map((f, i) => (
                  <div className={`flag-item ${f.type}`} key={i}>
                    <span className="flag-icon">{f.icon}</span>
                    <div>
                      <div className="flag-label">{f.label}</div>
                      <div className="flag-detail">{f.detail}</div>
                    </div>
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

// ─── Page: Tracker ────────────────────────────────────────────────────────────
function TrackerPage() {
  const [apps, setApps] = useState(mockApplications);
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newApp, setNewApp] = useState({ company:"", role:"", stipend:"", location:"", via:"" });

  const statusOptions = ["applied", "interviewing", "offer", "rejected", "ghosted"];
  const filtered = filter === "all" ? apps : apps.filter(a => a.status === filter);

  const updateStatus = (id, status) => {
    setApps(prev => prev.map(a => a.id === id ? {...a, status} : a));
  };

  const addApp = () => {
    if (!newApp.company) return;
    setApps(prev => [...prev, { ...newApp, id: Date.now(), status:"applied", date: "Today" }]);
    setShowAdd(false);
    setNewApp({ company:"", role:"", stipend:"", location:"", via:"" });
  };

  return (
    <div className="fade-in">
      <div className="topbar">
        <div>
          <h1 className="page-title">Opportunity Tracker</h1>
          <p className="page-sub">Track every application. Stay on top of your pipeline.</p>
        </div>
        <div className="topbar-actions">
          <select className="status-select" value={filter} onChange={e=>setFilter(e.target.value)} style={{padding:"8px 12px", fontSize:14}}>
            <option value="all">All Status</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
          <button className="btn btn-primary" onClick={()=>setShowAdd(v=>!v)}>
            <Icon.Plus /> Add
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="card mb-6 fade-in">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>New Application</h3>
          <div className="grid-3">
            <div className="form-group" style={{marginBottom:12}}>
              <label>Company</label>
              <input type="text" placeholder="Company name" value={newApp.company} onChange={e=>setNewApp(p=>({...p,company:e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <label>Role</label>
              <input type="text" placeholder="Job title" value={newApp.role} onChange={e=>setNewApp(p=>({...p,role:e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <label>Stipend</label>
              <input type="text" placeholder="₹50K/mo" value={newApp.stipend} onChange={e=>setNewApp(p=>({...p,stipend:e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <label>Location</label>
              <input type="text" placeholder="Bangalore / Remote" value={newApp.location} onChange={e=>setNewApp(p=>({...p,location:e.target.value}))} />
            </div>
            <div className="form-group" style={{marginBottom:12}}>
              <label>Applied Via</label>
              <input type="text" placeholder="LinkedIn / Direct" value={newApp.via} onChange={e=>setNewApp(p=>({...p,via:e.target.value}))} />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={addApp}>Add Application</button>
            <button className="btn btn-ghost" onClick={()=>setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Stipend</th>
                <th>Location</th>
                <th>Via</th>
                <th>Applied</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="avatar" style={{width:30,height:30,fontSize:11,borderRadius:6,flexShrink:0}}>
                        {app.company[0]}
                      </div>
                      <span style={{fontWeight:600}}>{app.company}</span>
                    </div>
                  </td>
                  <td className="text-muted">{app.role}</td>
                  <td style={{fontWeight:600, color:"var(--green)"}}>{app.stipend}</td>
                  <td className="text-muted">{app.location}</td>
                  <td><span className="chip">{app.via}</span></td>
                  <td className="text-muted">{app.date}</td>
                  <td><StatusBadge status={app.status} /></td>
                  <td>
                    <select className="status-select" value={app.status} onChange={e=>updateStatus(app.id, e.target.value)}>
                      {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-3" style={{marginTop: 16}}>
        {["applied","interviewing","offer","rejected","ghosted"].map(s => {
          const count = apps.filter(a=>a.status===s).length;
          return (
            <div key={s} className="stat-card" style={{flex:1, padding:16}}>
              <div className="stat-value" style={{fontSize:24}}>{count}</div>
              <div className="stat-label" style={{fontSize:12}}><StatusBadge status={s} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page: ATS Checker ────────────────────────────────────────────────────────
function ATSPage() {
  const [uploaded, setUploaded] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrop = () => {
    setUploaded(true);
    setLoading(true);
    setTimeout(() => { setLoading(false); setAnalyzed(true); }, 2000);
  };

  const scores = [
    { label: "Keyword Match", score: 62, color: "var(--amber)" },
    { label: "Formatting", score: 88, color: "var(--green)" },
    { label: "Section Structure", score: 75, color: "var(--green)" },
    { label: "Action Verbs", score: 45, color: "var(--red)" },
    { label: "Quantification", score: 30, color: "var(--red)" },
    { label: "Length & Density", score: 90, color: "var(--green)" },
  ];

  const overallScore = Math.round(scores.reduce((a, s) => a + s.score, 0) / scores.length);

  const suggestions = [
    { icon: "🎯", title: "Add more keywords", detail: "Missing: 'REST API', 'CI/CD', 'Agile', 'Docker' — add these to match JDs in your target domain." },
    { icon: "📊", title: "Quantify your achievements", detail: "Replace 'improved performance' with 'improved API response time by 40%'. Numbers make a difference." },
    { icon: "⚡", title: "Use stronger action verbs", detail: "Replace 'worked on', 'helped with' → 'Engineered', 'Architected', 'Optimized'." },
    { icon: "📄", title: "Add a summary section", detail: "A 2–3 line professional summary at the top improves ATS ranking significantly." },
  ];

  return (
    <div className="fade-in">
      <div className="topbar">
        <div>
          <h1 className="page-title">Resume ATS Checker</h1>
          <p className="page-sub">Score your resume against ATS systems used by top companies</p>
        </div>
        {analyzed && (
          <button className="btn btn-ghost" onClick={() => { setUploaded(false); setAnalyzed(false); }}>
            Upload Another
          </button>
        )}
      </div>

      {!uploaded && (
        <div style={{maxWidth: 560, margin:"0 auto"}}>
          <div className="upload-zone" onClick={handleDrop}>
            <div className="upload-icon">📋</div>
            <p className="upload-text"><strong>Click to upload your resume</strong></p>
            <p className="upload-text" style={{marginTop:4}}>PDF or DOCX · Max 5MB</p>
            <div style={{marginTop:20, display:"flex", gap:12, justifyContent:"center"}}>
              <span className="chip">✓ Confidential</span>
              <span className="chip">✓ Not stored</span>
              <span className="chip">✓ Instant results</span>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div className="card" style={{textAlign:"center", padding:"60px 24px", maxWidth:520, margin:"0 auto"}}>
          <div style={{fontSize:48, marginBottom:16}} className="pulse">🤖</div>
          <h3 style={{fontSize:18, fontWeight:700, marginBottom:8}}>Scanning resume…</h3>
          <p className="text-muted" style={{fontSize:14}}>Checking ATS compatibility, keywords, formatting, and structure…</p>
        </div>
      )}

      {analyzed && (
        <div className="grid-2 fade-in" style={{alignItems:"start"}}>
          <div>
            <div className="card mb-6">
              <div className="score-ring-wrap">
                <div className="score-ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9155" stroke="var(--bg3)" strokeDasharray="100 0" />
                    <circle cx="18" cy="18" r="15.9155"
                      stroke={overallScore >= 70 ? "var(--green)" : overallScore >= 50 ? "var(--amber)" : "var(--red)"}
                      strokeDasharray={`${overallScore} ${100-overallScore}`} />
                  </svg>
                  <div className="score-value">
                    <span className="score-num" style={{color: overallScore >= 70 ? "var(--green)" : overallScore >= 50 ? "var(--amber)" : "var(--red)"}}>
                      {overallScore}
                    </span>
                    <span className="score-out-of">/ 100</span>
                  </div>
                </div>
                <h3 style={{fontFamily:"Syne",fontWeight:800,fontSize:20,marginTop:16}}>
                  {overallScore >= 70 ? "ATS Friendly" : overallScore >= 50 ? "Needs Work" : "ATS Unfriendly"}
                </h3>
                <p className="text-muted text-sm" style={{marginTop:4}}>Your resume scored {overallScore}/100 on ATS compatibility</p>
              </div>
            </div>

            <div className="card">
              <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Category Scores</h3>
              {scores.map(s => (
                <div className="ats-bar-wrap" key={s.label} style={{marginBottom:14}}>
                  <div className="ats-bar-label">
                    <span style={{fontSize:13}}>{s.label}</span>
                    <span style={{color: s.color, fontWeight:700}}>{s.score}%</span>
                  </div>
                  <div className="ats-bar-bg" style={{height:8}}>
                    <div className="ats-bar-fill" style={{width: s.score+"%", background: s.color}} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:4}}>Improvement Suggestions</h3>
            <p className="text-muted text-sm" style={{marginBottom:20}}>Apply these fixes to boost your score by ~25 points</p>
            {suggestions.map((s, i) => (
              <div key={i} style={{padding:"16px 0", borderBottom: i < suggestions.length-1 ? "1px solid var(--border)" : "none"}}>
                <div className="flex gap-3">
                  <span style={{fontSize:22, flexShrink:0}}>{s.icon}</span>
                  <div>
                    <div style={{fontWeight:600, marginBottom:4}}>{s.title}</div>
                    <div className="text-sm text-muted">{s.detail}</div>
                  </div>
                </div>
              </div>
            ))}

            <div className="sep" />
            <button className="btn btn-primary w-full" style={{justifyContent:"center"}}>
              Download Optimized Tips PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page: Profile ────────────────────────────────────────────────────────────
function ProfilePage() {
  const [editMode, setEditMode] = useState(false);

  return (
    <div className="fade-in">
      <div className="topbar">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-sub">Manage your personal information and preferences</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditMode(v=>!v)}>
          {editMode ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="grid-2" style={{alignItems:"start"}}>
        <div>
          <div className="card mb-6">
            <div className="flex gap-4 items-center" style={{marginBottom:24}}>
              <div className="avatar" style={{width:72,height:72,fontSize:28,borderRadius:16}}>A</div>
              <div>
                <div style={{fontFamily:"Syne",fontSize:20,fontWeight:800}}>Arjun Sharma</div>
                <div className="text-muted text-sm">arjun.sharma@iitd.ac.in</div>
                <div className="chip" style={{marginTop:6}}>IIT Delhi · B.Tech CSE · 2025</div>
              </div>
            </div>

            <div className="form-group">
              <label>Full Name</label>
              <input type="text" defaultValue="Arjun Sharma" disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" defaultValue="arjun.sharma@iitd.ac.in" disabled={!editMode} />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>College</label>
                <input type="text" defaultValue="IIT Delhi" disabled={!editMode} />
              </div>
              <div className="form-group">
                <label>CGPA</label>
                <input type="text" defaultValue="8.7" disabled={!editMode} />
              </div>
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea defaultValue="Final year CSE student passionate about product and ML. Looking for SWE/PM internships." disabled={!editMode} rows={3} />
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Resume</h3>
            <div style={{background:"var(--bg3)",borderRadius:10,padding:"16px 20px",display:"flex",alignItems:"center",gap:16}}>
              <span style={{fontSize:28}}>📄</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600,fontSize:14}}>Arjun_Resume_2025.pdf</div>
                <div className="text-muted text-xs">Uploaded Feb 14 · 245 KB</div>
              </div>
              <button className="btn btn-ghost" style={{fontSize:12,padding:"6px 12px"}}>Replace</button>
            </div>
          </div>
        </div>

        <div>
          <div className="card mb-6">
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Skills</h3>
            <div className="flex gap-2" style={{flexWrap:"wrap",marginBottom:16}}>
              {["React","Node.js","Python","TensorFlow","SQL","Docker","Git","Product Strategy","Figma","Machine Learning"].map(s => (
                <span className="chip" key={s}>{s}</span>
              ))}
            </div>
            {editMode && <input type="text" placeholder="Add a skill..." />}
          </div>

          <div className="card mb-6">
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Target Preferences</h3>
            <div className="form-group">
              <label>Desired Roles</label>
              <input type="text" defaultValue="SWE Intern, Product Intern, ML Intern" disabled={!editMode} />
            </div>
            <div className="form-group">
              <label>Preferred Locations</label>
              <input type="text" defaultValue="Bangalore, Mumbai, Remote" disabled={!editMode} />
            </div>
            <div className="form-group" style={{marginBottom:0}}>
              <label>Min Stipend</label>
              <input type="text" defaultValue="₹40,000/month" disabled={!editMode} />
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:15,fontWeight:700,marginBottom:16}}>Account</h3>
            <div className="flex items-center justify-between" style={{padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:14}}>Email notifications</span>
              <span style={{color:"var(--green)",fontSize:13,fontWeight:600}}>Enabled</span>
            </div>
            <div className="flex items-center justify-between" style={{padding:"10px 0",borderBottom:"1px solid var(--border)"}}>
              <span style={{fontSize:14}}>ScamShield alerts</span>
              <span style={{color:"var(--green)",fontSize:13,fontWeight:600}}>Enabled</span>
            </div>
            <div className="flex items-center justify-between" style={{padding:"10px 0"}}>
              <span style={{fontSize:14}}>Public profile</span>
              <span style={{color:"var(--muted)",fontSize:13,fontWeight:600}}>Off</span>
            </div>
            <div className="sep" />
            <button className="btn btn-danger" style={{width:"100%",justifyContent:"center"}}>
              <Icon.Logout /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("auth");
  const [authed, setAuthed] = useState(false);

  const pages = [
    { id: "dashboard", label: "Dashboard", icon: Icon.Home },
    { id: "truthlens", label: "TruthLens", icon: Icon.Shield },
    { id: "tracker", label: "Tracker", icon: Icon.Briefcase },
    { id: "ats", label: "ATS Checker", icon: Icon.FileText },
    { id: "profile", label: "Profile", icon: Icon.User },
  ];

  const handleLogin = () => {
    setAuthed(true);
    setPage("dashboard");
  };

  if (!authed) {
    return (
      <>
        <style>{style}</style>
        <AuthPage onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <style>{style}</style>
      <div className="app">
        {/* Sidebar */}
        <nav className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-mark">
              <div className="logo-icon">IH</div>
              <span className="logo-text">Intern<span>Hub</span></span>
            </div>
          </div>

          <div className="nav-group">
            <div className="nav-label">Navigation</div>
            {pages.map(p => (
              <button
                key={p.id}
                className={`nav-item ${page === p.id ? "active" : ""}`}
                onClick={() => setPage(p.id)}
              >
                <span className="nav-icon"><p.icon /></span>
                {p.label}
                {p.id === "truthlens" && (
                  <span style={{
                    marginLeft:"auto", fontSize:10, fontWeight:700,
                    background:"rgba(245,166,35,0.2)", color:"var(--amber)",
                    padding:"2px 7px", borderRadius:20
                  }}>NEW</span>
                )}
              </button>
            ))}
          </div>

          <div className="sidebar-user">
            <div className="user-chip">
              <div className="avatar">A</div>
              <div className="user-info">
                <div className="user-name">Arjun Sharma</div>
                <div className="user-role">IIT Delhi · CSE '25</div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="main">
          {page === "dashboard" && <DashboardPage />}
          {page === "truthlens" && <TruthLensPage />}
          {page === "tracker" && <TrackerPage />}
          {page === "ats" && <ATSPage />}
          {page === "profile" && <ProfilePage />}
        </main>
      </div>
    </>
  );
}
