"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Drop } from "@/lib/types";

type Tab = "drops" | "create";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("drops");
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDrops = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/drops");
      const data = await res.json();
      setDrops(data.drops || []);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDrops(); }, [fetchDrops]);

  const liveCount = drops.filter(d => new Date(d.startTime).getTime() <= Date.now() && d.remainingStock > 0).length;
  const totalClaimed = drops.reduce((s, d) => s + (d.totalStock - d.remainingStock), 0);
  const soldOut = drops.filter(d => d.remainingStock <= 0).length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{ borderBottom: "1px solid var(--hairline)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span className="font-display" style={{ fontSize: "1.1rem" }}>DROP<span style={{ color: "var(--accent)" }}>RUSH</span></span>
            <span style={{ fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", color: "var(--accent)", background: "var(--accent-dim)", padding: "3px 10px", borderRadius: 99, letterSpacing: "0.08em" }}>ADMIN</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/" style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "6px 14px", border: "1px solid var(--hairline)", borderRadius: 6, textDecoration: "none" }}>View store ↗</Link>
            <button onClick={() => setTab("create")} style={{ padding: "7px 18px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontSize: "0.8rem", cursor: "pointer", fontFamily: "'Archivo Black',sans-serif", letterSpacing: "0.04em" }}>+ NEW DROP</button>
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 28px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 36 }}>
          {[
            { label: "Total drops", value: drops.length, color: "var(--text)" },
            { label: "Live now", value: liveCount, color: "var(--accent)" },
            { label: "Units claimed", value: totalClaimed, color: "var(--success)" },
            { label: "Sold out", value: soldOut, color: "var(--text-muted)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 10, padding: "18px 20px" }}>
              <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontFamily: "'JetBrains Mono',monospace", color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const }}>{s.label}</p>
              <p className="font-display" style={{ margin: 0, fontSize: "2rem", color: s.color, lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 2, marginBottom: 28, borderBottom: "1px solid var(--hairline)" }}>
          {(["drops", "create"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px 22px", background: "none", border: "none", cursor: "pointer", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.72rem", letterSpacing: "0.08em", textTransform: "uppercase" as const, color: tab === t ? "var(--text)" : "var(--text-muted)", borderBottom: tab === t ? "2px solid var(--accent)" : "2px solid transparent", marginBottom: -1 }}>
              {t === "drops" ? "All Drops" : "Create Drop"}
            </button>
          ))}
        </div>
        {tab === "drops" && <DropsTable drops={drops} loading={loading} onRefresh={fetchDrops} />}
        {tab === "create" && <CreateForm onCreated={() => { fetchDrops(); setTab("drops"); }} />}
      </main>
    </div>
  );
}

function DropsTable({ drops, loading, onRefresh }: { drops: Drop[]; loading: boolean; onRefresh: () => void }) {
  if (loading) return <p className="font-mono" style={{ color: "var(--text-muted)" }}>Loading…</p>;
  if (!drops.length) return <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-muted)" }}><p className="font-display" style={{ fontSize: "1.4rem" }}>No drops yet.</p><p>Create one from the "Create Drop" tab.</p></div>;
  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={onRefresh} style={{ fontSize: "0.75rem", fontFamily: "'JetBrains Mono',monospace", color: "var(--text-muted)", background: "none", border: "1px solid var(--hairline)", borderRadius: 6, padding: "5px 14px", cursor: "pointer" }}>↻ Refresh</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--hairline)" }}>
              {["Product","Brand","Price","Stock","Claimed","Status","Start time"].map(h => (
                <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontFamily: "'JetBrains Mono',monospace", fontSize: "0.65rem", letterSpacing: "0.08em", color: "var(--text-muted)", fontWeight: 500, textTransform: "uppercase" as const, whiteSpace: "nowrap" as const }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {drops.map(drop => {
              const claimed = drop.totalStock - drop.remainingStock;
              const pct = Math.round((claimed / drop.totalStock) * 100);
              const isLive = new Date(drop.startTime).getTime() <= Date.now() && drop.remainingStock > 0;
              const isSoldOut = drop.remainingStock <= 0;
              const label = isSoldOut ? "SOLD OUT" : isLive ? "LIVE" : "UPCOMING";
              const col = isSoldOut ? "var(--text-muted)" : isLive ? "var(--accent)" : "var(--text-muted)";
              const bg = isSoldOut ? "var(--hairline)" : isLive ? "var(--accent-dim)" : "var(--surface-2)";
              return (
                <tr key={drop.dropId} style={{ borderBottom: "1px solid var(--hairline)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--surface)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "14px", fontWeight: 500 }}>{drop.name}</td>
                  <td style={{ padding: "14px", color: "var(--text-muted)" }}>{drop.brand}</td>
                  <td style={{ padding: "14px" }}>${drop.price.toLocaleString()}</td>
                  <td style={{ padding: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 64, height: 4, background: "var(--hairline)", borderRadius: 2 }}>
                        <div style={{ width: `${Math.max(0,(drop.remainingStock/drop.totalStock)*100)}%`, height: "100%", background: isSoldOut ? "var(--hairline)" : isLive ? "var(--accent)" : "var(--success)", borderRadius: 2 }} />
                      </div>
                      <span className="font-mono" style={{ fontSize: "0.78rem" }}>{drop.remainingStock}/{drop.totalStock}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px" }}><span className="font-mono" style={{ fontSize: "0.78rem", color: claimed > 0 ? "var(--success)" : "var(--text-muted)" }}>{claimed} ({pct}%)</span></td>
                  <td style={{ padding: "14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, fontSize: "0.65rem", fontFamily: "'JetBrains Mono',monospace", letterSpacing: "0.08em", background: bg, color: col }}>
                      {isLive && <span className="pulse" style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "var(--accent)" }} />}
                      {label}
                    </span>
                  </td>
                  <td style={{ padding: "14px", color: "var(--text-muted)", fontSize: "0.78rem", fontFamily: "'JetBrains Mono',monospace", whiteSpace: "nowrap" as const }}>{new Date(drop.startTime).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CreateForm({ onCreated }: { onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", brand: "", description: "", price: "", imageUrl: "", totalStock: "", startTime: "" });
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [msg, setMsg] = useState("");
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  async function submit() {
    if (!form.name || !form.brand || !form.totalStock || !form.startTime) { setMsg("Sab required fields bharo."); return; }
    setStatus("loading"); setMsg("");
    try {
      const res = await fetch("/api/admin/drops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.name, brand: form.brand, description: form.description, price: parseFloat(form.price)||0, imageUrl: form.imageUrl, totalStock: parseInt(form.totalStock,10), startTime: new Date(form.startTime).toISOString() }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error); }
      setStatus("success"); setMsg("Drop created!");
      setTimeout(() => onCreated(), 1200);
    } catch (e: any) { setMsg(e.message||"Error"); setStatus("error"); }
  }

  const inp: React.CSSProperties = { width: "100%", background: "var(--surface-2)", border: "1px solid var(--hairline)", borderRadius: 8, padding: "10px 13px", color: "var(--text)", fontSize: "0.9rem", outline: "none", fontFamily: "inherit" };
  const pw = parseInt(form.totalStock,10)||0;
  const pp = parseFloat(form.price)||0;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 14, padding: "28px 32px", display: "flex", flexDirection: "column", gap: 18 }}>
        <p className="font-mono" style={{ margin: 0, fontSize: "0.68rem", color: "var(--text-muted)", letterSpacing: "0.1em" }}>DROP DETAILS</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <F label="Product name *"><input style={inp} placeholder="Air Max 2099" value={form.name} onChange={e=>u("name",e.target.value)} /></F>
          <F label="Brand *"><input style={inp} placeholder="Nike" value={form.brand} onChange={e=>u("brand",e.target.value)} /></F>
        </div>
        <F label="Description"><textarea style={{ ...inp, minHeight: 80, resize: "vertical" }} placeholder="Limited colorway." value={form.description} onChange={e=>u("description",e.target.value)} /></F>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <F label="Price (USD)"><input style={inp} type="number" placeholder="180" value={form.price} onChange={e=>u("price",e.target.value)} /></F>
          <F label="Total stock *"><input style={inp} type="number" placeholder="50" value={form.totalStock} onChange={e=>u("totalStock",e.target.value)} /></F>
        </div>
        <F label="Image URL"><input style={inp} placeholder="https://…" value={form.imageUrl} onChange={e=>u("imageUrl",e.target.value)} /></F>
        <F label="Drop start time *"><input style={inp} type="datetime-local" value={form.startTime} onChange={e=>u("startTime",e.target.value)} /></F>
        {msg && <p className="font-mono" style={{ margin:0, fontSize:"0.82rem", color: status==="success"?"var(--success)":"var(--accent)" }}>{status==="success"?"✓ ":"⚠ "}{msg}</p>}
        <button onClick={submit} disabled={status==="loading"||status==="success"} style={{ padding:"13px", borderRadius:8, border:"none", background: status==="success"?"var(--success-dim)":status==="loading"?"var(--accent-dim)":"var(--accent)", color: status==="success"?"var(--success)":"#fff", cursor:"pointer", fontFamily:"'Archivo Black',sans-serif", fontSize:"0.95rem", letterSpacing:"0.04em" }}>
          {status==="loading"?"CREATING…":status==="success"?"✓ CREATED":"PUBLISH DROP"}
        </button>
      </div>
      <div style={{ position: "sticky", top: 80 }}>
        <p className="font-mono" style={{ fontSize:"0.68rem", color:"var(--text-muted)", letterSpacing:"0.1em", marginBottom:12 }}>LIVE PREVIEW</p>
        <div style={{ background:"var(--surface)", border:"1px solid var(--hairline)", borderRadius:12, padding:"22px 24px", display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>{form.brand||"Brand"}</span>
            <span style={{ fontSize:"0.62rem", fontFamily:"'JetBrains Mono',monospace", padding:"2px 8px", borderRadius:99, background:"var(--surface-2)", color:"var(--text-muted)" }}>UPCOMING</span>
          </div>
          <h3 className="font-display" style={{ margin:0, fontSize:"1.3rem", color: form.name?"var(--text)":"var(--text-muted)" }}>{form.name||"Product name"}</h3>
          {form.description && <p style={{ margin:0, fontSize:"0.82rem", color:"var(--text-muted)", lineHeight:1.6 }}>{form.description}</p>}
          <span className="font-display" style={{ fontSize:"1.1rem" }}>{pp>0?`$${pp.toLocaleString()}`:"$—"}</span>
          <div style={{ height:1, background:"var(--hairline)" }} />
          <div>
            <p className="font-mono" style={{ fontSize:"0.62rem", color:"var(--text-muted)", letterSpacing:"0.1em", margin:"0 0 8px" }}>INVENTORY</p>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
              <span className="font-mono" style={{ fontSize:"1.4rem", fontWeight:600 }}>{pw||"—"}</span>
              <span className="font-mono" style={{ fontSize:"0.72rem", color:"var(--text-muted)" }}>/ {pw} left</span>
            </div>
            <div style={{ height:4, borderRadius:2, background:"var(--hairline)" }}>
              <div style={{ width: pw>0?"100%":"0%", height:"100%", background:"var(--success)", borderRadius:2 }} />
            </div>
          </div>
          <div style={{ padding:"11px", borderRadius:8, background:"var(--hairline)", color:"var(--text-muted)", fontFamily:"'Archivo Black',sans-serif", fontSize:"0.85rem", letterSpacing:"0.04em", textAlign:"center" as const }}>DROP NOT LIVE YET</div>
        </div>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:"0.68rem", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase" as const, color:"var(--text-muted)", fontFamily:"'JetBrains Mono',monospace" }}>{label}</label>
      {children}
    </div>
  );
}