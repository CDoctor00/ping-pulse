import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface MetricItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  variant?: "default" | "success" | "pending" | "warning" | "error";
  size?: "sm" | "md" | "lg";
}

export function MetricItem({
  icon: Icon,
  label,
  value,
  variant = "default",
  size = "md",
}: MetricItemProps) {
  const variantStyles = {
    default: "text-foreground",
    success: "text-success",
    pending: "text-pending",
    warning: "text-warning",
    error: "text-error",
  };

  const sizeStyles = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border-border bg-muted/30 p-4">
      <div className={cn("rounded-full bg-muted p-2", variantStyles[variant])}>
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div
          className={cn("font-bold", sizeStyles[size], variantStyles[variant])}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
