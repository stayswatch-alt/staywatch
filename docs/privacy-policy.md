# Stay Watch Privacy Policy

*Last updated: September 1, 2026*

Stay Watch is an independent STAY-run initiative. We document cases of harassment, defamation, and harmful content targeting Stray Kids and compile verified evidence for submission to JYPE. This policy explains what data we collect through the report form, how we use and store it, and who can access it.

**Website:** [stay-watch-seven.vercel.app](https://stay-watch-seven.vercel.app)

---

## 1. Who we are

Stay Watch is **not** affiliated with, endorsed by, or operated by JYPE or Stray Kids. We are a community protection and reporting platform run by STAY volunteers.

For privacy-related requests, contact us at: **stayswatch@gmail.com**

---

## 2. What data we collect

When you submit a report via **Submit a Report**, we may collect:

### Information about the incident
- Target member or group (e.g. Stray Kids, individual member)
- Report type (e.g. defamation, harassment, threats)
- Platform where the content appeared
- Posting date and screenshot date (if provided)
- Post URL
- Description / quoted content
- Language of the content
- Optional internal case title
- Optional post author username or handle (if you enter it)
- Up to **3 image files** (screenshots or other evidence), max **8 MB** each

### Information we do **not** collect from reporters
The public form does **not** ask for your name, email, phone number, or social media accounts. Reports are **anonymous by default** unless you voluntarily include identifying information inside the description or screenshots.

### Information about third parties
Reports may contain usernames, quotes, links, or images relating to **other people** (e.g. alleged harassers). You should only submit content you believe is necessary for documentation and review. Do not submit unrelated private information about third parties.

### Technical data
Our hosting and database providers may automatically process:
- Timestamp of submission
- IP address and basic request metadata (for security, spam prevention, and abuse protection)

We do not use advertising trackers or sell data to analytics or ad networks.

---

## 3. Why we use this data

We use report data only to:
- Review and moderate submissions by the Stay Watch moderator team
- Verify and categorize incidents
- Compile confirmed cases into dossiers for **submission to JYPE**
- Display **aggregated, non-identifying statistics** on the homepage (e.g. total reports, counts by status, and a limited recent-activity list showing report ID, type, platform, time submitted, and status — **not** full descriptions or reporter identity)

We do **not** use your data for advertising or marketing.

---

## 4. Where and how data is stored

| Data | Service | Location / notes |
|------|---------|------------------|
| Report records (text fields, URLs, metadata) | [Supabase](https://supabase.com) (PostgreSQL) | Encrypted in transit (HTTPS). Row Level Security (RLS) limits direct database access to authenticated moderators. |
| Uploaded screenshots | [Cloudinary](https://cloudinary.com) | Images are uploaded via an unsigned preset and stored on Cloudinary’s CDN. Each file gets a public HTTPS URL saved in the report record. |
| Public website | [Vercel](https://vercel.com) | Static site hosting; may process standard server logs. |

Moderator access to the admin panel is protected by individual login credentials (Supabase Auth).

---

## 5. Who has access

| Party | Access |
|-------|--------|
| **Stay Watch moderators** | Full access to submitted reports and evidence for review, status updates, and export. |
| **JYPE / authorized agency representatives** | Compiled dossiers with verified cases only — not raw unreviewed submissions shared indiscriminately. |
| **General public** | Aggregated stats and limited recent-report summary on the homepage (no reporter identity). |
| **Third-party advertisers / data brokers** | **No access.** We do not sell or share data for advertising. |

We may disclose information if required by applicable law or to protect the safety of Stray Kids, STAY, or others in good faith.

---

## 6. How long we keep data

- Reports and evidence are retained while a case is **open, under review, or part of an active dossier**.
- After a case is **archived or submitted to JYPE**, we keep materials for up to **24 months** for possible follow-up, audit, or duplicate detection, unless earlier deletion is requested or required by law.
- Moderators may delete individual reports and associated files when appropriate (e.g. duplicates, spam, or valid deletion requests).

---

## 7. Your rights

Depending on your location, you may have the right to:
- Ask what data relates to a report you submitted (if you can reasonably identify it, e.g. by URL and date)
- Request correction or deletion of a report **before** it is included in a dossier submitted to JYPE
- Object to certain processing where applicable law provides that right

Because reports are anonymous, we may not be able to verify a request without enough detail to locate the submission (e.g. exact post URL and approximate submission time).

**Contact:** stayswatch@gmail.com

We aim to respond within **30 days**.

---

## 8. Children and minors

Stay Watch is intended for STAY who can understand the purpose of reporting harmful content. We do not knowingly collect personal data from children under **13**. If you are under 16, we encourage you to involve a parent or guardian before submitting a report.

If you believe a child has submitted personal data to us, contact **stayswatch@gmail.com** and we will take steps to delete it where appropriate.

---

## 9. International users

Stay Watch is used by STAY worldwide. Data may be processed in countries where Supabase and Vercel operate (including the United States and the European Union). By submitting a report, you understand that your data may be transferred to and stored in those jurisdictions with appropriate safeguards via our providers’ terms and security practices.

---

## 10. Security

We use industry-standard measures including HTTPS, database access controls (RLS), and restricted moderator accounts. No online system is 100% secure; please do not submit more personal information than necessary.

---

## 11. Changes to this policy

We may update this policy as the project evolves. The **Last updated** date at the top will change when we do. Continued use of the report form after updates constitutes acceptance of the revised policy.

---

## 12. Contact

**Stay Watch — privacy & data requests**  
Email: **stayswatch@gmail.com**

---

*Stay Watch is an independent STAY initiative. Stray Kids and JYPE are trademarks of their respective owners. This project is not official.*
