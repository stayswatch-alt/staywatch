import React, { useState, useRef, useCallback } from 'react';
import { supabase } from './supabaseClient';
import SiteLayout from './components/SiteLayout.jsx';
import DatePicker from './components/DatePicker.jsx';

const ARTISTS = ['Stray Kids', 'Bang Chan', 'Lee Know', 'Changbin', 'Hyunjin', 'Han', 'Felix', 'Seungmin', 'I.N'];
const REPORT_TYPES = [
  'Defamation/Insult',
  'Rumors/False Info',
  'Sexual Harassment',
  'AI Deepfake Misuse',
  'Stalking/Sasaeng',
  'Safety Threat',
  'Flight Info Sale',
  'Copyright',
  'Other',
];
const PLATFORMS = [
  'X (Twitter)', 'Instagram', 'TikTok', 'YouTube', 'Threads',
  'Facebook', 'Telegram', 'Reddit', 'Weibo', 'Discord',
  'Naver', 'RedNote', 'Pann', 'TheQoo', 'Other',
];
const LANGS = ['EN', 'KR', 'ES', 'FR', 'CN', 'JPN', 'IND', 'RU', 'AR', 'Other'];

const emptyForm = {
  artist: ARTISTS[0],
  report_type: REPORT_TYPES[0],
  title: '',
  platform: PLATFORMS[0],
  quote: '',
  post_author: '',
  post_date: '',
  screenshot_date: '',
  url: '',
  lang: LANGS[0],
  hp: '',
};

const MAX_FILES = 3;
const MAX_SIZE_MB = 1;

export default function PublicForm() {
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([null, null, null]);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const slotRefs = [useRef(null), useRef(null), useRef(null)];

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSlotChange = (idx, e) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > MAX_SIZE_MB * 1024 * 1024) {
      setStatus('error');
      setErrorMsg(`"${file.name}" exceeds ${MAX_SIZE_MB} MB.`);
      e.target.value = '';
      return;
    }
    setStatus(null);
    setFiles((prev) => { const next = [...prev]; next[idx] = file; return next; });
  };

  const removeSlot = (idx) => {
    setFiles((prev) => { const next = [...prev]; next[idx] = null; return next; });
    if (slotRefs[idx].current) slotRefs[idx].current.value = '';
  };

  const uploadScreenshots = async () => {
    const urls = [];
    for (const file of files.filter(Boolean)) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from('screenshots').upload(path, file);
      if (uploadError) throw new Error(`Failed to upload "${file.name}".`);
      const { data } = supabase.storage.from('screenshots').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async () => {
    if (!form.quote.trim()) {
      setStatus('error');
      setErrorMsg('Please describe the incident in the field below.');
      return;
    }
    if (!form.url.trim()) {
      setStatus('error');
      setErrorMsg('Please provide the post URL.');
      return;
    }
    if (files.every((f) => f === null)) {
      setStatus('error');
      setErrorMsg('Please attach at least one screenshot or file as evidence.');
      return;
    }

    setSubmitting(true);
    setStatus(null);

    let screenshotUrls = [];
    try {
      screenshotUrls = await uploadScreenshots();
    } catch (uploadErr) {
      setSubmitting(false);
      setStatus('error');
      setErrorMsg(uploadErr.message || 'Failed to upload screenshots.');
      return;
    }

    const { error } = await supabase.rpc('submit_incident', {
      p_artist: form.artist,
      p_report_type: form.report_type,
      p_title: form.title || null,
      p_quote: form.quote,
      p_platform: form.platform,
      p_post_author: form.post_author || null,
      p_post_date: form.post_date || null,
      p_screenshot_date: form.screenshot_date || null,
      p_url: form.url,
      p_lang: form.lang,
      p_screenshot_urls: screenshotUrls,
      p_hp: form.hp,
    });

    setSubmitting(false);

    if (error) {
      setStatus('error');
      setErrorMsg('Submission failed. Please try again in a moment.');
      return;
    }

    setStatus('success');
    setForm(emptyForm);
    setFiles([null, null, null]);
  };

  return (
    <SiteLayout active="reports">
      <section className="rp">
        <div className="rp-head">
          <p className="lp-eyebrow">
            <span className="lp-eyebrow-star" aria-hidden="true">✦</span> Report Center
          </p>
          <h1 className="rp-title">Submit a Report</h1>
          <p className="rp-lead">
            Document harmful content targeting Stray Kids. Reports are reviewed
            by moderators and compiled for submission to JYPE.
          </p>
        </div>

        {status === 'success' && (
          <div className="rp-banner rp-banner-ok">
            ✦ Thank you — your report has been received and added to the review queue.
          </div>
        )}
        {status === 'error' && (
          <div className="rp-banner rp-banner-err">⚠ {errorMsg}</div>
        )}

        {/* honeypot */}
        <input type="text" name="website" value={form.hp} onChange={set('hp')}
          className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />

        <div className="rp-card">

          {/* ── SECTION 1: Target ── */}
          <div className="rp-section">
            <div className="rp-section-label">
              <span className="rp-step">01</span> Who was targeted?
            </div>
            <div className="rp-row">
              <div className="rp-col">
                <label className="rp-label" htmlFor="artist">Member</label>
                <select id="artist" className="rp-input" value={form.artist} onChange={set('artist')}>
                  {ARTISTS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <p className="rp-hint">Select "Group" if the whole group is targeted.</p>
              </div>
              <div className="rp-col">
                <label className="rp-label" htmlFor="reportType">Report Type</label>
                <select id="reportType" className="rp-input" value={form.report_type} onChange={set('report_type')}>
                  {REPORT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <p className="rp-hint">Choose the category that best fits the violation.</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: Source ── */}
          <div className="rp-section">
            <div className="rp-section-label">
              <span className="rp-step">02</span> Where did it happen?
            </div>
            <div className="rp-row">
              <div className="rp-col">
                <label className="rp-label" htmlFor="platform">Platform</label>
                <select id="platform" className="rp-input" value={form.platform} onChange={set('platform')}>
                  {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="rp-col rp-col-sm">
                <label className="rp-label" htmlFor="postDate">Posting Date</label>
                <DatePicker id="postDate" value={form.post_date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={set('post_date')} />
              </div>
            </div>
          </div>

          {/* ── SECTION 3: Description ── */}
          <div className="rp-section">
            <div className="rp-section-label">
              <span className="rp-step">03</span> Describe the incident
            </div>
            <label className="rp-label" htmlFor="quoteText">
              Content / Description <span className="rp-required">required</span>
            </label>
            <textarea id="quoteText" className="rp-input rp-textarea"
              placeholder="Paste the harmful text, quote, or describe what happened in detail…"
              value={form.quote} onChange={set('quote')} />
            <div className="rp-row" style={{ marginTop: '14px' }}>
              <div className="rp-col">
                <label className="rp-label" htmlFor="titleField">
                  Case Title <span className="rp-optional">optional</span>
                </label>
                <input id="titleField" className="rp-input" type="text"
                  placeholder="Short label for this case"
                  value={form.title} onChange={set('title')} />
                <p className="rp-hint">Used internally by moderators to identify the report.</p>
              </div>
              <div className="rp-col rp-col-sm">
                <label className="rp-label" htmlFor="lang">Language of Content</label>
                <select id="lang" className="rp-input" value={form.lang} onChange={set('lang')}>
                  {LANGS.map((l) => <option key={l} value={l}>{l}</option>)}
                </select>
                <p className="rp-hint">Language of the reported post.</p>
              </div>
            </div>
          </div>

          {/* ── SECTION 4: Evidence ── */}
          <div className="rp-section">
            <div className="rp-section-label">
              <span className="rp-step">04</span> Attach evidence
              <span className="rp-required" style={{ marginLeft: '10px' }}>required</span>
            </div>

            <div className="rp-slots">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className={`rp-slot ${file ? 'has-file' : ''}`}
                  onClick={() => !file && slotRefs[idx].current?.click()}
                >
                  {file ? (
                    <>
                      <div className="rp-slot-icon filled" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none" width="38" height="38">
                          <path d="M12 6 H30 L38 14 V42 H12 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M30 6 V14 H38" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M18 28 l5 5 l9 -10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <p className="rp-slot-name">{file.name}</p>
                      <p className="rp-slot-size">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <button className="rp-slot-remove" onClick={(e) => { e.stopPropagation(); removeSlot(idx); }} aria-label="Remove file">×</button>
                    </>
                  ) : (
                    <>
                      <div className="rp-slot-icon" aria-hidden="true">
                        <svg viewBox="0 0 48 48" fill="none" width="38" height="38">
                          <path d="M12 6 H30 L38 14 V42 H12 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M30 6 V14 H38" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                          <path d="M24 20 V32 M18 26 H30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <p className="rp-slot-name">Select a file</p>
                      <p className="rp-slot-size">0 MB</p>
                    </>
                  )}
                  <input ref={slotRefs[idx]} type="file" className="rp-file-hidden"
                    accept="image/*"
                    onChange={(e) => handleSlotChange(idx, e)} />
                </div>
              ))}
            </div>
            <p className="rp-hint" style={{ marginTop: '10px' }}>JPG · PNG · GIF · WEBP · max {MAX_SIZE_MB} MB each</p>

            <label className="rp-label" htmlFor="tweetUrl" style={{ marginTop: '18px' }}>
              Post URL <span className="rp-required">required</span>
            </label>
            <input id="tweetUrl" className="rp-input" type="url"
              placeholder="https://x.com/username/status/…"
              value={form.url} onChange={set('url')} />
            <p className="rp-hint">Direct link to the post — helps moderators verify the report.</p>

            <div className="rp-row" style={{ marginTop: '14px' }}>
              <div className="rp-col rp-col-sm">
                <label className="rp-label" htmlFor="screenshotDate">Screenshot Date</label>
                <DatePicker id="screenshotDate" value={form.screenshot_date}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={set('screenshot_date')} />
              </div>
            </div>
            <p className="rp-hint" style={{ marginTop: '8px' }}>
              Prefer full-screen captures that clearly show the URL, author, and date of the post.
            </p>
          </div>

          <button type="button" className="lp-btn lp-btn-primary rp-submit"
            onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Report'} <span aria-hidden="true">✦</span>
          </button>
        </div>

        <div className="rp-modlink">
          <a href="/admin">Moderator login →</a>
        </div>
      </section>
    </SiteLayout>
  );
}
