"use client";
import { useState } from "react";
import { getUserId } from "@/lib/user";

type State = "idle" | "loading" | "success" | "sold_out" | "duplicate" | "error";

export default function ClaimButton({ dropId, isLive, isSoldOut, onClaimed }: { dropId: string; isLive: boolean; isSoldOut: boolean; onClaimed: (r: number) => void }) {
  const [state, setState] = useState<State>(isSoldOut ? "sold_out" : "idle");
  const [message, setMessage] = useState("");

  async function handleClaim() {
    if (state !== "idle" && state !== "error") return;
    setState("loading");
    try {
      const res = await fetch(`/api/drops/${dropId}/claim`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: getUserId() }),
      });
      const data = await res.json();
      if (data.success) {
        setState("success");
        onClaimed(data.remainingStock ?? 0);
      } else if (data.message?.includes("already")) {
        setState("duplicate");
        setMessage("Already claimed by you.");
      } else if (res.status === 409) {
        // Genuine sold-out (conditional check failed on DynamoDB)
        setState("sold_out");
        setMessage(data.message || "Sold out.");
      } else {
        // Backend error (500, misconfigured DB, etc.) — don't show "SOLD OUT"
        setState("error");
        setMessage(data.message || "Something went wrong. Tap to retry.");
      }
    } catch (e: any) { 
  console.log("CLAIM ERROR:", e.message);
  setState("error"); 
}
  }

  const base: React.CSSProperties = { padding: "14px 28px", borderRadius: 8, fontFamily: "'Archivo Black',sans-serif", fontSize: "1rem", letterSpacing: "0.04em", border: "none", cursor: "pointer", width: "100%" };

  if (!isLive || state === "sold_out" || isSoldOut) return (
    <button disabled style={{ ...base, background: "var(--hairline)", color: "var(--text-muted)", cursor: "not-allowed" }}>
      {isSoldOut || state === "sold_out" ? "SOLD OUT" : "DROP NOT LIVE YET"}
    </button>
  );
  if (state === "success") return <div style={{ ...base, background: "var(--success-dim)", border: "1px solid var(--success)", color: "var(--success)", textAlign: "center" as const }}>✓ CLAIMED</div>;
  if (state === "duplicate") return <div style={{ ...base, background: "var(--surface-2)", color: "var(--text-muted)", textAlign: "center" as const, fontSize: "0.85rem" }}>{message}</div>;
  if (state === "error") return (
    <button onClick={handleClaim} style={{ ...base, background: "var(--accent)", color: "#fff", opacity: 0.85 }}>
      ↺ RETRY — {message}
    </button>
  );

  return (
    <button onClick={handleClaim} disabled={state === "loading"} style={{ ...base, background: state === "loading" ? "var(--accent-dim)" : "var(--accent)", color: "#fff", opacity: state === "loading" ? 0.8 : 1 }}>
      {state === "loading" ? "CLAIMING…" : "CLAIM NOW"}
    </button>
  );
}