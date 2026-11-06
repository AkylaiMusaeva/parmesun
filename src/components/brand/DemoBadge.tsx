import { cn } from "@/lib/utils";
import type { DataSource } from "@/domain/types";

export function DemoBadge({ source = "demo", className }: { source?: DataSource; className?: string }) {
  if (source !== "demo") return null;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-demo px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-demo-foreground",
        className,
      )}
      title="Демонстрационные данные — не реальная информация"
    >
      <span className="size-1.5 rounded-full bg-demo-foreground" />
      Демо-данные
    </span>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 border border-dashed border-sage bg-sage-soft/50 px-4 py-3 text-sm text-demo-foreground sm:flex-row sm:items-center">
      <DemoBadge />
      <p>{children}</p>
    </div>
  );
}
