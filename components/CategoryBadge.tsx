import { CATEGORY } from "@/lib/tokens";
import type { Category } from "@/lib/types";

export function CategoryBadge({ category }: { category: Category | string }) {
  const c = CATEGORY[category] ?? { label: category, hex: "#8b97a7" };
  return (
    <span
      className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{ color: c.hex, backgroundColor: `${c.hex}14`, border: `1px solid ${c.hex}40` }}
    >
      {c.label}
    </span>
  );
}
