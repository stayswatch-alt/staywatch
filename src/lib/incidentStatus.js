/** Shared incident status labels for admin + landing */
export const STATUS_OPTS = [
  { value: 'new',                  label: 'New',              badge: 'NEW' },
  { value: 'under_review',         label: 'Under Review',     badge: 'UNDER REVIEW' },
  { value: 'needs_evidence',       label: 'Needs Evidence',   badge: 'NEEDS EVIDENCE' },
  { value: 'verified',             label: 'Approved',         badge: 'APPROVED' },
  { value: 'ready_for_submission', label: 'Ready for JYPE',   badge: 'APPROVED' },
  { value: 'rejected',             label: 'Rejected',         badge: 'REJECTED' },
  { value: 'duplicate',            label: 'Duplicate',        badge: 'DUPLICATE' },
  { value: 'archived',             label: 'Rejected',         badge: 'REJECTED' },
];

export const PLATFORMS = [
  'X (Twitter)', 'Instagram', 'TikTok', 'YouTube', 'Facebook', 'Threads', 'Other',
];

export function statusLabel(status) {
  return STATUS_OPTS.find(s => s.value === status)?.badge
    ?? status?.replace(/_/g, ' ').toUpperCase();
}

export function statusActivityLabel(status) {
  return STATUS_OPTS.find(s => s.value === status)?.label
    ?? status?.replace(/_/g, ' ');
}

export function reportId(id, createdAt) {
  const year = new Date(createdAt).getFullYear();
  return `RPT-${year}-${String(id).padStart(6, '0')}`;
}
