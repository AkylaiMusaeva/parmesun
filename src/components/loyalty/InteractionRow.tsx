import { Link } from "@tanstack/react-router";
import { CalendarCheck, Coffee, Gift, MessageCircle, Send, Sparkles } from "lucide-react";
import type { Direction, Interaction, InteractionKind } from "@/domain/types";
import { formatDate, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

export const kindLabels: Record<InteractionKind, string> = {
  visit: "Визит",
  booking: "Бронь",
  offer: "Предложение",
  reward: "Обмен баллов",
  concierge: "Консьерж",
  request: "Заявка",
};

const kindIcons: Record<InteractionKind, typeof Coffee> = {
  visit: Coffee,
  booking: CalendarCheck,
  offer: Sparkles,
  reward: Gift,
  concierge: MessageCircle,
  request: Send,
};

export function InteractionRow({ item, direction }: { item: Interaction; direction?: Direction | undefined }) {
  const Icon = kindIcons[item.kind];
  return (
    <li className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-4 text-sm sm:grid-cols-[6rem_2.5rem_1fr_auto]">
      <span className="hidden text-muted-foreground sm:block">{formatDate(item.date)}</span>
      <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-accent">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-medium">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          <span className="sm:hidden">{formatDate(item.date)} · </span>
          {kindLabels[item.kind]}
          {direction && (
            <>
              {" · "}
              <Link to="/ecosystem/$slug" params={{ slug: direction.slug }} className="text-accent hover:underline">
                {direction.titleRu}
              </Link>
            </>
          )}
        </p>
      </div>
      <span
        className={cn(
          "font-display text-xl tabular-nums",
          item.points > 0 ? "text-foreground" : item.points < 0 ? "text-accent" : "text-muted-foreground",
        )}
      >
        {item.points > 0 ? `+${formatNumber(item.points)}` : item.points < 0 ? `−${formatNumber(-item.points)}` : "—"}
      </span>
    </li>
  );
}
