"use client";
export default function StockBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? Math.max(0, (remaining / total) * 100) : 0;
  const isCritical = pct <= 20;
  const isSoldOut = remaining <= 0;
  const barColor = isSoldOut ? "var(--hairline)" : isCritical ? "var(--accent)" : "var(--success)";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span className="font-mono" style={{ fontSize: "1.5rem", fontWeight: 600, color: isSoldOut ? "var(--text-muted)" : isCritical ? "var(--accent)" : "var(--text)", lineHeight: 1 }}>
          {isSoldOut ? "—" : remaining}
        </span>
        <span className="font-mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>/ {total} left</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "var(--hairline)", overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: barColor, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
      {isCritical && !isSoldOut && <span className="font-mono pulse" style={{ fontSize: "0.7rem", color: "var(--accent)", fontWeight: 600 }}>ALMOST GONE</span>}
      {isSoldOut && <span className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>SOLD OUT</span>}
    </div>
  );
}