import { reportId, statusLabel } from './incidentStatus.js';

function csvCell(val) {
  const s = val == null ? '' : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Download incidents as CSV (JYPE / archive export). */
export function downloadIncidentsCsv(rows, filename) {
  const headers = [
    'report_id', 'artist', 'report_type', 'platform', 'status', 'priority',
    'url', 'quote', 'report_count', 'created_at', 'internal_note', 'screenshot_urls',
  ];
  const lines = [headers.join(',')];
  for (const e of rows) {
    lines.push([
      reportId(e.id, e.created_at),
      e.artist,
      e.report_type,
      e.platform,
      statusLabel(e.status),
      e.priority,
      e.url,
      e.quote,
      e.report_count,
      e.created_at,
      e.internal_note,
      Array.isArray(e.screenshot_urls) ? e.screenshot_urls.join(' | ') : '',
    ].map(csvCell).join(','));
  }
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename || `stay-watch-export-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
