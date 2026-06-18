import { CategoryBadge } from "./CategoryBadge";
import { SeverityChip } from "./SeverityChip";
import { assetSummary, fmtTime } from "@/lib/format";
import { severityColor } from "@/lib/tokens";
import type { Alert } from "@/lib/types";

export function AlertRow({
  alert, selected, onSelect,
}: {
  alert: Alert;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(alert.id)}
      className={`w-full border-l-2 px-3 py-2.5 text-left transition-colors ${
        selected ? "bg-ot-hover" : "bg-transparent hover:bg-ot-panel/60"
      }`}
      style={{ borderLeftColor: selected ? severityColor(alert.severity) : "transparent" }}
    >
      <div className="flex items-center gap-2">
        <SeverityChip severity={alert.severity} size="xs" />
        <CategoryBadge category={alert.category} />
        <span className="ml-auto text-[10px] text-ot-dim">{fmtTime(alert.detected_at)}</span>
      </div>
      <div className="mt-1 line-clamp-2 text-sm font-medium text-ot-text">{alert.title}</div>
      <div className="mt-0.5 truncate text-xs text-ot-muted">{assetSummary(alert.assets)}</div>
    </button>
  );
}
