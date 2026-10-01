export function LoginAvatar({ look = 0, covered = false }: { look?: number; covered?: boolean }) {
  const shift = Math.max(-6, Math.min(8, look));
  return (
    <svg className={covered ? "login-avatar covered" : "login-avatar"} viewBox="0 0 200 200" role="img" aria-label="Kirish belgisi">
      <circle cx="100" cy="100" r="96" fill="#a9ddf3" />
      <path d="M38 150c8 28 32 42 62 42s54-14 62-42v-8H38z" fill="#fff" stroke="#3a5e77" strokeWidth="3" />
      <circle cx="47" cy="104" r="13" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="3" />
      <circle cx="153" cy="104" r="13" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="3" />
      <path d="M58 78c6-28 24-42 42-42s36 14 42 42v34c0 22-16 38-42 38s-42-16-42-38z" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="3" />
      <path d="M70 70c8-16 18-24 30-24 8 8 14 18 16 30" fill="#fff" stroke="#3a5e77" strokeWidth="3" strokeLinecap="round" />
      <g transform={`translate(${shift} 0)`}>
        <circle cx="82" cy="108" r="5" fill="#3a5e77" />
        <circle cx="118" cy="108" r="5" fill="#3a5e77" />
        <circle cx="80.5" cy="106" r="1.6" fill="#fff" />
        <circle cx="116.5" cy="106" r="1.6" fill="#fff" />
      </g>
      <path d="M97 118h6c2 0 3 2 2 4l-2 4c-1 1.4-3 1.4-4 0l-2-4c-1-2 0-4 2-4z" fill="#3a5e77" />
      <path d="M88 132c8 7 16 7 24 0" fill="none" stroke="#617e92" strokeWidth="3" strokeLinecap="round" />
      <g className="login-arms">
        <rect x="58" y="156" width="40" height="24" rx="12" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="3" />
        <rect x="102" y="156" width="40" height="24" rx="12" fill="#ddf1fa" stroke="#3a5e77" strokeWidth="3" />
      </g>
    </svg>
  );
}
