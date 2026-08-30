import React, { useEffect, useState } from 'react';
import CompassLogo from './CompassLogo.jsx';
import { SOCIALS } from './icons.jsx';
import '../landing.css';

const NAV = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'about', label: 'About', href: '/#about' },
  { key: 'reports', label: 'Reports', href: '/report' },
];

export default function SiteLayout({ active, children }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="lp" id="top">
      <header className={`lp-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a className="lp-brand" href="/">
          <CompassLogo size={34} className="lp-brand-mark" />
          <span className="lp-brand-name">Stay Watch</span>
        </a>
        <nav className="lp-menu">
          {NAV.map((n) => (
            <a key={n.key} href={n.href} className={active === n.key ? 'is-active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="lp-join" href="/report">
          Join Stay <span aria-hidden="true">✦</span>
        </a>
      </header>

      {children}

      <footer className="lp-footer" id="contact">
        <div className="lp-footer-top">
          <div className="lp-footer-brand">
            <CompassLogo size={40} className="lp-brand-mark" />
            <div>
              <div className="lp-footer-name">Stay Watch</div>
              <div className="lp-footer-tag">Stay always protects Stray Kids</div>
            </div>
          </div>

          <nav className="lp-footer-col">
            <a href="/">Home</a>
            <a href="/#about">About</a>
            <a href="/report">Reports</a>
          </nav>

          <nav className="lp-footer-col">
            <a href="/report">Reports</a>
            <a href="/admin">Moderators</a>
          </nav>

          <div className="lp-footer-social">
            <span className="lp-footer-social-title">Follow us</span>
            <div className="lp-social">
              {SOCIALS.map((s) => (
                <a key={s.key} href={s.href} aria-label={s.key} className="lp-social-link">
                  {s.node}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="lp-footer-bottom">
          <span className="lp-star" aria-hidden="true">✦</span> We watch, so they can shine.
        </div>
      </footer>
    </div>
  );
}
