import { supabase } from '../supabaseClient';

export function applyIncidentFilters(query, filters) {
  let q = query;
  if (filters.filterStatus && filters.filterStatus !== 'all') {
    q = q.eq('status', filters.filterStatus);
  }
  if (filters.filterType && filters.filterType !== 'all') {
    q = q.eq('report_type', filters.filterType);
  }
  if (filters.filterPlatform && filters.filterPlatform !== 'all') {
    q = q.eq('platform', filters.filterPlatform);
  }
  return q;
}

export async function fetchIncidentsPage(filters, page, pageSize) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let q = supabase.from('incidents').select('*', { count: 'exact' });
  q = applyIncidentFilters(q, filters);
  return q.order('created_at', { ascending: false }).range(from, to);
}

export async function fetchAllFilteredIncidents(filters) {
  let q = supabase.from('incidents').select('*');
  q = applyIncidentFilters(q, filters);
  return q.order('created_at', { ascending: false });
}

export async function fetchReportTypes() {
  const { data } = await supabase.from('incidents').select('report_type');
  const set = new Set((data || []).map(r => r.report_type).filter(Boolean));
  return [...set].sort();
}

export async function fetchIncidentById(id) {
  return supabase.from('incidents').select('*').eq('id', id).single();
}

function calcTrend(rows, matchFn) {
  const now = Date.now();
  const week = 7 * 86400000;
  const curr = rows.filter(r => {
    const age = now - new Date(r.created_at).getTime();
    return age < week && matchFn(r);
  }).length;
  const prev = rows.filter(r => {
    const age = now - new Date(r.created_at).getTime();
    return age >= week && age < 2 * week && matchFn(r);
  }).length;
  if (prev === 0) return { pct: curr > 0 ? 100 : 0, up: curr >= prev };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return { pct: Math.abs(pct), up: pct >= 0 };
}

export async function fetchDashboardStats() {
  const { data, error } = await supabase.from('incidents').select('status, created_at');
  if (error) return null;
  const rows = data || [];
  const isPending = r => ['new', 'under_review'].includes(r.status);
  return {
    total: rows.length,
    pending: rows.filter(isPending).length,
    needsEvidence: rows.filter(r => r.status === 'needs_evidence').length,
    ready: rows.filter(r => r.status === 'ready_for_submission').length,
    trends: {
      total: calcTrend(rows, () => true),
      pending: calcTrend(rows, isPending),
      needsEvidence: calcTrend(rows, r => r.status === 'needs_evidence'),
      ready: calcTrend(rows, r => r.status === 'ready_for_submission'),
    },
  };
}

export async function fetchRecentEvents(limit = 6) {
  return supabase
    .from('incident_events')
    .select('id, event_type, payload, actor, created_at, incident_id, incidents(created_at)')
    .order('created_at', { ascending: false })
    .limit(limit);
}
