import { cn } from "@/lib/utils";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, lead, align = "left", className, as = "h2" }: Props) {
  const Tag = as;
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-5 text-accent">{eyebrow}</p>}
      <Tag className={cn(as === "h1" ? "text-5xl md:text-7xl" : "text-4xl md:text-6xl")}>{title}</Tag>
      {lead && <p className="mt-6 text-base leading-relaxed text-muted-foreground md:text-lg">{lead}</p>}
    </div>
  );
}
