// Mirrors the backend Pydantic models (cv-alerts-backend/app/models.py) and endpoint envelopes
// (app/main.py). Keep in sync with that contract — this is the single typed boundary.

import type { Severity } from "./tokens";

export type Category = "security" | "operations" | "custom";
export type Status = "active" | "acknowledged" | "resolved";
export type DataSource = "live" | "snapshot";

export interface ReferenceNow {
  ms: number | null;
  iso: string | null;
  label: string;
}

// app/models.py :: Asset (as embedded in Alert.assets)
export interface Asset {
  id: string;
  name: string;
  ip: string | null;
  mac: string | null;
  ips: string[];
  macs: string[];
  vendor: string | null;
  zone: string; // Purdue level label or "unknown"
  purdue_rank: number | null;
  type: string;
  is_controller: boolean;
  last_seen_ms: number | null;
  first_seen_ms: number | null;
  vuln_count: number;
}

// /assets row (app/main.py :: assets())
export interface AssetRow {
  id: string;
  name: string;
  ip: string | null;
  mac: string | null;
  vendor: string | null;
  purdue_level: string;
  is_controller: boolean;
  last_activity_ms: number | null;
  cve_count: number;
  max_cvss: number;
}

// app/models.py :: Alert
export interface Alert {
  id: string;
  category: Category;
  title: string;
  severity: Severity;
  status: Status;
  detected_at: string;
  assets: Asset[];
  evidence: Record<string, unknown>;
  rationale: string;
  compliance_ref: string | null;
  recommended_action: string;
  score: number | null;
}

// app/graph.py output (Cytoscape elements)
export interface GraphNodeData {
  id: string;
  label?: string;
  ip?: string | null;
  purdue_level?: string;
  zone?: string;
  parent?: string;
  vendor?: string | null;
  is_controller?: boolean;
  has_alert?: boolean;
  alert_ids?: string[];
  alerts?: { id: string; category: Category; severity: Severity }[];
  max_severity?: Severity | null;
  is_zone?: boolean;
}
export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  protocols: string[];
  protocol: string;
  packets: number;
  bytes: number;
  has_alert?: boolean;
  alert_ids?: string[];
  max_severity?: Severity | null;
}
export interface GraphElement<T> {
  data: T;
}

// ---- endpoint envelopes -----------------------------------------------------
export interface KpisResponse {
  data_source: DataSource;
  reference_now: ReferenceNow;
  assets_monitored: number;
  active_alerts_total: number;
  active_alerts_by_severity: Record<Severity, number>;
  active_alerts_by_category: Record<Category, number>;
  silent_count: number;
  cross_zone_count: number;
  vulnerable_asset_count: number;
}

export interface AlertsResponse {
  data_source: DataSource;
  reference_now: ReferenceNow;
  count: number;
  filters: { category: Category | null; severity: Severity | null };
  alerts: Alert[];
}

export interface AssetsResponse {
  data_source: DataSource;
  reference_now: ReferenceNow;
  count: number;
  assets: AssetRow[];
}

export interface GraphResponse {
  data_source: DataSource;
  reference_now: ReferenceNow;
  node_count: number;
  edge_count: number;
  nodes: GraphElement<GraphNodeData>[];
  edges: GraphElement<GraphEdgeData>[];
}

export interface HealthResponse {
  status: string;
}
