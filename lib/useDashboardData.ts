"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ApiError, api } from "./api";
import type { Alert, DataSource, GraphResponse, KpisResponse, ReferenceNow } from "./types";

export type LoadStatus = "loading" | "waking" | "ready" | "error";

export interface DashboardData {
  kpis: KpisResponse;
  alerts: Alert[];
  graph: GraphResponse;
  dataSource: DataSource;
  referenceNow: ReferenceNow;
}

const POLL_MS = 20_000;
// Render free tier cold-starts in ~30–60s; back off while we wait for it to wake.
const WAKE_BACKOFF = [1500, 3000, 6000, 10_000, 15_000];
const MAX_WAKE_ATTEMPTS = 10;

function isColdStart(e: unknown): boolean {
  return e instanceof ApiError && (e.status === 0 || e.status === 502 || e.status === 503 || e.status === 504);
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const wakeAttempts = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);

  const fetchAll = useCallback(async (signal: AbortSignal): Promise<DashboardData> => {
    const [kpis, alertsRes, graph] = await Promise.all([
      api.kpis(signal), api.alerts({}, signal), api.graph(signal),
    ]);
    return {
      kpis, alerts: alertsRes.alerts, graph,
      dataSource: kpis.data_source, referenceNow: kpis.reference_now,
    };
  }, []);

  const tick = useCallback(async (initial: boolean) => {
    const ctrl = new AbortController();
    try {
      const next = await fetchAll(ctrl.signal);
      if (!mounted.current) return;
      wakeAttempts.current = 0;
      setData(next);
      setStatus("ready");
      setError(null);
      setLastUpdated(Date.now());
      timer.current = setTimeout(() => tick(false), POLL_MS);
    } catch (e) {
      if (!mounted.current) return;
      const msg = e instanceof Error ? e.message : String(e);
      if (isColdStart(e) && wakeAttempts.current < MAX_WAKE_ATTEMPTS) {
        // backend likely asleep/starting — show "waking" and retry with backoff
        const delay = WAKE_BACKOFF[Math.min(wakeAttempts.current, WAKE_BACKOFF.length - 1)];
        wakeAttempts.current += 1;
        if (!data) setStatus("waking");
        setError(msg);
        timer.current = setTimeout(() => tick(initial), delay);
      } else if (data) {
        // transient failure but we have prior data — keep showing it, flag the staleness
        setError(msg);
        timer.current = setTimeout(() => tick(false), POLL_MS);
      } else {
        setStatus("error");
        setError(msg);
      }
    }
  }, [data, fetchAll]);

  const refresh = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    wakeAttempts.current = 0;
    if (!data) setStatus("loading");
    void tick(true);
  }, [data, tick]);

  useEffect(() => {
    mounted.current = true;
    void tick(true);
    return () => {
      mounted.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, status, error, lastUpdated, refresh };
}
