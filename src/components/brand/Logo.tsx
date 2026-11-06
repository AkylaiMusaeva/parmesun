import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  return (
    <Link
      to="/"
      className={cn(
        "group inline-flex items-baseline gap-2 font-display text-2xl tracking-[0.08em]",
        tone === "light" ? "text-on-photo" : "text-foreground",
        className,
      )}
      aria-label="PARMESUN ONE — на главную"
    >
      <span className="font-semibold">PARMESUN</span>
      <span className="eyebrow text-[0.6rem] opacity-70 transition-opacity group-hover:opacity-100">One</span>
    </Link>
  );
}
