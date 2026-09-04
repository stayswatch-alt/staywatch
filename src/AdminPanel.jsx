import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { supabase } from './supabaseClient';
import CompassLogo from './components/CompassLogo.jsx';
import {
  STATUS_OPTS, PLATFORMS, statusLabel, statusActivityLabel, reportId,
} from './lib/incidentStatus.js';
import { downloadIncidentsCsv } from './lib/csvExport.js';
import {
  fetchIncidentsPage, fetchAllFilteredIncidents, fetchReportTypes, fetchIncidentById,
  fetchDashboardStats, fetchRecentEvents,
} from './lib/incidentQuery.js';
import DossiersView from './components/DossiersView.jsx';
import './admin.css';

const PAGE_SIZE = 5;

function modReportId(id, createdAt) {
  const year = new Date(createdAt).getFullYear();
  return `STAY-${year}-${String(id).padStart(6, '0')}`;
}

function formatTableDate(ts) {
  const d = new Date(ts);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${day} ${mon} ${year} ${time}`;
}
function formatSubmitted(ts) {
  const d = new Date(ts);
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).replace(',', ' ·');
}

function formatActivityDate(ts) {
  const d = new Date(ts);
  const date = d.toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const time = d.toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
  return `${date}, ${time}`;
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff} sec ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} d ago`;
}

function reporterId(id) {
  return `user_${String(id).padStart(6, '0').slice(-6)}`;
}

function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

function formatEventText(event) {
  const p = event.payload || {};
  const who = event.actor?.includes('@')
    ? event.actor.split('@')[0]
    : (event.actor === 'reporter' ? 'Reporter' : 'Moderator');
  switch (event.event_type) {
    case 'submitted':
      return `Report submitted by ${who}`;
    case 're_report':
      return `Re-reported (${p.report_count ?? '?'} total reports)`;
    case 'status_changed':
      return `Status changed to ${statusActivityLabel(p.to)} by ${who}`;
    case 'note_updated':
      return `Internal note updated by ${who}`;
    default:
      return event.event_type?.replace(/_/g, ' ');
  }
}

function formatRailEventText(event) {
  const to = event.payload?.to;
  switch (event.event_type) {
    case 'submitted':
      return 'New report submitted';
    case 're_report':
      return 'Report re-submitted';
    case 'status_changed':
      if (to === 'ready_for_submission' || to === 'verified') return 'Report approved';
      if (to === 'needs_evidence') return 'Evidence requested';
      if (to === 'under_review') return 'Status changed to Under Review';
      if (to === 'rejected' || to === 'archived') return 'Report rejected';
      if (to === 'duplicate') return 'Marked as duplicate';
      return `Status changed to ${statusActivityLabel(to)}`;
    case 'note_updated':
      return 'Internal note updated';
    default:
      return event.event_type?.replace(/_/g, ' ');
  }
}

function eventDotClass(event) {
  const to = event.payload?.to;
  switch (event.event_type) {
    case 'submitted':
    case 're_report':
      return 'dot-new';
    case 'status_changed':
      if (to === 'ready_for_submission' || to === 'verified') return 'dot-approved';
      if (to === 'needs_evidence') return 'dot-evidence';
      if (to === 'rejected' || to === 'archived') return 'dot-rejected';
      return 'dot-review';
    case 'note_updated':
      return 'dot-note';
    default:
      return 'dot-default';
  }
}

function priorityLabel(priority) {
  const p = (priority || 'medium').toLowerCase();
  if (p === 'high') return 'High';
  if (p === 'low') return 'Low';
  return 'Medium';
}

/* icons */
const IconDash = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="3" width="8" height="8" rx="1" /><rect x="13" y="3" width="8" height="8" rx="1" />
    <rect x="3" y="13" width="8" height="8" rx="1" /><rect x="13" y="13" width="8" height="8" rx="1" />
  </svg>
);
const IconReport = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z" />
    <path d="M14 3v6h6M9 13h6M9 17h4" />
  </svg>
);
const IconDossier = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
  </svg>
);
const IconMods = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" />
    <path d="M3 20c0-3 2.7-5 6-5M13 20c0-2.2 1.8-4 4-4" />
  </svg>
);
const IconSettings = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
);
const IconOut = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M17 16l4-4m0 0l-4-4m4 4H7M13 4H6a2 2 0 00-2 2v12a2 2 0 002 2h7" />
  </svg>
);
const IconStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
  </svg>
);
const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 9l6 6 6-6" />
  </svg>
);
const IconEvidence = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" />
  </svg>
);
const IconReady = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
  </svg>
);
const IconFolder = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M3 7h6l2 2h10v10H3V7z" />
  </svg>
);
const IconClear = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 6h16M8 6V4h8v2M6 6l1 14h10l1-14" />
  </svg>
);
const IconCompass = () => (
  <svg width="13" height="13" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="4" opacity="0.85" />
    <polygon points="50,12 43,48 50,50" fill="currentColor" />
    <polygon points="50,88 57,52 50,50" fill="currentColor" opacity="0.45" />
    <polygon points="12,50 48,57 50,50" fill="currentColor" opacity="0.45" />
    <polygon points="88,50 52,43 50,50" fill="currentColor" />
    <circle cx="50" cy="50" r="4" fill="#ef2d3a" />
  </svg>
);

function PlatformCell({ platform }) {
  const p = (platform || '').toLowerCase();
  let icon = null;
  if (p.includes('twitter') || p.startsWith('x')) {
    icon = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M3 3 h4.5 l4 5.5 L16.5 3 H21 l-6.8 8.2 L21.5 21 H17 l-4.4-6 L7 21 H2.5 l7.2-8.7 Z" />
      </svg>
    );
  } else if (p.includes('tiktok')) {
    icon = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16 3v8.5a4.5 4.5 0 11-2.5-4v3a1.5 1.5 0 102 1.4V3h2.5z" />
      </svg>
    );
  } else if (p.includes('youtube')) {
    icon = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M10 9.5 L15.5 12 L10 14.5 Z M21 8.5a2.5 2.5 0 00-1.8-1.8C17.2 6.2 12 6.2 12 6.2s-5.2 0-7.2.5A2.5 2.5 0 003 8.5 26 26 0 002.5 12a26 26 0 00.5 3.5 2.5 2.5 0 001.8 1.8c2 .5 7.2.5 7.2.5s5.2 0 7.2-.5a2.5 2.5 0 001.8-1.8A26 26 0 0021.5 12a26 26 0 00-.5-3.5z" />
      </svg>
    );
  } else if (p.includes('instagram')) {
    icon = (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" /><circle cx="12" cy="12" r="3.5" />
      </svg>
    );
  }
  return (
    <span className="mod-platform-cell">
      {icon && <span className="mod-platform-icon">{icon}</span>}
      <span>{platform}</span>
    </span>
  );
}

function StatusBadge({ status, duplicate }) {
  const showDup = duplicate || status === 'duplicate';
  const cls = showDup ? 'duplicate' : status;
  return <span className={`mod-badge ${cls}`}>{showDup ? 'DUPLICATE' : statusLabel(status)}</span>;
}

function PriorityBadge({ priority }) {
  const p = (priority || 'medium').toLowerCase();
  return (
    <span className={`mod-priority mod-priority-${p}`}>
      <span className="mod-priority-dot" />
      {priorityLabel(priority)}
    </span>
  );
}

function StatCard({ label, value, icon, tone = 'gold', trend }) {
  return (
    <div className="mod-stat-card">
      <div className={`mod-stat-icon mod-stat-icon--${tone}`}>{icon}</div>
      <div className="mod-stat-body">
        <div className="mod-stat-label">{label}</div>
        <div className="mod-stat-value">{value}</div>
        {trend && (
          <div className={`mod-stat-trend ${trend.up ? 'is-up' : 'is-down'}`}>
            <span aria-hidden="true">{trend.up ? '↑' : '↓'}</span>
            {trend.pct}% vs last 7 days
          </div>
        )}
      </div>
    </div>
  );
}

function ModeratorProfile({ newReports, onClearNew }) {
  return (
    <div className="mod-rail-profile">
      <span className="mod-avatar">M</span>
      <div className="mod-profile-text">
        <div className="mod-profile-name">MODERATOR</div>
        <div className="mod-profile-role">REVIEWER</div>
      </div>
      <IconChevron />
      {newReports > 0 && (
        <button type="button" className="mod-rail-badge" onClick={onClearNew}>
          {newReports} new
        </button>
      )}
    </div>
  );
}

export default function AdminPanel({ onLogout }) {
  const [view, setView] = useState('dashboard');
  const [entries, setEntries] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0, pending: 0, needsEvidence: 0, ready: 0,
    trends: { total: { pct: 0, up: true }, pending: { pct: 0, up: true }, needsEvidence: { pct: 0, up: false }, ready: { pct: 0, up: true } },
  });
  const [reportTypes, setReportTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [events, setEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [newReports, setNewReports] = useState(0);
  const noteTimers = useRef({});

  const filters = useMemo(() => ({
    filterStatus, filterType, filterPlatform,
  }), [filterStatus, filterType, filterPlatform]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  const loadStats = useCallback(async () => {
    const data = await fetchDashboardStats();
    if (data) setStats(data);
  }, []);

  const loadRecent = useCallback(async () => {
    const { data } = await fetchRecentEvents(6);
    setRecentEvents(data || []);
  }, []);

  const loadEvents = useCallback(async (incidentId) => {
    const { data, error } = await supabase
      .from('incident_events')
      .select('*')
      .eq('incident_id', incidentId)
      .order('created_at', { ascending: false });
    if (!error) setEvents(data || []);
  }, []);

  const loadPage = useCallback(async () => {
    setLoading(true);
    const { data, error, count } = await fetchIncidentsPage(filters, page, PAGE_SIZE);
    if (!error) {
      setEntries(data || []);
      setTotalCount(count ?? 0);
    }
    setLoading(false);
  }, [filters, page]);

  useEffect(() => { fetchReportTypes().then(setReportTypes); }, []);
  useEffect(() => { loadPage(); }, [loadPage]);
  useEffect(() => { loadStats(); loadRecent(); }, [loadStats, loadRecent]);

  useEffect(() => {
    if (selectedId) loadEvents(selectedId);
    else setEvents([]);
  }, [selectedId, loadEvents]);

  useEffect(() => {
    if (view !== 'dashboard' && view !== 'reports') return undefined;
    const channel = supabase
      .channel('admin-incidents')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incidents' }, () => {
        setNewReports(n => n + 1);
        showToast('New report received');
        loadPage();
        loadStats();
        loadRecent();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'incidents' }, (payload) => {
        const row = payload.new;
        setEntries(prev => prev.map(e => e.id === row.id ? row : e));
        if (selectedId === row.id) setSelected(row);
        loadStats();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'incident_events' }, () => {
        loadRecent();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [view, loadPage, loadStats, loadRecent, selectedId]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const showStats = view === 'dashboard';
  const queueView = view === 'dashboard' || view === 'reports';

  const selectReport = async (id) => {
    setSelectedId(id);
    const onPage = entries.find(e => e.id === id);
    if (onPage) {
      setSelected(onPage);
      return;
    }
    const { data } = await fetchIncidentById(id);
    if (data) setSelected(data);
  };

  const closeDetail = () => {
    setSelectedId(null);
    setSelected(null);
  };

  const openFromDossier = async (id) => {
    setView('dashboard');
    setPage(1);
    setFilterStatus('all');
    setFilterType('all');
    setFilterPlatform('all');
    setSelectedId(id);
    const { data } = await fetchIncidentById(id);
    if (data) setSelected(data);
  };

  const applyQuickFilter = (status) => {
    setView('dashboard');
    setFilterStatus(status);
    setFilterType('all');
    setFilterPlatform('all');
    setPage(1);
    closeDetail();
  };

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterType('all');
    setFilterPlatform('all');
    setPage(1);
  };

  const updateField = async (id, field, value) => {
    const { error } = await supabase.from('incidents').update({ [field]: value }).eq('id', id);
    if (error) { showToast('Update failed'); return false; }
    const patch = { [field]: value };
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
    if (selectedId === id) setSelected(prev => prev ? { ...prev, ...patch } : prev);
    loadStats();
    return true;
  };

  const setStatus = async (id, status) => {
    const prev = entries.find(e => e.id === id)?.status;
    if (!await updateField(id, 'status', status)) return;
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('incident_events').insert({
      incident_id: id,
      event_type: 'status_changed',
      payload: { from: prev, to: status },
      actor: user?.email || 'moderator',
    });
    if (selectedId === id) loadEvents(id);
    loadRecent();
    showToast('Status updated');
  };

  const saveNote = (id, text) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, internal_note: text } : e));
    if (selectedId === id) setSelected(prev => prev ? { ...prev, internal_note: text } : prev);
    clearTimeout(noteTimers.current[id]);
    noteTimers.current[id] = setTimeout(async () => {
      if (!await updateField(id, 'internal_note', text)) return;
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('incident_events').insert({
        incident_id: id,
        event_type: 'note_updated',
        payload: { length: text.length },
        actor: user?.email || 'moderator',
      });
      if (selectedId === id) loadEvents(id);
      loadRecent();
    }, 700);
  };

  const handleExport = async () => {
    setExporting(true);
    const { data, error } = await fetchAllFilteredIncidents(filters);
    setExporting(false);
    if (error) { showToast('Export failed'); return; }
    downloadIncidentsCsv(data || []);
    showToast(`Exported ${(data || []).length} reports`);
  };

  const screenshots = (e) => {
    if (!e?.screenshot_urls) return [];
    return Array.isArray(e.screenshot_urls) ? e.screenshot_urls : [];
  };

  const switchView = (next) => {
    setView(next);
    closeDetail();
  };

  return (
    <div className="ad mod">
      <aside className="ad-sidebar mod-sidebar">
        <div className="mod-brand">
          <CompassLogo size={42} className="ad-brand-mark" />
          <div className="mod-brand-title">STAY WATCH</div>
          <div className="mod-brand-sub">MODERATOR</div>
        </div>

        <nav className="mod-nav">
          <button type="button" className={`mod-nav-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => switchView('dashboard')}>
            <IconDash /> DASHBOARD
          </button>
          <button type="button" className={`mod-nav-item ${view === 'reports' ? 'active' : ''}`} onClick={() => switchView('reports')}>
            <IconReport /> REPORTS
          </button>
          <button type="button" className={`mod-nav-item ${view === 'dossiers' ? 'active' : ''}`} onClick={() => switchView('dossiers')}>
            <IconDossier /> DOSSIERS
          </button>
          <button type="button" className={`mod-nav-item ${view === 'moderators' ? 'active' : ''}`} onClick={() => switchView('moderators')}>
            <IconMods /> MODERATORS
          </button>
          <button type="button" className={`mod-nav-item ${view === 'settings' ? 'active' : ''}`} onClick={() => switchView('settings')}>
            <IconSettings /> SETTINGS
          </button>
          <button type="button" className="mod-nav-item mod-nav-out" onClick={onLogout}>
            <IconOut /> LOG OUT
          </button>
        </nav>

        <div className="mod-sidebar-bottom">
          <CompassLogo size={22} className="mod-sidebar-icon" />
          <div className="mod-sidebar-foot">STAY WATCH<br />COMMUNITY PROTECTION &amp; REPORTING PLATFORM</div>
        </div>
      </aside>

      <div className="mod-main">
        {!selected && queueView && (
          <header className="mod-page-header">
            <ModeratorProfile newReports={newReports} onClearNew={() => setNewReports(0)} />
          </header>
        )}

        {selected ? (
          <div className="mod-workspace has-detail">
            <section className="mod-list-panel mod-list-panel-compact">
              <div className="mod-queue-head">
                <h2>REPORTS QUEUE</h2>
              </div>
              <div className="mod-table-wrap">
                <table className="mod-table mod-table-compact">
                  <tbody>
                    {entries.map(e => (
                      <tr
                        key={e.id}
                        className={selectedId === e.id ? 'selected' : ''}
                        onClick={() => selectReport(e.id)}
                      >
                        <td><span className="mod-rid">{modReportId(e.id, e.created_at)}</span></td>
                        <td><StatusBadge status={e.status} /></td>
                        <td className="mod-row-arrow">›</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
            <ReportDetail
              report={selected}
              events={events}
              note={selected.internal_note || ''}
              onNoteChange={text => saveNote(selected.id, text)}
              onClose={closeDetail}
              onStatus={setStatus}
              screenshots={screenshots(selected)}
              reportIdFn={modReportId}
            />
          </div>
        ) : (
          <div className="mod-layout">
            <div className="mod-center">
              {queueView && (
                <>
                  <header className="mod-dash-head">
                    <div>
                      <h1><span className="mod-dash-star" aria-hidden="true">✦</span> {view === 'dashboard' ? 'DASHBOARD' : 'REPORTS'}</h1>
                      <p>{view === 'dashboard' ? "Here's what's happening with reports today." : 'Review and process incoming reports.'}</p>
                    </div>
                    <button type="button" className="mod-btn mod-btn-outline mod-export-btn" onClick={handleExport} disabled={exporting}>
                      {exporting ? 'EXPORTING…' : 'EXPORT CSV'}
                    </button>
                  </header>

                  {showStats && (
                    <div className="mod-stats-row">
                      <StatCard label="Total Reports" value={stats.total} icon={<IconReport />} tone="gold" trend={stats.trends?.total} />
                      <StatCard label="Pending Review" value={stats.pending} icon={<IconDash />} tone="blue" trend={stats.trends?.pending} />
                      <StatCard label="Needs Evidence" value={stats.needsEvidence} icon={<IconEvidence />} tone="amber" trend={stats.trends?.needsEvidence} />
                      <StatCard label="Ready for Submission" value={stats.ready} icon={<IconReady />} tone="green" trend={stats.trends?.ready} />
                    </div>
                  )}

                  <section className="mod-queue mod-queue-panel">
                    <div className="mod-queue-head">
                      <h2>
                        REPORTS QUEUE
                        <span className="mod-queue-count">{totalCount}</span>
                      </h2>
                    </div>

                    <div className="mod-filters-row">
                      <div className="mod-filters">
                        <label>
                          <span>STATUS</span>
                          <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
                            <option value="all">All Statuses</option>
                            {STATUS_OPTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                          </select>
                        </label>
                        <label>
                          <span>TYPE</span>
                          <select value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
                            <option value="all">All Types</option>
                            {reportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </label>
                        <label>
                          <span>PLATFORM</span>
                          <select value={filterPlatform} onChange={e => { setFilterPlatform(e.target.value); setPage(1); }}>
                            <option value="all">All Platforms</option>
                            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </label>
                      </div>
                      <button type="button" className="mod-clear-filters" onClick={clearFilters}>
                        <IconClear /> Clear filters
                      </button>
                    </div>

                    {loading ? (
                      <div className="ad-empty">Loading…</div>
                    ) : !entries.length ? (
                      <div className="ad-empty">No reports found.</div>
                    ) : (
                      <div className="mod-table-wrap">
                        <table className="mod-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>TYPE</th>
                              <th>TARGET</th>
                              <th>PLATFORM</th>
                              <th>SUBMITTED</th>
                              <th>STATUS</th>
                              <th>PRIORITY</th>
                              <th className="mod-th-action" aria-label="Open" />
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map(e => {
                              const dup = e.status === 'duplicate' || ((e.report_count || 1) > 1 && e.status === 'new');
                              return (
                                <tr key={e.id} onClick={() => selectReport(e.id)}>
                                  <td><span className="mod-rid">{modReportId(e.id, e.created_at)}</span></td>
                                  <td>{e.report_type}</td>
                                  <td className="mod-target">{e.artist || '—'}</td>
                                  <td><PlatformCell platform={e.platform} /></td>
                                  <td className="muted">{formatTableDate(e.created_at)}</td>
                                  <td><StatusBadge status={e.status} duplicate={dup && e.status === 'new'} /></td>
                                  <td><PriorityBadge priority={e.priority} /></td>
                                  <td className="mod-row-arrow">›</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {!loading && totalCount > 0 && (
                      <div className="mod-pagination">
                        <span>
                          Showing {(pageSafe - 1) * PAGE_SIZE + 1} to {Math.min(pageSafe * PAGE_SIZE, totalCount)} of {totalCount} results
                        </span>
                        <div className="mod-pages">
                          <button type="button" disabled={pageSafe <= 1} onClick={() => setPage(p => p - 1)} aria-label="Previous page">‹</button>
                          {buildPageList(pageSafe, totalPages).map((p, i) => (
                            typeof p === 'number' ? (
                              <button
                                key={`p-${p}`}
                                type="button"
                                className={p === pageSafe ? 'active' : ''}
                                onClick={() => setPage(p)}
                              >
                                {p}
                              </button>
                            ) : (
                              <span key={`ellipsis-${i}`} className="mod-pages-ellipsis">{p}</span>
                            )
                          ))}
                          <button type="button" disabled={pageSafe >= totalPages} onClick={() => setPage(p => p + 1)} aria-label="Next page">›</button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}

              {view === 'dossiers' && <DossiersView onOpenReport={openFromDossier} />}

              {view === 'moderators' && (
                <div className="mod-placeholder">
                  <h2>MODERATORS</h2>
                  <p>Team management — coming soon.</p>
                </div>
              )}

              {view === 'settings' && (
                <div className="mod-placeholder">
                  <h2>SETTINGS</h2>
                  <p>Platform settings — coming soon.</p>
                </div>
              )}
            </div>

            {queueView && (
              <aside className="mod-rail">
                <section className="mod-rail-block">
                  <h3>QUICK ACTIONS</h3>
                  <button type="button" className="mod-btn mod-btn-approve mod-rail-action" onClick={() => applyQuickFilter('new')}>
                    <IconStar /> VIEW NEW REPORTS
                  </button>
                  <button type="button" className="mod-btn mod-btn-outline mod-rail-action" onClick={() => applyQuickFilter('needs_evidence')}>
                    <IconEvidence /> REPORTS NEEDING EVIDENCE
                  </button>
                  <button type="button" className="mod-btn mod-btn-outline mod-rail-action" onClick={() => applyQuickFilter('ready_for_submission')}>
                    <IconReady /> READY FOR SUBMISSION
                  </button>
                  <button type="button" className="mod-btn mod-btn-outline mod-rail-action" onClick={() => switchView('dossiers')}>
                    <IconFolder /> CREATE DOSSIER
                  </button>
                </section>

                <section className="mod-rail-block mod-rail-activity">
                  <h3>RECENT ACTIVITY</h3>
                  <ul className="mod-rail-events">
                    {recentEvents.length === 0 ? (
                      <li className="mod-rail-empty">No activity yet</li>
                    ) : recentEvents.map(ev => (
                      <li key={ev.id}>
                        <span className={`mod-rail-dot ${eventDotClass(ev)}`} />
                        <div>
                          <p>{formatRailEventText(ev)}</p>
                          <span className="mod-rail-meta">
                            {modReportId(ev.incident_id, ev.incidents?.created_at || ev.created_at)}
                          </span>
                          <span className="mod-rail-time">{timeAgo(ev.created_at)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <p className="mod-rail-footnote">All times shown in your local time zone.</p>
                </section>
              </aside>
            )}
          </div>
        )}
      </div>

      <div className={`ad-toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}

function ReportDetail({ report, events, note, onNoteChange, onClose, onStatus, screenshots, reportIdFn = reportId }) {
  const dup = report.status === 'duplicate' || ((report.report_count || 1) > 1 && report.status === 'new');
  const rid = reportIdFn(report.id, report.created_at);
  const submittedBy = reporterId(report.id);

  const activity = events.length > 0
    ? events.map((e, i) => ({
        at: e.created_at,
        text: formatEventText(e),
        current: i === 0,
      }))
    : [
        {
          at: report.created_at,
          text: `Status: ${statusActivityLabel(report.status)}`,
          current: true,
        },
        {
          at: report.created_at,
          text: `Report submitted by ${submittedBy}`,
          current: false,
        },
      ];

  return (
    <section className="mod-detail-panel mod-detail-panel-full">
      <div className="mod-detail-top">
        <button type="button" className="mod-back" onClick={onClose}>← Back to dashboard</button>
        <div className="mod-detail-id">
          <div className="mod-detail-id-main">
            <h2>#{rid}</h2>
            <span className="muted">{formatSubmitted(report.created_at)}</span>
          </div>
          <StatusBadge status={report.status} duplicate={dup && report.status === 'new'} />
        </div>
      </div>

      <div className="mod-detail-body">
        <div className="mod-detail-main">
          <section className="mod-block">
            <h3><span className="mod-section-num">01</span> REPORT INFORMATION</h3>
            <div className="mod-info-grid">
              <div><label>TARGET</label><strong>{report.artist}</strong></div>
              <div><label>TYPE</label><strong>{report.report_type}</strong></div>
              <div><label>PLATFORM</label><strong>{report.platform}</strong></div>
              <div><label>CATEGORY</label><strong>{report.title || report.report_type}</strong></div>
              <div><label>SUBMITTED BY</label><strong>{submittedBy}</strong></div>
              <div><label>PRIORITY</label><strong>{priorityLabel(report.priority)}</strong></div>
              <div className="mod-info-wide">
                <label>POST URL</label>
                {report.url ? (
                  <a href={report.url} target="_blank" rel="noopener noreferrer">{report.url} ↗</a>
                ) : '—'}
              </div>
            </div>
          </section>

          <section className="mod-block">
            <h3><span className="mod-section-num">02</span> EVIDENCE</h3>
            <div className="mod-evidence">
              {(screenshots.length > 0 || report.quote) ? (
                <>
                  <div className="mod-evidence-main">
                    {screenshots.length > 0 ? (
                      <a href={screenshots[0]} target="_blank" rel="noopener noreferrer">
                        <img src={screenshots[0]} alt="Evidence" />
                      </a>
                    ) : (
                      <div className="mod-evidence-card mod-evidence-card-inline">
                        <div className="mod-evidence-card-head">
                          <span>{report.platform}</span>
                          {report.post_author && <span>@{report.post_author}</span>}
                        </div>
                        <p>{report.quote}</p>
                      </div>
                    )}
                  </div>
                  {(screenshots.length > 1 || (screenshots.length === 1 && report.quote)) && (
                    <div className="mod-evidence-thumbs">
                      {screenshots.length > 1 && screenshots.slice(1, 4).map((url, i) => (
                        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt={`Evidence ${i + 2}`} />
                        </a>
                      ))}
                      {screenshots.length > 4 && <div className="mod-evidence-more">+{screenshots.length - 4}</div>}
                      {screenshots.length === 1 && report.quote && (
                        <div className="mod-evidence-card mod-evidence-card-mini">
                          <p>{report.quote.length > 80 ? `${report.quote.slice(0, 80)}…` : report.quote}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <p className="mod-no-evidence">No evidence attached.</p>
              )}
            </div>
            {report.url && (
              <a className="mod-open-post" href={report.url} target="_blank" rel="noopener noreferrer">
                OPEN ORIGINAL POST ↗
              </a>
            )}
          </section>

          <section className="mod-block">
            <h3><span className="mod-section-num">03</span> MODERATOR DECISION</h3>
            <div className="mod-actions">
              <button type="button" className="mod-btn mod-btn-approve" onClick={() => onStatus(report.id, 'ready_for_submission')}>
                <IconCompass /> APPROVE
              </button>
              <button type="button" className="mod-btn mod-btn-outline" onClick={() => onStatus(report.id, 'needs_evidence')}>
                NEED MORE EVIDENCE
              </button>
              <button type="button" className="mod-btn mod-btn-reject" onClick={() => onStatus(report.id, 'rejected')}>
                REJECT
              </button>
              <button type="button" className="mod-btn mod-btn-outline" onClick={() => onStatus(report.id, 'duplicate')}>
                MARK AS DUPLICATE
              </button>
            </div>
          </section>

          <section className="mod-block">
            <h3><span className="mod-section-num">04</span> INTERNAL NOTE</h3>
            <div className="mod-note-wrap">
              <textarea
                className="mod-note"
                placeholder="Add an internal note (not visible to the reporter)…"
                maxLength={1000}
                value={note}
                onChange={e => onNoteChange(e.target.value)}
              />
              <span className="mod-note-count">{note.length} / 1000</span>
            </div>
          </section>
        </div>

        <aside className="mod-activity">
          <h3><span className="mod-section-num">05</span> ACTIVITY LOG</h3>
          <ul>
            {activity.map((item, i) => (
              <li key={i} className={item.current ? 'current' : ''}>
                <span className="mod-activity-dot" />
                <div>
                  <p>{item.text}</p>
                  <time>{formatActivityDate(item.at)}</time>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>
  );
}
