import Link from "next/link";

export default function Header() {
  return (
    <header style={{ borderBottom: "1px solid var(--hairline)", background: "var(--bg)", position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span className="font-display" style={{ fontSize: "1.25rem" }}>DROP<span style={{ color: "var(--accent)" }}>RUSH</span></span>
        </Link>
      </div>
    </header>
  );
}