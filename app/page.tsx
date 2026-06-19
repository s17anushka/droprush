"use client";
import { useState, useEffect, useCallback } from "react";
import { Drop } from "@/lib/types";
import Header from "@/components/Header";
import DropCard from "@/components/DropCard";

export default function HomePage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchDrops = useCallback(async () => {
    try {
      const res = await fetch("/api/drops");
      const data = await res.json();
      setDrops(data.drops || []);
    } catch { setError("Could not connect to database."); }
  }, []);

  useEffect(() => { fetchDrops(); }, [fetchDrops]);

  const live = drops.filter(d => new Date(d.startTime).getTime() <= Date.now() && d.remainingStock > 0);
  const upcoming = drops.filter(d => new Date(d.startTime).getTime() > Date.now());
  const ended = drops.filter(d => d.remainingStock <= 0);

  return (
    <>
      <Header />
      <main style={{ maxWidth: 860, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ marginBottom: 48 }}>
          <p className="font-mono" style={{ fontSize: "0.75rem", color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Flash drops · atomic inventory</p>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", lineHeight: 1.0, margin: "0 0 16px" }}>
            Limited items.<br /><span style={{ color: "var(--accent)" }}>Zero oversells.</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1rem", maxWidth: 500, lineHeight: 1.6 }}>
            Every claim is a single atomic write. When stock hits zero, it stops — for everyone, simultaneously.
          </p>
        </div>
        {error && <div style={{ padding: "16px 20px", borderRadius: 8, border: "1px solid var(--accent)", background: "var(--accent-dim)", color: "var(--accent)", marginBottom: 32, fontFamily: "'JetBrains Mono',monospace" }}>{error}</div>}
        {live.length > 0 && <Section label="Live Now" accent drops={live} />}
        {upcoming.length > 0 && <Section label="Upcoming" drops={upcoming} />}
        {ended.length > 0 && <Section label="Ended" drops={ended} />}
        {drops.length === 0 && !error && (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-muted)" }}>
            <p className="font-display" style={{ fontSize: "1.5rem", marginBottom: 8 }}>No drops yet.</p>
          </div>
        )}
      </main>
    </>
  );
}

function Section({ label, drops, accent }: { label: string; drops: Drop[]; accent?: boolean }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span className="font-mono" style={{ fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: accent ? "var(--accent)" : "var(--text-muted)" }}>{label}</span>
        <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {drops.map(d => <DropCard key={d.dropId} drop={d} />)}
      </div>
    </section>
  );
}