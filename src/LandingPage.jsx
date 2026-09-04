import React, { useEffect, useState } from 'react';
import SiteLayout from './components/SiteLayout.jsx';
import { reportId, statusLabel } from './lib/incidentStatus.js';
import { supabase } from './supabaseClient';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const STATUS_CLS = {
  new: 'lp-badge-new',
  under_review: 'lp-badge-review',
  needs_evidence: 'lp-badge-evidence',
  verified: 'lp-badge-verified',
  ready_for_submission: 'lp-badge-ready',
  rejected: 'lp-badge-archived',
  duplicate: 'lp-badge-archived',
  archived: 'lp-badge-archived',
};

const STEPS = [
  {
    num: '01',
    title: 'Report',
    text: 'Submit harmful posts with screenshots and links. Anyone in STAY can contribute safely and anonymously.',
  },
  {
    num: '02',
    title: 'Review',
    text: 'Moderators verify evidence, remove duplicates, and document each case with care.',
  },
  {
    num: '03',
    title: 'Submit to JYPE',
    text: 'Verified reports are compiled and sent to JYPE as structured, responsible community action.',
  },
];

function PlatformIcon({ platform }) {
  const p = (platform || '').toLowerCase();
  if (p.includes('twitter') || p.startsWith('x')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
        <path d="M3 3 h4.5 l4 5.5 L16.5 3 H21 l-6.8 8.2 L21.5 21 H17 l-4.4-6 L7 21 H2.5 l7.2-8.7 Z" />
      </svg>
    );
  }
  if (p.includes('tiktok')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
        <path d="M16 3v8.5a4.5 4.5 0 11-2.5-4v3a1.5 1.5 0 102 1.4V3h2.5z" />
      </svg>
    );
  }
  if (p.includes('youtube')) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14" aria-hidden="true">
        <path d="M10 9.5 L15.5 12 L10 14.5 Z M21 8.5a2.5 2.5 0 00-1.8-1.8C17.2 6.2 12 6.2 12 6.2s-5.2 0-7.2.5A2.5 2.5 0 003 8.5 26 26 0 002.5 12a26 26 0 00.5 3.5 2.5 2.5 0 001.8 1.8c2 .5 7.2.5 7.2.5s5.2 0 7.2-.5a2.5 2.5 0 001.8-1.8A26 26 0 0021.5 12a26 26 0 00-.5-3.5z" />
      </svg>
    );
  }
  return null;
}

export default function LandingPage() {
  const [stats, setStats] = useState({ total: 0, pending: 0, ready: 0 });
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase.rpc('get_public_report_stats');
      if (error || data == null) return;
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setStats({
        total: Number(parsed.total) || 0,
        pending: Number(parsed.pending) || 0,
        ready: Number(parsed.ready) || 0,
      });
      setRecent(Array.isArray(parsed.recent) ? parsed.recent : []);
    }
    fetchData();
  }, []);

  return (
    <SiteLayout active="home">
      <div className="lp-band lp-band-hero">
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow">
              <span className="lp-eyebrow-star" aria-hidden="true">✦</span> One community.
              <br />One purpose.
            </p>
            <h1 className="lp-title">Stay Watch</h1>
            <p className="lp-subtitle">Stay always protects Stray Kids</p>
            <p className="lp-lead">
              We unite STAY worldwide to support Stray Kids through protection,
              documentation, and responsible community action.
            </p>
            <div className="lp-cta-row">
              <a className="lp-btn lp-btn-primary" href="/report">
                Submit a report <span aria-hidden="true">✦</span>
              </a>
              <a className="lp-btn lp-btn-ghost" href="#about">
                Learn how we protect
              </a>
            </div>
          </div>
          <div className="lp-hero-art">
            <img
              src="/emblem-cut.png"
              alt="Stay Watch emblem"
              className="lp-emblem"
              width={580}
              height={580}
              decoding="async"
            />
          </div>
        </section>
      </div>

      <div className="lp-band lp-band-trust">
        <div className="lp-trust-strip">
          <span><span className="lp-trust-dot" aria-hidden="true">✦</span> Independent STAY initiative</span>
          <span className="lp-trust-sep" aria-hidden="true">·</span>
          <span>Evidence-based reporting</span>
          <span className="lp-trust-sep" aria-hidden="true">·</span>
          <span>Verified cases sent to JYPE</span>
        </div>
      </div>

      <div className="lp-band lp-band-steps">
        <section className="lp-steps-section" id="how">
          <div className="lp-section-head">
            <span className="lp-rule" />
            <h2>How it works</h2>
            <span className="lp-rule" />
          </div>
          <div className="lp-steps-row">
            {STEPS.map((step) => (
              <article key={step.num} className="lp-step-card">
                <div className="lp-step-num">{step.num}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
          <div className="lp-steps-cta">
            <a className="lp-btn lp-btn-primary" href="/report">
              Start a report <span aria-hidden="true">✦</span>
            </a>
          </div>
        </section>
      </div>

      <div className="lp-band lp-band-stats">
        <section className="lp-stats-section">
          <p className="lp-band-label">Community impact</p>
          <div className="lp-stats-row">
            <div className="lp-stat-card">
              <div className="lp-stat-label">Total Reports</div>
              <div className="lp-stat-num">{stats.total.toLocaleString()}</div>
              <p className="lp-stat-hint">Documented by the community</p>
            </div>
            <div className="lp-stat-card">
              <div className="lp-stat-label">Under Review</div>
              <div className="lp-stat-num">{stats.pending.toLocaleString()}</div>
              <p className="lp-stat-hint">Being verified by moderators</p>
            </div>
            <div className="lp-stat-card lp-stat-card--accent">
              <div className="lp-stat-label">Ready for Submission</div>
              <div className="lp-stat-num">{stats.ready.toLocaleString()}</div>
              <p className="lp-stat-hint">Prepared for JYPE</p>
            </div>
          </div>
        </section>
      </div>

      <div className="lp-band lp-band-recent">
        <section className="lp-recent-section">
          <div className="lp-recent-head">
            <h2>Recent activity</h2>
            <a href="/report" className="lp-viewall">Submit yours →</a>
          </div>
          {recent.length === 0 ? (
            <div className="lp-recent-empty">
              <p>No public reports yet.</p>
              <a className="lp-btn lp-btn-ghost" href="/report">Be the first to report</a>
            </div>
          ) : (
            <>
              <div className="lp-recent-grid">
                {recent.map(e => (
                  <article key={e.id} className="lp-report-card">
                    <div className="lp-report-card-top">
                      <span className="lp-report-card-id">{reportId(e.id, e.created_at)}</span>
                      <span className={`lp-badge ${STATUS_CLS[e.status] || ''}`}>
                        {statusLabel(e.status) || e.status}
                      </span>
                    </div>
                    <h3 className="lp-report-card-type">{e.report_type}</h3>
                    <div className="lp-report-card-meta">
                      <span className="lp-report-card-platform">
                        <PlatformIcon platform={e.platform} />
                        {e.platform}
                      </span>
                      <span className="lp-report-card-time">{timeAgo(e.created_at)}</span>
                    </div>
                  </article>
                ))}
              </div>
              <p className="lp-recent-foot">
                Showing latest {recent.length} of {stats.total} documented cases
              </p>
            </>
          )}
        </section>
      </div>

      <div className="lp-band lp-band-about">
        <section className="lp-about-section" id="about">
          <div className="lp-section-head">
            <span className="lp-rule" />
            <h2>About</h2>
            <span className="lp-rule" />
          </div>
          <div className="lp-about-body">
            <p className="lp-about-text">
              Stay Watch is an independent STAY-run initiative. We systematically
              document cases of harassment, defamation, and harmful content
              targeting Stray Kids — and compile verified evidence for direct
              submission to JYPE.
            </p>
            <a href="/report" className="lp-btn lp-btn-primary">
              Submit a report <span aria-hidden="true">✦</span>
            </a>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
