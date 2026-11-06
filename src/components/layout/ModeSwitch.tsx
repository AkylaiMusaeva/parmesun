import { Link, useRouterState } from "@tanstack/react-router";
import { modeFromPath, modeHome, type InterfaceMode } from "@/config/navigation";
import { cn } from "@/lib/utils";

const labels: Record<InterfaceMode, string> = { client: "Гость", business: "Бизнес" };

/** Segmented switch between the guest interface and the business (team) interface. */
export function ModeSwitch({ className, onNavigate }: { className?: string; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = modeFromPath(pathname);

  return (
    <div
      role="group"
      aria-label="Интерфейс"
      className={cn("inline-flex rounded-full border border-foreground/20 bg-card p-1", className)}
    >
      {(Object.keys(labels) as InterfaceMode[]).map((m) => {
        const to = modeHome[m];
        const cls = cn(
          "rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-colors",
          mode === m ? "bg-espresso text-ivory" : "text-muted-foreground hover:text-foreground",
        );
        return to ? (
          <Link key={m} to={to} onClick={onNavigate} aria-pressed={mode === m} className={cls}>
            {labels[m]}
          </Link>
        ) : (
          <span key={m} className={cn(cls, "cursor-not-allowed opacity-60")} title="Скоро">
            {labels[m]} · скоро
          </span>
        );
      })}
    </div>
  );
}
