import React from 'react';
import SiteLayout from './components/SiteLayout.jsx';

function Section({ n, title, children }) {
  return (
    <section className="pp-section">
      <h2 className="pp-h2"><span className="pp-num">{n}</span> {title}</h2>
      {children}
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <SiteLayout active="privacy">
      <article className="pp">
        <header className="pp-head">
          <p className="lp-eyebrow">
            <span className="lp-eyebrow-star" aria-hidden="true">✦</span> Legal
          </p>
          <h1 className="pp-title">Privacy Policy</h1>
          <p className="pp-updated">Last updated: September 1, 2026</p>
          <p className="pp-lead">
            Stay Watch is an independent STAY-run initiative. We document cases of harassment,
            defamation, and harmful content targeting Stray Kids and compile
            verified evidence for submission to JYPE. This policy explains what data we
            collect through the report form, how we use and store it, and who can access it.
          </p>
        </header>

        <div className="pp-body">
          <Section n="1" title="Who we are">
            <p>
              Stay Watch is <strong>not</strong> affiliated with, endorsed by, or operated by JYPE
              or Stray Kids. We are a community protection and reporting platform run by STAY volunteers.
            </p>
            <p>
              Privacy requests:{' '}
              <a className="pp-link" href="mailto:stayswatch@gmail.com">stayswatch@gmail.com</a>
            </p>
          </Section>

          <Section n="2" title="What data we collect">
            <p>When you submit a report via <strong>Submit a Report</strong>, we may collect:</p>
            <h3 className="pp-h3">Information about the incident</h3>
            <ul className="pp-list">
              <li>Target member or group (e.g. Stray Kids, individual member)</li>
              <li>Report type (e.g. defamation, harassment, threats)</li>
              <li>Platform where the content appeared</li>
              <li>Posting date and screenshot date (if provided)</li>
              <li>Post URL</li>
              <li>Description / quoted content</li>
              <li>Language of the content</li>
              <li>Optional internal case title</li>
              <li>Optional post author username or handle (if you enter it)</li>
              <li>Up to <strong>3 image files</strong> (screenshots or other evidence), max <strong>8 MB</strong> each</li>
            </ul>
            <h3 className="pp-h3">Information we do not collect from reporters</h3>
            <p>
              The public form does <strong>not</strong> ask for your name, email, phone number, or social
              media accounts. Reports are <strong>anonymous by default</strong> unless you voluntarily
              include identifying information inside the description or screenshots.
            </p>
            <h3 className="pp-h3">Information about third parties</h3>
            <p>
              Reports may contain usernames, quotes, links, or images relating to other people.
              You should only submit content you believe is necessary for documentation and review.
            </p>
            <h3 className="pp-h3">Technical data</h3>
            <p>
              Our hosting and database providers may automatically process timestamps, IP addresses,
              and basic request metadata for security, spam prevention, and abuse protection.
              We do not use advertising trackers or sell data to analytics or ad networks.
            </p>
          </Section>

          <Section n="3" title="Why we use this data">
            <p>We use report data only to:</p>
            <ul className="pp-list">
              <li>Review and moderate submissions by the Stay Watch moderator team</li>
              <li>Verify and categorize incidents</li>
              <li>Compile confirmed cases into dossiers for submission to JYPE</li>
              <li>
                Display aggregated, non-identifying statistics on the homepage (report ID, type,
                platform, time submitted, and status — not full descriptions or reporter identity)
              </li>
            </ul>
            <p>We do <strong>not</strong> use your data for advertising or marketing.</p>
          </Section>

          <Section n="4" title="Where and how data is stored">
            <div className="pp-table-wrap">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Service</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Report records (text fields, URLs, metadata)</td>
                    <td>Supabase (PostgreSQL)</td>
                    <td>Encrypted in transit (HTTPS). RLS limits direct database access to authenticated moderators.</td>
                  </tr>
                  <tr>
                    <td>Screenshots</td>
                    <td>Cloudinary</td>
                    <td>CDN-hosted images; public URL per file</td>
                  </tr>
                  <tr>
                    <td>Public website</td>
                    <td>Vercel</td>
                    <td>Static site hosting; may process standard server logs.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>Moderator access to the admin panel is protected by individual login credentials (Supabase Auth).</p>
          </Section>

          <Section n="5" title="Who has access">
            <div className="pp-table-wrap">
              <table className="pp-table">
                <thead>
                  <tr>
                    <th>Party</th>
                    <th>Access</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Stay Watch moderators</td>
                    <td>Full access to submitted reports and evidence for review, status updates, and export.</td>
                  </tr>
                  <tr>
                    <td>JYPE / authorized agency representatives</td>
                    <td>Compiled dossiers with verified cases only — not raw unreviewed submissions.</td>
                  </tr>
                  <tr>
                    <td>General public</td>
                    <td>Aggregated stats and limited recent-report summary on the homepage.</td>
                  </tr>
                  <tr>
                    <td>Third-party advertisers / data brokers</td>
                    <td><strong>No access.</strong> We do not sell or share data for advertising.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              We may disclose information if required by applicable law or to protect the safety of
              Stray Kids, STAY, or others in good faith.
            </p>
          </Section>

          <Section n="6" title="How long we keep data">
            <ul className="pp-list">
              <li>Reports and evidence are retained while a case is open, under review, or part of an active dossier.</li>
              <li>After a case is archived or submitted to JYPE, we keep materials for up to <strong>24 months</strong> for follow-up, audit, or duplicate detection, unless earlier deletion is requested or required by law.</li>
              <li>Moderators may delete individual reports and associated files when appropriate (e.g. duplicates, spam, or valid deletion requests).</li>
            </ul>
          </Section>

          <Section n="7" title="Your rights">
            <p>Depending on your location, you may have the right to:</p>
            <ul className="pp-list">
              <li>Ask what data relates to a report you submitted (if you can reasonably identify it)</li>
              <li>Request correction or deletion of a report before it is included in a dossier submitted to JYPE</li>
              <li>Object to certain processing where applicable law provides that right</li>
            </ul>
            <p>
              Because reports are anonymous, we may not be able to verify a request without enough detail
              to locate the submission (e.g. exact post URL and approximate submission time).
            </p>
            <p>
              Contact: <a className="pp-link" href="mailto:stayswatch@gmail.com">stayswatch@gmail.com</a>.
              We aim to respond within <strong>30 days</strong>.
            </p>
          </Section>

          <Section n="8" title="Children and minors">
            <p>
              Stay Watch is intended for STAY who can understand the purpose of reporting harmful content.
              We do not knowingly collect personal data from children under <strong>13</strong>.
              If you are under 16, we encourage you to involve a parent or guardian before submitting a report.
            </p>
            <p>
              If you believe a child has submitted personal data to us, contact{' '}
              <a className="pp-link" href="mailto:stayswatch@gmail.com">stayswatch@gmail.com</a> and we
              will take steps to delete it where appropriate.
            </p>
          </Section>

          <Section n="9" title="International users">
            <p>
              Stay Watch is used by STAY worldwide. Data may be processed in countries where Supabase and
              Vercel operate (including the United States and the European Union). By submitting a report,
              you understand that your data may be transferred to and stored in those jurisdictions with
              appropriate safeguards via our providers&apos; terms and security practices.
            </p>
          </Section>

          <Section n="10" title="Security">
            <p>
              We use industry-standard measures including HTTPS, database access controls (RLS), and
              restricted moderator accounts. No online system is 100% secure; please do not submit more
              personal information than necessary.
            </p>
          </Section>

          <Section n="11" title="Changes to this policy">
            <p>
              We may update this policy as the project evolves. The date at the top will change when we do.
              Continued use of the report form after updates constitutes acceptance of the revised policy.
            </p>
          </Section>

          <Section n="12" title="Contact">
            <p><strong>Stay Watch — privacy &amp; data requests</strong></p>
            <p>
              Email: <a className="pp-link" href="mailto:stayswatch@gmail.com">stayswatch@gmail.com</a>
            </p>
          </Section>

          <p className="pp-disclaimer">
            Stay Watch is an independent STAY initiative. Stray Kids and JYPE are trademarks of their
            respective owners. This project is not affiliated with JYPE or Stray Kids.
          </p>
        </div>
      </article>
    </SiteLayout>
  );
}
