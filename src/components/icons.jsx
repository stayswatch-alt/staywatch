export function IconTwitter() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
      <path d="M3 3 h4.5 l4 5.5 L16.5 3 H21 l-6.8 8.2 L21.5 21 H17 l-4.4-6 L7 21 H2.5 l7.2-8.7 Z" fill="currentColor" />
    </svg>
  );
}
export function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="17" cy="7" r="1.1" fill="currentColor" />
    </svg>
  );
}
export function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 9.5 L15.5 12 L10 14.5 Z" fill="currentColor" />
    </svg>
  );
}
export function IconChat() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" width="18" height="18">
      <path d="M4 5 h16 v10 h-9 l-5 4 v-4 H4 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export const SOCIALS = [
  // Add real profile URLs when ready, e.g. { key: 'x', node: <IconTwitter />, href: 'https://x.com/...' },
].filter((s) => s.href && s.href !== '#');
