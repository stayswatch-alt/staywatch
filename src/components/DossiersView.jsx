import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { reportId, statusLabel } from '../lib/incidentStatus.js';

export default function DossiersView({ onOpenReport }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('incidents')
        .select('id, artist, report_type, platform, status, report_count, created_at, url')
        .order('report_count', { ascending: false });
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  const byArtist = useMemo(() => {
    const map = new Map();
    for (const r of rows) {
      const key = r.artist || 'Unknown';
      if (!map.has(key)) map.set(key, { artist: key, total: 0, open: 0, reports: 0 });
      const g = map.get(key);
      g.total += 1;
      g.reports += r.report_count || 1;
      if (['new', 'under_review', 'needs_evidence'].includes(r.status)) g.open += 1;
    }
    return [...map.values()].sort((a, b) => b.reports - a.reports);
  }, [rows]);

  const multiReported = useMemo(
    () => rows.filter(r => (r.report_count || 1) > 1),
    [rows],
  );

  if (loading) return <div className="ad-empty">Loading dossiers…</div>;

  return (
    <div className="mod-dossiers">
      <div className="mod-list-head">
        <h1>DOSSIERS</h1>
        <p>Case overview grouped by target and repeat reports.</p>
      </div>

      <section className="mod-dossier-section">
        <h2>By target (member)</h2>
        <div className="mod-table-wrap">
          <table className="mod-table">
            <thead>
              <tr>
                <th>TARGET</th>
                <th>CASES</th>
                <th>TOTAL REPORTS</th>
                <th>OPEN</th>
              </tr>
            </thead>
            <tbody>
              {byArtist.length === 0 ? (
                <tr><td colSpan={4} className="ad-empty">No cases yet</td></tr>
              ) : byArtist.map(g => (
                <tr key={g.artist}>
                  <td><strong>{g.artist}</strong></td>
                  <td>{g.total}</td>
                  <td>{g.reports}</td>
                  <td>{g.open}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mod-dossier-section">
        <h2>Multi-reported URLs</h2>
        <p className="mod-dossier-hint">Same post reported more than once by the community.</p>
        <div className="mod-table-wrap">
          <table className="mod-table">
            <thead>
              <tr>
                <th>REPORT ID</th>
                <th>TARGET</th>
                <th>COUNT</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {multiReported.length === 0 ? (
                <tr><td colSpan={5} className="ad-empty">No duplicate URLs yet</td></tr>
              ) : multiReported.map(r => (
                <tr key={r.id}>
                  <td><span className="mod-rid">{reportId(r.id, r.created_at)}</span></td>
                  <td>{r.artist}</td>
                  <td>{r.report_count}</td>
                  <td>{statusLabel(r.status)}</td>
                  <td>
                    <button type="button" className="mod-link-btn" onClick={() => onOpenReport(r.id)}>
                      Open →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
