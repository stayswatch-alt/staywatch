import React, { useState, useEffect, useRef } from 'react';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function parseValue(val) {
  if (!val) return null;
  const [y, m, d] = val.split('-').map(Number);
  return { year: y, month: m - 1, day: d };
}

function toValue(year, month, day) {
  return `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export function todayLocalISO() {
  const d = new Date();
  return toValue(d.getFullYear(), d.getMonth(), d.getDate());
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function startDow(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function DatePicker({ value, onChange, id, max }) {
  const today     = new Date();
  const parsed    = parseValue(value);
  const [open, setOpen]   = useState(false);
  const [view, setView]   = useState({
    year:  parsed?.year  ?? today.getFullYear(),
    month: parsed?.month ?? today.getMonth(),
  });
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const prevMonth = () => setView(v => {
    const m = v.month === 0 ? 11 : v.month - 1;
    const y = v.month === 0 ? v.year - 1 : v.year;
    return { year: y, month: m };
  });
  const nextMonth = () => setView(v => {
    const m = v.month === 11 ? 0 : v.month + 1;
    const y = v.month === 11 ? v.year + 1 : v.year;
    return { year: y, month: m };
  });

  const selectDay = (day) => {
    const val = toValue(view.year, view.month, day);
    onChange({ target: { value: val } });
    setOpen(false);
  };

  const maxDate  = max ? parseValue(max) : null;
  const isDisabled = (day) => {
    if (!maxDate) return false;
    const { year: my, month: mm, day: md } = maxDate;
    if (view.year > my) return true;
    if (view.year === my && view.month > mm) return true;
    if (view.year === my && view.month === mm && day > md) return true;
    return false;
  };

  const total  = daysInMonth(view.year, view.month);
  const offset = startDow(view.year, view.month);
  const cells  = Array.from({ length: offset + total }, (_, i) =>
    i < offset ? null : i - offset + 1
  );

  const displayValue = parsed
    ? `${MONTHS[parsed.month]} ${parsed.day}, ${parsed.year}`
    : '';

  return (
    <div className="dp-root" ref={ref} id={id}>
      <div className={`dp-trigger rp-input ${open ? 'is-open' : ''}`}
           onClick={() => setOpen(o => !o)}>
        <span className={displayValue ? '' : 'dp-placeholder'}>
          {displayValue || 'Select date'}
        </span>
        <svg className="dp-caret" viewBox="0 0 12 8" fill="none" width="10" height="10" aria-hidden="true">
          <path d="M1 1.5 L6 6.5 L11 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </div>

      {open && (
        <div className="dp-popup">
          <div className="dp-header">
            <button className="dp-nav" onClick={prevMonth} aria-label="Previous month">‹</button>
            <span className="dp-month-label">{MONTHS[view.month]} {view.year}</span>
            <button className="dp-nav" onClick={nextMonth} aria-label="Next month">›</button>
          </div>

          <div className="dp-grid">
            {DAYS.map(d => (
              <span key={d} className="dp-dow">{d}</span>
            ))}
            {cells.map((day, i) => {
              if (!day) return <span key={`e-${i}`} />;
              const disabled = isDisabled(day);
              const selected = parsed && parsed.year === view.year &&
                               parsed.month === view.month && parsed.day === day;
              const isToday  = today.getFullYear() === view.year &&
                               today.getMonth()    === view.month &&
                               today.getDate()     === day;
              return (
                <button
                  key={day}
                  className={`dp-day ${selected ? 'is-selected' : ''} ${isToday && !selected ? 'is-today' : ''} ${disabled ? 'is-disabled' : ''}`}
                  onClick={() => !disabled && selectDay(day)}
                  disabled={disabled}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
