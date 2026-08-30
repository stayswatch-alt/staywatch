import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const ARTISTS = ['Group', 'Bang Chan', 'Lee Know', 'Changbin', 'Hyunjin', 'Han', 'Felix', 'Seungmin', 'I.N'];
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
  'X(Twitter)',
  'Instagram',
  'TikTok',
  'YouTube',
  'Threads',
  'Facebook',
  'Telegram',
  'Reddit',
  'Weibo',
  'Discord',
  'VK',
  'Instiz',
  'Tistory',
  'Other',
];
const LANGS = ['EN', 'KO', 'ZH', 'RU', 'Other'];
const STATUS_LABELS = { open: 'Open', sent: 'Отправлено', archived: 'В архиве' };

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
};

export default function AdminPanel({ onLogout }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [filterLang, setFilterLang] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterArtist, setFilterArtist] = useState('all');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 1800);
  };

  const loadEntries = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setErrorMsg('');
      setEntries(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const handleAdd = async () => {
    if (!form.quote.trim() || !form.url.trim()) {
      showToast('Заполни текст и ссылку');
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
    });

    if (error) {
      showToast('Ошибка сохранения');
      setErrorMsg(error.message);
      return;
    }

    setForm(emptyForm);
    await loadEntries();
    showToast('Добавлено');
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (error) {
      showToast('Ошибка удаления');
      return;
    }
    await loadEntries();
  };

  const handleStatusChange = async (id, status) => {
    const { error } = await supabase.from('incidents').update({ status }).eq('id', id);
    if (error) {
      showToast('Ошибка обновления статуса');
      return;
    }
    await loadEntries();
  };

  const handleExport = async () => {
    if (entries.length === 0) {
      showToast('Журнал пуст');
      return;
    }
    let text = `#\tArtist\tReport Type\tTitle\tContents\tPlatform\tAuthor\tDate\tScreenshot Date\tURL\tЯзык\tСтатус\tRepeats\tFiles\n`;
    entries.forEach((e, i) => {
      text += `${i + 1}\t${e.artist}\t${e.report_type}\t${e.title || ''}\t${e.quote}\t${e.platform}\t${
        e.post_author || ''
      }\t${e.post_date || ''}\t${e.screenshot_date || ''}\t${e.url}\t${e.lang}\t${STATUS_LABELS[e.status]}\t${
        e.report_count || 1
      }\t${(e.screenshot_urls || []).join(' | ')}\n`;
    });
    try {
      await navigator.clipboard.writeText(text);
      showToast('Скопировано в буфер');
    } catch {
      showToast('Не удалось скопировать');
    }
  };

  const filtered = entries.filter((e) => {
    if (filterLang !== 'all' && e.lang !== filterLang) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    if (filterArtist !== 'all' && e.artist !== filterArtist) return false;
    return true;
  });

  const counts = {
    open: entries.filter((e) => e.status === 'open').length,
    sent: entries.filter((e) => e.status === 'sent').length,
    archived: entries.filter((e) => e.status === 'archived').length,
  };

  return (
    <div className="wrap">
      <header>
        <div className="brand-row">
          <div className="star-mark" />
          <div>
            <div className="eyebrow">Stay // Moderator Panel</div>
            <h1>Stay Watch</h1>
          </div>
        </div>
        <div className="source-line">Журнал инцидентов — документация вредоносного контента о Stray Kids</div>
        <button className="secondary small logout-btn" onClick={onLogout}>
          Выйти
        </button>
      </header>

      {errorMsg && (
        <div className="error-banner">
          Ошибка подключения к Supabase: {errorMsg}. Проверь .env.local и что таблица
          "incidents" создана (supabase/schema.sql).
        </div>
      )}

      <div className="stats-bar">
        <div className="stat open">
          <div className="num">{counts.open}</div>
          <div className="label">Open</div>
        </div>
        <div className="stat sent">
          <div className="num">{counts.sent}</div>
          <div className="label">Отправлено</div>
        </div>
        <div className="stat archived">
          <div className="num">{counts.archived}</div>
          <div className="label">В архиве</div>
        </div>
      </div>

      <div className="panel">
        <h2>+ Добавить запись</h2>
        <div className="subtitle">Все поля, необходимые для официального репорта</div>

        <label htmlFor="artist">Artist</label>
        <select id="artist" value={form.artist} onChange={(e) => setForm({ ...form, artist: e.target.value })}>
          {ARTISTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>

        <label htmlFor="reportType">Report Type</label>
        <select
          id="reportType"
          value={form.report_type}
          onChange={(e) => setForm({ ...form, report_type: e.target.value })}
        >
          {REPORT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="row">
          <div>
            <label htmlFor="titleField">Title</label>
            <input
              id="titleField"
              type="text"
              placeholder="Короткий заголовок кейса"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div style={{ maxWidth: 160 }}>
            <label htmlFor="platform">Platform</label>
            <select
              id="platform"
              value={form.platform}
              onChange={(e) => setForm({ ...form, platform: e.target.value })}
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label htmlFor="quoteText">Contents of Report</label>
        <textarea
          id="quoteText"
          placeholder="Текст оскорбления / описание"
          value={form.quote}
          onChange={(e) => setForm({ ...form, quote: e.target.value })}
        />

        <div className="row">
          <div>
            <label htmlFor="postAuthor">Subject to Report (автор поста)</label>
            <input
              id="postAuthor"
              type="text"
              placeholder="@username"
              value={form.post_author}
              onChange={(e) => setForm({ ...form, post_author: e.target.value })}
            />
          </div>
          <div style={{ maxWidth: 160 }}>
            <label htmlFor="postDate">Posting Date</label>
            <input
              id="postDate"
              type="date"
              value={form.post_date}
              onChange={(e) => setForm({ ...form, post_date: e.target.value })}
            />
          </div>
        </div>

        <div className="row">
          <div style={{ maxWidth: 160 }}>
            <label htmlFor="screenshotDate">Screenshot Date</label>
            <input
              id="screenshotDate"
              type="date"
              value={form.screenshot_date}
              onChange={(e) => setForm({ ...form, screenshot_date: e.target.value })}
            />
          </div>
        </div>

        <label htmlFor="tweetUrl">Post URL</label>
        <input
          id="tweetUrl"
          type="text"
          placeholder=""
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
        />

        <div className="row">
          <div style={{ maxWidth: 140 }}>
            <label htmlFor="lang">Язык</label>
            <select
              id="lang"
              value={form.lang}
              onChange={(e) => setForm({ ...form, lang: e.target.value })}
            >
              {LANGS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="note">
          Этот способ добавления — для ручного занесения кейсов без загрузки файлов.
          Скриншоты прикрепляются через публичную форму на главной странице.
        </div>

        <button onClick={handleAdd}>Добавить в журнал</button>
      </div>

      <div className="log-header">
        <h2>Записи</h2>
        <span className="count">
          {loading ? 'Загрузка…' : `${entries.length} ${entries.length === 1 ? 'запись' : 'записей'}`}
        </span>
      </div>

      <div className="actions-row">
        <select value={filterArtist} onChange={(e) => setFilterArtist(e.target.value)} className="filter-select">
          <option value="all">Все участники</option>
          {ARTISTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)} className="filter-select">
          <option value="all">Все языки</option>
          {LANGS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          <option value="all">Все статусы</option>
          <option value="open">Open</option>
          <option value="sent">Отправлено</option>
          <option value="archived">В архиве</option>
        </select>
        <button className="secondary small" onClick={handleExport}>
          Экспорт (копировать)
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          {loading ? 'Загрузка…' : 'Пока пусто. Добавь первую запись выше.'}
        </div>
      ) : (
        filtered.map((e) => {
          const originalIndex = entries.indexOf(e);
          return (
            <div key={e.id} className={`entry status-${e.status}`}>
              <div className="top-row">
                <div className="exhibit-no">EXHIBIT #{String(originalIndex + 1).padStart(2, '0')}</div>
                {e.report_count > 1 && (
                  <span className="tag report-count">🔥 {e.report_count} репортов</span>
                )}
                <select
                  className="status-select"
                  value={e.status}
                  onChange={(ev) => handleStatusChange(e.id, ev.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="sent">Отправлено</option>
                  <option value="archived">В архиве</option>
                </select>
              </div>
              <div className="artist-tag">{e.artist}</div>
              <div className="title-line">{e.title || '(без заголовка)'}</div>
              <div className="quote">&quot;{e.quote}&quot;</div>
              <div className="field-grid">
                <div>
                  <b>Platform:</b> {e.platform}
                </div>
                <div>
                  <b>Author:</b> {e.post_author || '—'}
                </div>
                <div>
                  <b>Date:</b> {e.post_date || '—'}
                </div>
                <div>
                  <b>Screenshot:</b> {e.screenshot_date || '—'}
                </div>
                <div className="link">
                  <b>URL:</b>{' '}
                  <a href={`https://${(e.url || '').replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer">
                    {e.url}
                  </a>
                </div>
              </div>
              {e.screenshot_urls && e.screenshot_urls.length > 0 && (
                <div className="file-list">
                  {e.screenshot_urls.map((u, idx) => (
                    <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="tag">
                      📎 файл {idx + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="meta">
                <span className="tag category">{e.report_type}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span className="tag">{e.lang}</span>
                  <button className="secondary small" onClick={() => handleDelete(e.id)}>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </div>
  );
}
