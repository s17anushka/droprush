"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Drop } from "@/lib/types";
import CountdownTimer from "./CountdownTimer";
import StockBar from "./StockBar";

export default function DropCard({ drop: init }: { drop: Drop }) {
  const [drop, setDrop] = useState(init);
  const [isLive, setIsLive] = useState<boolean | null>(null);

  useEffect(() => { setIsLive(new Date(init.startTime).getTime() <= Date.now()); }, [init.startTime]);

  const soldOut = drop.remainingStock <= 0;
  const pill = soldOut ? { label: "SOLD OUT", bg: "var(--hairline)", color: "var(--text-muted)" }
    : isLive ? { label: "LIVE", bg: "var(--accent-dim)", color: "var(--accent)" }
    : { label: "UPCOMING", bg: "var(--surface-2)", color: "var(--text-muted)" };

  return (
    <Link href={`/drops/${drop.dropId}`} style={{ textDecoration: "none", display: "block" }}>
      <article style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12, padding: "24px 28px", display: "grid", gridTemplateColumns: "1fr auto", gap: "16px 32px", alignItems: "start", cursor: "pointer" }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--text-muted)")}
        onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--hairline)")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontWeight: 500 }}>{drop.brand}</span>
            {isLive !== null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: 99, fontSize: "0.7rem", fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, letterSpacing: "0.08em", background: pill.bg, color: pill.color }}>
                {isLive && !soldOut && <span className="pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent)", display: "inline-block" }} />}
                {pill.label}
              </span>
            )}
          </div>
          <h2 className="font-display" style={{ margin: 0, fontSize: "clamp(1.2rem,2.5vw,1.6rem)", lineHeight: 1.1 }}>{drop.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span className="font-display" style={{ fontSize: "1.25rem" }}>${drop.price.toLocaleString()}</span>
            <CountdownTimer startTime={drop.startTime} onLive={() => setIsLive(true)} />
          </div>
        </div>
        <div style={{ minWidth: 140 }}>
          <StockBar remaining={drop.remainingStock} total={drop.totalStock} />
        </div>
      </article>
    </Link>
  );
}