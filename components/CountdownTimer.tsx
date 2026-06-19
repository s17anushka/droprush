"use client";
import { useEffect, useState } from "react";

function pad(n: number) { return String(n).padStart(2, "0"); }

export default function CountdownTimer({ startTime, onLive }: { startTime: string; onLive?: () => void }) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const calc = () => new Date(startTime).getTime() - Date.now();
    setDiff(calc());
    const interval = setInterval(() => {
      const r = calc();
      setDiff(r);
      if (r <= 0) { clearInterval(interval); onLive?.(); }
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, onLive]);

  if (diff === null) return null;
  if (diff <= 0) return <span className="font-mono pulse" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600 }}>LIVE NOW</span>;

  const s = Math.floor(diff / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  return (
    <span className="font-mono" style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
      starts in <span style={{ color: "var(--text)" }}>{h > 0 && `${pad(h)}:`}{pad(m)}:{pad(sec)}</span>
    </span>
  );
}