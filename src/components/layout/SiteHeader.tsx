import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { modeFromPath, navFor } from "@/config/navigation";
import { ModeSwitch } from "./ModeSwitch";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const mode = modeFromPath(pathname);
  const nav = navFor(mode);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md",
        mode === "business" ? "border-ivory/10 bg-espresso/95 text-ivory" : "border-border/70 bg-background/85",
      )}
    >
      <div className="container-editorial flex h-16 items-center justify-between gap-6 md:h-20">
        <div className="flex items-center gap-3">
          <Logo tone={mode === "business" ? "light" : "dark"} />
          {mode === "business" && (
            <span className="hidden rounded-full border border-ivory/25 px-2.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-sage sm:inline">
              Команда
            </span>
          )}
        </div>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
          {nav.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              activeOptions={{ exact: item.to === "/business" }}
              className={cn(
                "relative text-sm transition-colors data-[status=active]:after:absolute data-[status=active]:after:-bottom-2 data-[status=active]:after:left-0 data-[status=active]:after:h-px data-[status=active]:after:w-full",
                mode === "business"
                  ? "text-ivory/65 hover:text-ivory data-[status=active]:text-ivory data-[status=active]:after:bg-sage"
                  : "text-muted-foreground hover:text-foreground data-[status=active]:text-foreground data-[status=active]:after:bg-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <ModeSwitch />
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn("lg:hidden", mode === "business" && "text-ivory hover:bg-ivory/10 hover:text-ivory")}
              aria-label="Открыть меню"
            >
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[85vw] max-w-sm bg-background">
            <SheetHeader>
              <SheetTitle className="font-display text-2xl">Меню</SheetTitle>
            </SheetHeader>
            <div className="px-4">
              <ModeSwitch onNavigate={() => setOpen(false)} />
            </div>
            <nav className="mt-4 flex flex-col px-4" aria-label="Мобильная навигация">
              {mode === "client" && (
                <Link
                  to="/"
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: true }}
                  className="border-b border-border py-4 font-display text-3xl data-[status=active]:text-accent"
                >
                  Главная
                </Link>
              )}
              {nav.map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/business" }}
                  className="border-b border-border py-4 font-display text-3xl data-[status=active]:text-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
