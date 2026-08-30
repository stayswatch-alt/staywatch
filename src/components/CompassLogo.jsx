/** Stay Watch — compact faceted compass rose (matches hero emblem) */
const CREAM = 'currentColor';
const SHADOW = 'rgba(0, 0, 0, 0.45)';

const MAJOR = [0, 90, 180, 270];
const MINOR = [45, 135, 225, 315];

export default function CompassLogo({ size = 40, className = '', title = 'Stay Watch' }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={title}
    >
      <circle cx="50" cy="50" r="47" stroke="currentColor" strokeWidth="1.6" opacity="0.85" />
      <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.7" opacity="0.45" />

      {MINOR.map((deg) => (
        <g key={`min-${deg}`} transform={`rotate(${deg} 50 50)`}>
          <polygon points="50,27 45.5,48 50,50" fill={CREAM} />
          <polygon points="50,27 54.5,48 50,50" fill={SHADOW} />
        </g>
      ))}
      {MAJOR.map((deg) => (
        <g key={`maj-${deg}`} transform={`rotate(${deg} 50 50)`}>
          <polygon points="50,12 43,48 50,50" fill={CREAM} />
          <polygon points="50,12 57,48 50,50" fill={SHADOW} />
        </g>
      ))}

      <circle cx="50" cy="50" r="3.4" fill="#ef2d3a" />
    </svg>
  );
}
