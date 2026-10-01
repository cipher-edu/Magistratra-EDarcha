import type { CountRow, StackRow } from "@/lib/stats";

const PALETTE = ["#9b6dff", "#7aa2ff", "#1ed760", "#ffb020", "#ff5c5c", "#ff7a45", "#5ad7ff", "#d6c3ff"];
const STATUS_COLOR: Record<string, string> = {
  DRAFT: "#9aa3b8",
  SUBMITTED: "#ffb020",
  IN_REVIEW: "#7aa2ff",
  REVISION: "#ff7a45",
  APPROVED: "#1ed760",
  REJECTED: "#ff5c5c",
};

function Empty({ text }: { text: string }) {
  return <p className="chart-empty">{text}</p>;
}

export function ColumnChart({ rows, label }: { rows: CountRow[]; label: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const width = 640;
  const height = 220;
  const pad = 24;
  const gap = 10;
  const inner = width - pad * 2;
  const bar = rows.length ? (inner - gap * (rows.length - 1)) / rows.length : inner;
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line x1={pad} y1={height - 36} x2={width - pad} y2={height - 36} stroke="#2c3348" />
      {rows.map((row, index) => {
        const h = row.value === 0 ? 0 : Math.max(6, ((height - 64) * row.value) / max);
        const x = pad + index * (bar + gap);
        const y = height - 36 - h;
        return (
          <g key={row.key}>
            <rect x={x} y={y} width={bar} height={h} rx={8} fill={STATUS_COLOR[row.key] ?? PALETTE[index % PALETTE.length]} />
            <text x={x + bar / 2} y={y - 6} textAnchor="middle" fill="#e8eaf3" fontSize="12" fontWeight="700">
              {row.value}
            </text>
            <text x={x + bar / 2} y={height - 16} textAnchor="middle" fill="#a3abbd" fontSize="11">
              {row.label.length > 12 ? `${row.label.slice(0, 11)}…` : row.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function LineChart({ rows, label }: { rows: CountRow[]; label: string }) {
  const max = Math.max(1, ...rows.map((row) => row.value));
  const width = 640;
  const height = 220;
  const padX = 28;
  const padY = 24;
  const step = rows.length > 1 ? (width - padX * 2) / (rows.length - 1) : 0;
  const points = rows.map((row, index) => {
    const x = padX + index * step;
    const y = height - 36 - ((height - 70) * row.value) / max;
    return { ...row, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = points.length
    ? `M ${points[0].x} ${height - 36} ${points.map((point) => `L ${point.x} ${point.y}`).join(" ")} L ${points[points.length - 1].x} ${height - 36} Z`
    : "";
  return (
    <svg className="chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <line x1={padX} y1={height - 36} x2={width - padX} y2={height - 36} stroke="#2c3348" />
      {area ? <path d={area} fill="rgba(155, 109, 255, 0.18)" /> : null}
      {line ? <polyline points={line} fill="none" stroke="#9b6dff" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" /> : null}
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4.5" fill="#12151c" stroke="#9b6dff" strokeWidth="2.5" />
          <text x={point.x} y={point.y - 10} textAnchor="middle" fill="#e8eaf3" fontSize="12" fontWeight="700">
            {point.value}
          </text>
          <text x={point.x} y={height - 14} textAnchor="middle" fill="#a3abbd" fontSize="11">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function HBarChart({ rows, active, label }: { rows: CountRow[]; active?: string; label: string }) {
  if (!rows.length) return <Empty text="Bu kesimda talaba yo‘q." />;
  const max = Math.max(1, ...rows.map((row) => row.value));
  return (
    <div className="hbars" role="img" aria-label={label}>
      {rows.map((row, index) => (
        <div key={row.key} className={row.key === active ? "hbar on" : "hbar"}>
          <span>{row.label}</span>
          <i>
            <b style={{ width: `${(row.value / max) * 100}%`, background: PALETTE[index % PALETTE.length] }} />
          </i>
          <strong>{row.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ rows, label }: { rows: CountRow[]; label: string }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);
  if (!total) return <Empty text="Shu davrda qaror yo‘q." />;
  const radius = 54;
  const circ = 2 * Math.PI * radius;
  let offset = 0;
  const colors = ["#1ed760", "#ffb020", "#ff5c5c"];
  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 160 160" role="img" aria-label={label}>
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#2c3348" strokeWidth="16" />
        {rows.map((row, index) => {
          const length = (row.value / total) * circ;
          const dash = `${length} ${circ - length}`;
          const node = (
            <circle
              key={row.key}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={colors[index % colors.length]}
              strokeWidth="16"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              transform="rotate(-90 80 80)"
            />
          );
          offset += length;
          return node;
        })}
        <text x="80" y="76" textAnchor="middle" fill="#e8eaf3" fontSize="22" fontWeight="700">
          {total}
        </text>
        <text x="80" y="96" textAnchor="middle" fill="#a3abbd" fontSize="11">
          qaror
        </text>
      </svg>
      <ul>
        {rows.map((row, index) => (
          <li key={row.key}>
            <i style={{ background: colors[index % colors.length] }} />
            {row.label}
            <strong>{row.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StackChart({ rows, label }: { rows: StackRow[]; label: string }) {
  if (!rows.length) return <Empty text="Shu davrda hujjat yo‘q." />;
  const max = Math.max(1, ...rows.map((row) => row.parts.reduce((sum, part) => sum + part.value, 0)));
  return (
    <div className="stacks" role="img" aria-label={label}>
      {rows.map((row) => {
        const total = row.parts.reduce((sum, part) => sum + part.value, 0);
        return (
          <div key={row.key} className="stack-row">
            <span>{row.key}</span>
            <i>
              {row.parts.map((part) =>
                part.value ? (
                  <b key={part.status} style={{ width: `${(part.value / max) * 100}%`, background: STATUS_COLOR[part.status] }} title={part.status} />
                ) : null,
              )}
            </i>
            <strong>{total}</strong>
          </div>
        );
      })}
    </div>
  );
}
