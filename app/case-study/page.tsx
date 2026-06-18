"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "@/lib/api";
import { SEVERITY, SEVERITY_ORDER, ZONE } from "@/lib/tokens";
import type { KpisResponse } from "@/lib/types";

const DASHBOARD_URL = "https://cv-alerts-frontend.vercel.app";
const API_URL = "https://cv-alerts-backend-1.onrender.com";

export default function CaseStudyPage() {
  const [kpis, setKpis] = useState<KpisResponse | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    api.kpis()
      .then((k) => { if (alive) { setKpis(k); setState("ready"); } })
      .catch(() => { if (alive) setState("error"); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="min-h-screen bg-ot-bg text-ot-text">
      {/* top bar */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-ot-border bg-ot-surface/90 px-5 py-3 backdrop-blur">
        <div className="flex h-7 w-7 items-center justify-center rounded bg-ot-accent/15 text-ot-accent">◑</div>
        <span className="text-sm font-semibold">Cyber Vision · Alert Console</span>
        <span className="text-ot-dim">/ case study</span>
        <Link href="/" className="ml-auto rounded-md border border-ot-line px-3 py-1 text-sm font-medium text-ot-accent hover:bg-ot-hover">
          ← Open the dashboard
        </Link>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <Header kpis={kpis} state={state} />
        <ArchitectureSection />
        <AlertsSection />
        <PurdueSection crossZone={kpis?.cross_zone_count ?? null} />
        <DecisionsSection />
        <FutureSection />
        <footer className="mt-20 border-t border-ot-border pt-6 text-center text-xs text-ot-dim">
          Cisco TPM (AI Builder) technical exercise · built as a backend proxy + alert engine in front of a
          Cyber Vision OT Center. Public demo runs on a frozen snapshot; full live mode runs locally.
        </footer>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- header */
function Header({ kpis, state }: { kpis: KpisResponse | null; state: string }) {
  return (
    <header className="mb-20">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ot-line px-3 py-1 text-xs text-ot-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-ot-accent" /> OT / ICS security · operations · vulnerability
      </div>
      <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-5xl">
        An alert experience for Cisco Cyber Vision
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ot-muted">
        Turning an OT network&apos;s live data into <strong className="text-ot-text">three actionable alerts</strong> an
        analyst can triage in seconds — pulled programmatically from the Cyber Vision Center, with the API
        credential <strong className="text-ot-text">never leaving the server</strong>.
      </p>

      <div className="mt-6 flex flex-wrap gap-3 text-sm">
        <a href={DASHBOARD_URL} target="_blank" rel="noreferrer"
          className="rounded-md bg-ot-accent/15 px-3 py-1.5 font-medium text-ot-accent hover:bg-ot-accent/25">
          ▶ Live dashboard
        </a>
        <a href={`${API_URL}/kpis`} target="_blank" rel="noreferrer"
          className="rounded-md border border-ot-line px-3 py-1.5 font-medium text-ot-muted hover:bg-ot-hover hover:text-ot-text">
          Live API ↗
        </a>
      </div>

      {/* live KPI headline */}
      <div className="mt-8 rounded-xl border border-ot-border bg-ot-surface p-5 shadow-panel">
        <div className="mb-3 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-ot-dim">
          <span className="h-1.5 w-1.5 rounded-full bg-[#34d399]" /> Live from the API
          {state === "ready" && kpis && (
            <span className="ml-1 rounded bg-ot-panel px-1.5 py-0.5 normal-case tracking-normal text-ot-muted">
              {kpis.data_source}
            </span>
          )}
        </div>
        {state === "loading" && <div className="h-16 animate-pulseSoft rounded bg-ot-panel" />}
        {state === "error" && (
          <p className="text-sm text-ot-muted">Live metrics are waking up (free-tier cold start, ~30–60s). The story below renders regardless.</p>
        )}
        {state === "ready" && kpis && (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Stat value={kpis.assets_monitored} label="assets monitored" />
            <div className="hidden h-12 w-px bg-ot-line sm:block" />
            <Stat value={kpis.active_alerts_total} label="active alerts" />
            <div className="min-w-[220px] flex-1">
              <SeverityBar kpis={kpis} />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="text-3xl font-semibold tabular-nums">{value}</div>
      <div className="text-xs text-ot-muted">{label}</div>
    </div>
  );
}

function SeverityBar({ kpis }: { kpis: KpisResponse }) {
  const sev = kpis.active_alerts_by_severity;
  const total = kpis.active_alerts_total || 1;
  return (
    <>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-ot-panel">
        {SEVERITY_ORDER.map((s) => sev[s] ? (
          <div key={s} style={{ width: `${(sev[s] / total) * 100}%`, backgroundColor: SEVERITY[s].hex }} title={`${SEVERITY[s].label}: ${sev[s]}`} />
        ) : null)}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {SEVERITY_ORDER.filter((s) => sev[s]).map((s) => (
          <span key={s} className="inline-flex items-center gap-1 text-[11px] text-ot-muted">
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SEVERITY[s].hex }} />
            {SEVERITY[s].label} <span className="font-mono text-ot-text">{sev[s]}</span>
          </span>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------ section scaffold */
function Section({ eyebrow, title, lede, children }: { eyebrow: string; title: string; lede?: string; children: React.ReactNode }) {
  return (
    <section className="mb-20">
      <div className="mb-6">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ot-accent">{eyebrow}</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        {lede && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ot-muted">{lede}</p>}
      </div>
      {children}
    </section>
  );
}

/* ------------------------------------------------------- architecture */
function ArchitectureSection() {
  const Box = ({ title, sub, tone }: { title: string; sub: string; tone: "client" | "ours" | "center" }) => {
    const ring = tone === "ours" ? "border-ot-accent/60" : "border-ot-border";
    return (
      <div className={`flex-1 rounded-xl border ${ring} bg-ot-surface p-4 text-center shadow-panel`}>
        <div className="text-sm font-semibold text-ot-text">{title}</div>
        <div className="mt-1 text-xs text-ot-muted">{sub}</div>
      </div>
    );
  };
  const Arrow = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center px-1 text-center md:px-2">
      <div className="text-lg text-ot-dim">→</div>
      <div className="text-[10px] leading-tight text-ot-dim">{label}</div>
    </div>
  );
  return (
    <Section eyebrow="Architecture" title="The browser never touches the Center"
      lede="A backend proxy sits between the dashboard and Cyber Vision. The CV API key lives only on the server — the single most important security decision in the project.">
      <div className="rounded-xl border border-ot-border bg-ot-panel/40 p-6">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
          <Box tone="client" title="Browser" sub="Next.js dashboard · Vercel" />
          <Arrow label="only our API" />
          <Box tone="ours" title="Backend proxy" sub="FastAPI alert engine · Render" />
          <Arrow label="x-token-id /api/3.0" />
          <Box tone="center" title="Cyber Vision Center" sub="OT/ICS network data" />
        </div>
        {/* token boundary */}
        <div className="mt-6 flex items-center gap-3 rounded-lg border border-dashed border-[#34d399]/50 bg-[#34d399]/5 px-4 py-3">
          <span className="text-lg">🔒</span>
          <div className="text-sm">
            <span className="font-semibold text-[#34d399]">API key stops here — never reaches the browser.</span>
            <span className="ml-1 text-ot-muted">
              The token is read server-side only, used solely inside the CV client, and never logged, returned, or bundled to the client.
            </span>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* -------------------------------------------------------- three alerts */
const ALERTS = [
  {
    cat: "operations", color: "#38bdf8", name: "Operations", title: "Asset went silent",
    trigger: "An asset that fell quiet while its subnet peers kept talking.",
    data: "/components lastActivity, grouped by /24 cell (the comms layer, since /flows is empty here).",
    rule: "Tiers by seconds behind the cell median; +1 severity level if the asset is a controller.",
    why: "A device going quiet while peers continue can mean a failed controller/sensor, a pulled cable, or an attacker silencing a device — all interrupt the physical process.",
    compliance: "NIST SP 800-82r3 · NERC CIP-007",
  },
  {
    cat: "security", color: "#f472b6", name: "Security", title: "Cross-zone / unauthorized comms",
    trigger: "Violations of an authored Purdue policy: skip-level traffic (field↔IT), cleartext/IT protocols on a controller, external conversations.",
    data: "/activities communication graph + app/policy/expected_state_policy.yaml.",
    rule: "Per rule; a Purdue skip of ≥2 levels ⇒ critical.",
    why: "CV exposed no native baselines/events here, so we authored the expected state. A field device reaching a site/IT host directly bypasses the control layer — a segmentation breach and lateral-movement path.",
    compliance: "NIST 800-82r3 · IEC 62443 · NERC CIP-005",
  },
  {
    cat: "custom", color: "#a78bfa", name: "Vulnerability (free choice)", title: "Vulnerable asset exposure",
    trigger: "Risk prioritization — every vulnerable asset here is already CVSS ≥ 9, so 'has a CVE' ranks nothing.",
    data: "/components/{id}/vulnerabilities joined to the comms graph by IP/MAC.",
    rule: "Exposure score (CVE severity × breadth × reachability × control-plane). Critical is gated: CVSS ≥ 9 AND cross-zone AND control-plane.",
    why: "Vulnerable + reachable + process-critical = the assets to remediate first; an exploit there directly disrupts operations.",
    compliance: "NERC CIP-007 · NIST 800-82r3",
  },
] as const;

function AlertsSection() {
  return (
    <Section eyebrow="The three alerts" title="One per axis of OT risk"
      lede="Availability, intrusion, and latent exposure — so the set tells a complete story, not three variations on one theme. Each alert carries auditable evidence, an OT rationale, a compliance mapping, and a recommended action.">
      <div className="grid gap-4 lg:grid-cols-3">
        {ALERTS.map((a) => (
          <div key={a.cat} className="flex flex-col rounded-xl border border-ot-border bg-ot-surface p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <span className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: a.color, backgroundColor: `${a.color}14`, border: `1px solid ${a.color}40` }}>{a.name}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{a.title}</h3>
            <dl className="mt-3 space-y-2 text-sm">
              <Field label="Trigger" value={a.trigger} />
              <Field label="Data source" value={a.data} mono />
              <Field label="Severity rule" value={a.rule} />
              <Field label="Why it matters (OT)" value={a.why} />
              <Field label="Compliance" value={a.compliance} />
            </dl>
            <Link href={`/?category=${a.cat}`}
              className="mt-4 inline-block self-start rounded-md border border-ot-line px-3 py-1.5 text-sm font-medium hover:bg-ot-hover"
              style={{ color: a.color }}>
              View live, filtered →
            </Link>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ot-dim">{label}</dt>
      <dd className={`mt-0.5 leading-relaxed text-ot-text/90 ${mono ? "font-mono text-xs" : ""}`}>{value}</dd>
    </div>
  );
}

/* -------------------------------------------------------- purdue model */
function PurdueSection({ crossZone }: { crossZone: number | null }) {
  const levels = [
    { key: "Level 3-4", note: "Site operations / IT — SCADA, historians, workstations" },
    { key: "Level 2", note: "Area control — PLCs, controllers, managed cell switches" },
    { key: "Level 0-1", note: "Field devices — sensors, drives, I/O modules" },
  ];
  return (
    <Section eyebrow="Why cross-zone matters" title="The Purdue model, and the violation we flag"
      lede="Traffic should cross only between adjacent layers, through the control-layer conduit. A field device talking straight to a site/IT host skips Level 2 — a classic zone-and-conduit breach.">
      <div className="grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-center">
        <div className="space-y-2">
          {levels.map((l, i) => (
            <div key={l.key}>
              <div className="flex items-center gap-3 rounded-lg border px-4 py-3"
                style={{ borderColor: `${ZONE[l.key].hex}55`, backgroundColor: `${ZONE[l.key].hex}12` }}>
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: ZONE[l.key].hex }} />
                <div>
                  <div className="text-sm font-semibold" style={{ color: ZONE[l.key].hex }}>{l.key}</div>
                  <div className="text-xs text-ot-muted">{l.note}</div>
                </div>
                {i < levels.length - 1 && <span className="ml-auto text-xs text-ot-dim">↕ allowed (adjacent)</span>}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-[#ef4444]/50 bg-[#ef4444]/5 px-4 py-2 text-xs text-[#ef4444]">
            ✕ Level 0-1 ↔ Level 3-4 directly — skips the control layer = violation
          </div>
        </div>
        <div className="rounded-xl border border-ot-border bg-ot-surface p-6 text-center shadow-panel">
          <div className="text-5xl font-semibold tabular-nums text-[#ef4444]">{crossZone ?? "—"}</div>
          <div className="mt-1 text-sm text-ot-muted">cross-zone violations detected<br />in this dataset, live</div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------- decision cards */
const DECISIONS = [
  {
    t: "Subnet-median silence baseline",
    p: "A naïve 'no traffic since the capture end' rule flagged 173 of 180 assets — the data is imported PCAPs where whole cells stop together.",
    d: "Flag an asset only when it went quiet relative to its own /24 cell's median last-seen — i.e. it fell silent while its peers kept talking.",
    tr: "Needs ≥3 peers to define a cell baseline; collapses 173 false positives to 5 genuine stragglers.",
  },
  {
    t: "The CVE↔asset id-space trap",
    p: "Joining vulnerable components to the comms graph by component id returned ZERO — Cyber Vision uses a different id space for inventory vs. graph endpoints.",
    d: "Join on IP/MAC instead, which are stable across both id spaces.",
    tr: "The difference between the custom alert firing on the right 15 assets versus silently firing on none.",
  },
  {
    t: "Snapshot vs. live (public safety)",
    p: "A public URL that serves live OT telemetry and holds an API token is exactly the leak this product is meant to prevent.",
    d: "Default DATA_MODE=snapshot on the public demo (frozen data, no Center call, no token); live mode is gated and server-side only.",
    tr: "The public URL shows frozen data, not a live Center call — but the data_source badge always tells the truth.",
  },
  {
    t: "Cytoscape strict-mode collapse",
    p: "The graph rendered all 120 nodes piled at one point. React strict-mode destroyed the first instance and the second skipped layout; the lazy tab also laid out into a zero-size container.",
    d: "Lay out on every fresh instance, defer via requestAnimationFrame until the container is sized, and add a ResizeObserver.",
    tr: "A few extra animation frames before first paint, for a layout that's correct every time.",
  },
];

function DecisionsSection() {
  return (
    <Section eyebrow="Problem-solving" title="The non-obvious calls"
      lede="The decisions you only reach by actually connecting to the data and running the code.">
      <div className="grid gap-4 md:grid-cols-2">
        {DECISIONS.map((d) => (
          <div key={d.t} className="rounded-xl border border-ot-border bg-ot-surface p-5 shadow-panel">
            <h3 className="text-base font-semibold">{d.t}</h3>
            <div className="mt-3 space-y-2 text-sm leading-relaxed">
              <p><span className="text-[11px] font-semibold uppercase tracking-wider text-[#f59e0b]">Problem </span><span className="text-ot-muted">{d.p}</span></p>
              <p><span className="text-[11px] font-semibold uppercase tracking-wider text-ot-accent">Decision </span><span className="text-ot-text/90">{d.d}</span></p>
              <p><span className="text-[11px] font-semibold uppercase tracking-wider text-ot-dim">Tradeoff </span><span className="text-ot-muted">{d.tr}</span></p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* --------------------------------------------------------- future work */
const FUTURE = [
  { t: "Streaming for true real-time", w: "Today is poll-based snapshots (matches the exercise and the imported-PCAP data). Real-time wants a push pipeline (CV syslog/MQTT → event store → WebSocket) — a different architecture, and the sandbox isn't a live stream. The detectors were written to port unchanged to a live clock." },
  { t: "Configurable thresholds UI", w: "The silence window, exposure weights, and the expected-state policy are file/parameter-driven. An in-app settings panel with per-zone overrides would let an analyst tune false-positive vs. missed-detection without editing YAML. Deferred as polish once detection was proven." },
  { t: "Alert acknowledgement workflow", w: "Alerts are stateless today. A real console needs ack / assign / resolve with an audit trail and a datastore — added persistence and auth scope beyond the core detect-and-visualize ask." },
];

function FutureSection() {
  return (
    <Section eyebrow="Honest scope" title="Beyond this build"
      lede="What a production version would add next, and why each was out of the time budget — partial-but-honest beats overclaiming.">
      <div className="space-y-3">
        {FUTURE.map((f) => (
          <div key={f.t} className="rounded-xl border border-ot-border bg-ot-surface p-4 shadow-panel">
            <h3 className="text-sm font-semibold text-ot-text">{f.t}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ot-muted">{f.w}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
