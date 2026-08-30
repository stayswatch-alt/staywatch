import React from 'react';
import SiteLayout from './components/SiteLayout.jsx';
import { SOCIALS } from './components/icons.jsx';


export default function LandingPage() {
  return (
    <SiteLayout active="home">
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">
            <span className="lp-eyebrow-star" aria-hidden="true">✦</span> One community.
            <br />
            One purpose.
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
          </div>
          <div className="lp-social">
            {SOCIALS.map((s) => (
              <a key={s.key} href={s.href} aria-label={s.key} className="lp-social-link">
                {s.node}
              </a>
            ))}
          </div>
        </div>

        <div className="lp-hero-art">
          <img src="/emblem-color.png" alt="Stay Watch emblem" className="lp-emblem" />
        </div>
      </section>

      {/* About — centered, replaces Mission */}
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

      {/* Latest News */}
      <section className="lp-news-section">
        <div className="lp-news-head">
          <h2>Latest News</h2>
        </div>
        <p className="lp-news-placeholder">Will be updated soon</p>
      </section>
    </SiteLayout>
  );
}
