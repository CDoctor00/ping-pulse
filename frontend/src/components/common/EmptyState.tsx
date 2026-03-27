import type { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState(data: EmptyStateProps) {
  const Icon = data.icon;

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
      {Icon && (
        <div className="mb-4 flex h-16 items-center justify-center rounded-full bg-muted">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-foreground">
        {data.title}
      </h3>

      {data.description && (
        <p className="mb-4 text-sm text-muted-foreground">{data.description}</p>
      )}

      {data.action && (
        <Button onClick={data.action.onClick} className="cursor-pointer">
          {data.action.label}
        </Button>
      )}
    </div>
  );
}
