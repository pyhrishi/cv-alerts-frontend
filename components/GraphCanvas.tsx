"use client";

import cytoscape from "cytoscape";
import fcose from "cytoscape-fcose";
import { useEffect, useMemo, useRef, useState } from "react";

import { SEVERITY, SEVERITY_ORDER, ZONE, severityColor, zoneColor } from "@/lib/tokens";
import type { GraphResponse } from "@/lib/types";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  cytoscape.use(fcose);
  registered = true;
}

const SEV_SIZE: Record<string, number> = { critical: 34, high: 28, medium: 24, low: 20, info: 18 };

interface Tip { x: number; y: number; lines: string[] }

export function GraphCanvas({
  graph, selectedAlertId, onPickAlert,
}: {
  graph: GraphResponse;
  selectedAlertId: string | null;
  onPickAlert?: (id: string | null) => void;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const roRef = useRef<ResizeObserver | null>(null);
  const sigRef = useRef<string>("");
  const pickRef = useRef(onPickAlert);
  pickRef.current = onPickAlert;
  const [tip, setTip] = useState<Tip | null>(null);

  const elements = useMemo(() => {
    const nodes = graph.nodes.map((n) => {
      const d = n.data;
      if (d.is_zone) {
        return { data: { id: d.id, label: d.label, isZone: true } };
      }
      return {
        data: {
          id: d.id,
          label: d.label ?? d.ip ?? d.id,
          parent: d.parent,
          bg: zoneColor(d.zone),
          border: d.has_alert ? severityColor(d.max_severity) : "#2a3543",
          bw: d.has_alert ? 3 : 1,
          size: d.max_severity ? SEV_SIZE[d.max_severity] : 18,
          alertIds: d.alert_ids ?? [],
          ip: d.ip ?? "",
          zone: d.zone ?? "unknown",
          vendor: d.vendor ?? "",
          controller: d.is_controller ? "yes" : "no",
          nAlerts: (d.alert_ids ?? []).length,
        },
      };
    });
    const edges = graph.edges.map((e) => ({
      data: {
        id: e.data.id,
        source: e.data.source,
        target: e.data.target,
        ecolor: e.data.has_alert ? severityColor(e.data.max_severity) : "#33414f",
        width: e.data.has_alert ? 2.2 : 1,
        alertIds: e.data.alert_ids ?? [],
        protocol: e.data.protocol,
        packets: e.data.packets,
        bytes: e.data.bytes,
      },
    }));
    return [...nodes, ...edges];
  }, [graph]);

  // build / relayout only when the topology (id set) changes; otherwise update data in place
  useEffect(() => {
    if (!boxRef.current) return;
    const sig = elements.map((e) => e.data.id).join("|");
    const created = !cyRef.current;
    const structureChanged = sig !== sigRef.current;

    if (!cyRef.current) {
      cyRef.current = cytoscape({
        container: boxRef.current,
        elements,
        wheelSensitivity: 0.2,
        minZoom: 0.15,
        maxZoom: 2,
        style: [
          { selector: "node[!isZone]", style: {
            "background-color": "data(bg)", "border-color": "data(border)", "border-width": "data(bw)",
            width: "data(size)", height: "data(size)", label: "data(label)",
            color: "#c9d4e0", "font-size": 7, "text-valign": "bottom", "text-margin-y": 3,
            "text-max-width": "90px", "text-wrap": "ellipsis", "min-zoomed-font-size": 7,
          } },
          { selector: "node:parent", style: {
            "background-opacity": 0.06, "background-color": "#7c8aa0", "border-color": "#2a3543",
            "border-width": 1, label: "data(label)", color: "#8b97a7", "font-size": 11,
            "font-weight": 600, "text-valign": "top", "text-halign": "center", "text-margin-y": -4,
            "padding": 18, shape: "round-rectangle",
          } },
          { selector: "edge", style: {
            "line-color": "data(ecolor)", width: "data(width)", "curve-style": "haystack",
            "haystack-radius": 0.4, opacity: 0.7,
          } },
          { selector: ".faded", style: { opacity: 0.08, "text-opacity": 0 } },
          { selector: "node.match", style: { "border-width": 4, "border-color": "#ffffff" } },
          { selector: "edge.match", style: { width: 3.2, opacity: 1 } },
        ] as cytoscape.StylesheetStyle[],
        layout: { name: "preset" },
      });

      const cy = cyRef.current;
      const showTip = (evt: cytoscape.EventObject, lines: string[]) => {
        const r = boxRef.current!.getBoundingClientRect();
        setTip({ x: evt.renderedPosition?.x ?? 0, y: evt.renderedPosition?.y ?? 0, lines });
        void r;
      };
      cy.on("mouseover", "node[!isZone]", (e) => {
        const d = e.target.data();
        showTip(e, [d.label, d.ip ? `IP ${d.ip}` : "", `Zone: ${d.zone}`,
          d.vendor ? `Vendor: ${d.vendor}` : "", d.controller === "yes" ? "Controller" : "",
          d.nAlerts ? `${d.nAlerts} alert(s)` : "no alerts"].filter(Boolean));
      });
      cy.on("mouseover", "edge", (e) => {
        const d = e.target.data();
        showTip(e, [`${d.protocol || "flow"}`, `${d.packets} pkts · ${d.bytes} bytes`]);
      });
      cy.on("mouseout", () => setTip(null));
      cy.on("pan zoom", () => setTip(null));
      // click a node -> select its first alert; click empty background -> clear highlight
      cy.on("tap", "node[!isZone]", (e) => {
        const ids = e.target.data("alertIds") as string[] | undefined;
        if (ids && ids.length) pickRef.current?.(ids[0]);
      });
      cy.on("tap", (e) => { if (e.target === cy) pickRef.current?.(null); });
      // keep the canvas correctly sized when the window/panel resizes
      const ro = new ResizeObserver(() => { if (!cy.destroyed()) cy.resize(); });
      if (boxRef.current) ro.observe(boxRef.current);
      roRef.current = ro;
    } else if (structureChanged) {
      cyRef.current.json({ elements });
    } else {
      // same topology — refresh alert-related data so highlight stays correct after a poll
      const cy = cyRef.current;
      cy.batch(() => {
        for (const el of elements) {
          const ele = cy.getElementById(el.data.id);
          if (ele.nonempty()) ele.data(el.data);
        }
      });
    }

    if (created || structureChanged) {
      // Lay out on a fresh cy too (React strict-mode remounts destroy+recreate the instance, and
      // the second instance must still be laid out — gating on structureChanged alone skips it).
      sigRef.current = sig;
      const cy = cyRef.current;
      // The graph tab mounts lazily; if we lay out before the container has real height, fcose
      // collapses every node to (0,0). Wait (via rAF) until the container is sized, then run.
      const layoutWhenSized = (tries = 0) => {
        if (!cy || cy.destroyed()) return;
        const c = boxRef.current;
        if (c && c.clientWidth > 10 && c.clientHeight > 10) {
          cy.resize();
          cy.layout({
            name: "fcose", quality: "proof", animate: false, randomize: true,
            nodeSeparation: 110, idealEdgeLength: 80, nodeRepulsion: 12000,
            gravity: 0.25, gravityCompound: 1.0, packComponents: true, tile: true, padding: 24,
          } as cytoscape.LayoutOptions).run();
          cy.fit(undefined, 30);
        } else if (tries < 40) {
          requestAnimationFrame(() => layoutWhenSized(tries + 1));
        }
      };
      requestAnimationFrame(() => layoutWhenSized());
    }
  }, [elements]);

  // alert highlight
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.elements().removeClass("match faded");
      if (!selectedAlertId) return;
      const match = cy.elements().filter((ele) => {
        const ids = ele.data("alertIds") as string[] | undefined;
        return Array.isArray(ids) && ids.includes(selectedAlertId);
      });
      if (match.empty()) return;
      cy.elements("node[!isZone], edge").addClass("faded");
      match.removeClass("faded").addClass("match");
      // keep matched nodes' endpoints + zone parents visible
      match.connectedNodes().removeClass("faded");
      match.nodes().parents().removeClass("faded");
    });
    if (selectedAlertId) {
      const match = cy.elements().filter((ele) =>
        Boolean((ele.data("alertIds") as string[] | undefined)?.includes(selectedAlertId)),
      );
      if (match.nonempty()) {
        // fit to the matched elements PLUS their immediate neighbourhood so context stays visible;
        // maxZoom (set at init) prevents over-zooming when only a couple of nodes match.
        const focus = match.union(match.connectedNodes());
        cy.animate({ fit: { eles: focus, padding: 60 }, duration: 350 });
      }
    } else {
      cy.animate({ fit: { eles: cy.elements(), padding: 30 }, duration: 350 }); // cleared -> full topology
    }
  }, [selectedAlertId, graph]);

  useEffect(() => () => {
    roRef.current?.disconnect(); roRef.current = null;
    cyRef.current?.destroy(); cyRef.current = null;
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-ot-border bg-ot-surface">
      <div ref={boxRef} className="h-full w-full" />
      <Legend />
      {selectedAlertId && (
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-md border border-ot-line bg-ot-bg/90 px-2.5 py-1 text-[11px] text-ot-accent shadow-panel">
          <span>Highlighting selected alert</span>
          <button
            onClick={() => pickRef.current?.(null)}
            className="rounded border border-ot-line px-1.5 py-0.5 font-medium text-ot-muted hover:bg-ot-hover hover:text-ot-text"
          >
            Clear · show full topology
          </button>
        </div>
      )}
      {tip && (
        <div
          className="pointer-events-none absolute z-10 max-w-[220px] rounded-md border border-ot-line bg-ot-bg/95 px-2 py-1 text-[11px] text-ot-text shadow-panel"
          style={{ left: tip.x + 12, top: tip.y + 12 }}
        >
          {tip.lines.map((l, i) => (
            <div key={i} className={i === 0 ? "font-medium" : "text-ot-muted"}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-3 right-3 space-y-2 rounded-md border border-ot-border bg-ot-bg/90 p-2.5 text-[11px] shadow-panel">
      <div>
        <div className="mb-1 font-semibold uppercase tracking-wider text-ot-dim">Zone (node fill)</div>
        {Object.entries(ZONE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1.5 text-ot-muted">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: v.hex }} />
            {v.short}
          </div>
        ))}
      </div>
      <div>
        <div className="mb-1 font-semibold uppercase tracking-wider text-ot-dim">Severity (border)</div>
        <div className="flex flex-wrap gap-1.5">
          {SEVERITY_ORDER.map((s) => (
            <span key={s} className="flex items-center gap-1 text-ot-muted">
              <span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: SEVERITY[s].hex }} />
              {SEVERITY[s].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
