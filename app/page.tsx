"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import type { Category } from "@/lib/types";
import { AlertsPanel } from "@/components/AlertsPanel";
import { KpiStrip } from "@/components/KpiStrip";
import { ReportsTable } from "@/components/ReportsTable";
import { StatusBar } from "@/components/StatusBar";
import { Trends } from "@/components/Trends";
import { DashboardSkeleton, ErrorState, WakingState } from "@/components/states";
import { useDashboardData } from "@/lib/useDashboardData";

// Cytoscape touches the DOM/window — load it client-only.
const GraphCanvas = dynamic(() => import("@/components/GraphCanvas").then((m) => m.GraphCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulseSoft rounded-lg border border-ot-border bg-ot-surface" />,
});

type Tab = "alerts" | "graph" | "reports" | "trends";
const TABS: { id: Tab; label: string }[] = [
  { id: "alerts", label: "Alerts" },
  { id: "graph", label: "Communication graph" },
  { id: "reports", label: "Report" },
  { id: "trends", label: "Trends" },
];

// useSearchParams() needs a Suspense boundary for static prerender.
export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-screen flex-col overflow-hidden"><Header /><DashboardSkeleton /></div>}>
      <Dashboard />
    </Suspense>
  );
}

const DEEP_LINK_CATEGORIES = ["security", "operations", "custom"];

function Dashboard() {
  const params = useSearchParams();
  const catParam = params.get("category");
  const initialCategory: Category | "all" =
    catParam && DEEP_LINK_CATEGORIES.includes(catParam) ? (catParam as Category) : "all";

  const { data, status, error, lastUpdated, refresh } = useDashboardData();
  const [tab, setTab] = useState<Tab>("alerts");
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const didAutoSelect = useRef(false);

  // auto-select the top alert ONCE on first load (so "clear" can later stick to null)
  useEffect(() => {
    if (!didAutoSelect.current && data && data.alerts.length) {
      didAutoSelect.current = true;
      setSelectedAlertId(data.alerts[0].id);
    }
  }, [data]);

  const showInGraph = (id: string) => { setSelectedAlertId(id); setTab("graph"); };

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header />

      {status === "loading" && <DashboardSkeleton />}
      {status === "waking" && <WakingState attemptHint="this can take up to a minute on the free tier" />}
      {status === "error" && !data && <ErrorState message={error ?? "unknown error"} onRetry={refresh} />}

      {data && (
        <>
          <StatusBar
            dataSource={data.dataSource}
            referenceNow={data.referenceNow}
            lastUpdated={lastUpdated}
            stale={status === "ready" && !!error}
            onRefresh={refresh}
          />
          <KpiStrip kpis={data.kpis} />

          <nav className="no-print flex gap-1 border-b border-ot-border px-5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  tab === t.id ? "text-ot-text" : "text-ot-muted hover:text-ot-text"
                }`}
              >
                {t.label}
                {tab === t.id && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded bg-ot-accent" />}
              </button>
            ))}
            <Link
              href="/case-study"
              className="ml-auto self-center rounded-md border border-ot-line px-3 py-1 text-sm font-medium text-ot-accent hover:bg-ot-hover"
            >
              Case study ↗
            </Link>
          </nav>

          <main className="min-h-0 flex-1 overflow-auto p-5">
            {tab === "alerts" && (
              <div className="h-full">
                <AlertsPanel
                  alerts={data.alerts}
                  selectedId={selectedAlertId}
                  onSelect={setSelectedAlertId}
                  onShowInGraph={showInGraph}
                  initialCategory={initialCategory}
                />
              </div>
            )}
            {tab === "graph" && (
              <div className="h-full">
                <GraphCanvas graph={data.graph} selectedAlertId={selectedAlertId} onPickAlert={setSelectedAlertId} />
              </div>
            )}
            {tab === "reports" && <div className="h-full"><ReportsTable alerts={data.alerts} /></div>}
            {tab === "trends" && <Trends kpis={data.kpis} />}
          </main>
        </>
      )}
    </div>
  );
}

function Header() {
  return (
    <header className="flex items-center gap-3 border-b border-ot-border bg-ot-surface px-5 py-3">
      <div className="flex h-7 w-7 items-center justify-center rounded bg-ot-accent/15 text-ot-accent">◑</div>
      <div>
        <h1 className="text-sm font-semibold leading-tight text-ot-text">Cyber Vision · Alert Console</h1>
        <p className="text-[11px] leading-tight text-ot-muted">OT/ICS monitoring — security · operations · vulnerability exposure</p>
      </div>
    </header>
  );
}
