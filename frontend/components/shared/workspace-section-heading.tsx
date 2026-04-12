import { cn } from "@/lib/utils";

interface WorkspaceSectionHeadingProps {
  title: string;
  description: string;
  className?: string;
}

export function WorkspaceSectionHeading({
  title,
  description,
  className,
}: WorkspaceSectionHeadingProps) {
  return (
    <div className={cn("mb-4", className)}>
      <h3 className="font-[var(--font-display)] text-2xl font-bold uppercase tracking-[-0.05em]">
        {title}
      </h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}
