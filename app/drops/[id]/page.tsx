"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Drop } from "@/lib/types";
import Header from "@/components/Header";
import CountdownTimer from "@/components/CountdownTimer";
import StockBar from "@/components/StockBar";
import ClaimButton from "@/components/ClaimButton";

export default function DropPage() {
  const { id } = useParams<{ id: string }>();
  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchDrop = useCallback(async () => {
    try {
      const res = await fetch(`/api/drops/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setDrop(data.drop);
      setIsLive(new Date(data.drop.startTime).getTime() <= Date.now());
    } catch { } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchDrop(); }, [fetchDrop]);
  useEffect(() => {
    if (!drop) return;
    const t = setInterval(fetchDrop, 2000);
    return () => clearInterval(t);
  }, [drop, fetchDrop]);

  if (loading) return <><Header /><main style={{ maxWidth: 680, margin: "80px auto", padding: "0 24px" }}><p className="font-mono" style={{ color: "var(--text-muted)" }}>Loading…</p></main></>;
  if (!drop) return <><Header /><main style={{ maxWidth: 680, margin: "80px auto", padding: "0 24px", textAlign: "center" }}><p style={{ color: "var(--text-muted)" }}>Drop not found.</p><Link href="/" style={{ color: "var(--accent)" }}>← Back</Link></main></>;

  const soldOut = drop.remainingStock <= 0;

  return (
    <>
      <Header />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 80px" }}>
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-muted)", fontSize: "0.85rem", textDecoration: "none", marginBottom: 36 }}>← All drops</Link>
        <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 16, padding: "36px", display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" as const, letterSpacing: "0.04em" }}>{drop.brand}</span>
            <span className="font-mono" style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.1em", color: soldOut ? "var(--text-muted)" : isLive ? "var(--accent)" : "var(--text-muted)" }}>
              {soldOut ? "SOLD OUT" : isLive ? "● LIVE" : "UPCOMING"}
            </span>
          </div>
          <h1 className="font-display" style={{ margin: 0, fontSize: "clamp(1.8rem,4vw,2.8rem)", lineHeight: 1.05 }}>{drop.name}</h1>
          {drop.description && <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: 1.65 }}>{drop.description}</p>}
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <span className="font-display" style={{ fontSize: "2rem", lineHeight: 1 }}>${drop.price.toLocaleString()}</span>
            <CountdownTimer startTime={drop.startTime} onLive={() => setIsLive(true)} />
          </div>
          <div style={{ height: 1, background: "var(--hairline)" }} />
          <div>
            <p className="font-mono" style={{ fontSize: "0.7rem", color: "var(--text-muted)", letterSpacing: "0.1em", marginBottom: 12 }}>INVENTORY — live</p>
            <StockBar remaining={drop.remainingStock} total={drop.totalStock} />
          </div>
          <ClaimButton dropId={drop.dropId} isLive={isLive} isSoldOut={soldOut} onClaimed={r => setDrop(p => p ? { ...p, remainingStock: r } : p)} />
          <p className="font-mono" style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
            Stock decremented via atomic DynamoDB <span style={{ color: "var(--text)" }}>UpdateItem</span> with <span style={{ color: "var(--text)" }}>ConditionExpression: remainingStock &gt; 0</span>
          </p>
        </div>
      </main>
    </>
  );
}