import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Badge,
  Separator,
} from "@/components/ui";
import { AlertTriangle, Clock, Calendar, Server } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Alarm, AlarmStatus } from "@/types";

interface AlarmDeleteDialogProps {
  alarm: Alarm | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function AlarmDeleteDialog({
  alarm,
  isOpen,
  onOpenChange,
  onConfirm,
}: AlarmDeleteDialogProps) {
  if (!alarm) return null;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const calculateDuration = () => {
    const start = new Date(alarm.startedAt);
    const end = alarm.resolvedAt ? new Date(alarm.resolvedAt) : new Date();
    const totalMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60),
    );

    if (totalMinutes < 60) return `${totalMinutes} minuti`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours < 24) {
      return minutes > 0 ? `${hours} ore e ${minutes} minuti` : `${hours} ore`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0
      ? `${days} giorni e ${remainingHours} ore`
      : `${days} giorni`;
  };

  const getStatusBadge = (status: AlarmStatus) => {
    const config = {
      RESOLVED: {
        label: "RESOLVED",
        className: "bg-success/10 text-success border-success/20",
      },
      ACKNOWLEDGED: {
        label: "ACKNOWLEDGED",
        className: "bg-pending/10 text-pending border-pending/20",
      },
      PENDING: {
        label: "PENDING",
        className: "bg-error/10 text-error border-error/20",
      },
    };

    const { label, className } = config[status];

    return (
      <Badge variant="outline" className={cn("font-medium", className)}>
        {label}
      </Badge>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[450px]">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error/10">
              <AlertTriangle className="h-6 w-6 text-error" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-xl">
                Conferma Eliminazione
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                Sei sicuro di voler eliminare questo allarme?
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <Separator className="my-4" />

        {/* Alarm Details Card */}
        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
          {/* Host IP */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Server className="h-4 w-4" />
              <span>Host IP</span>
            </div>
            <code className="rounded bg-background px-2 py-1 font-mono text-sm font-medium">
              {alarm.hostIP}
            </code>
          </div>

          <Separator />

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4" />
              <span>Stato</span>
            </div>
            {getStatusBadge(alarm.status as AlarmStatus)}
          </div>

          <Separator />

          {/* Started At */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Iniziato</span>
            </div>
            <span className="text-sm font-medium">
              {formatDate(alarm.startedAt)}
            </span>
          </div>

          <Separator />

          {/* Duration */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Durata</span>
            </div>
            <span className="text-sm font-medium">{calculateDuration()}</span>
          </div>

          {/* Resolved At (solo se risolto) */}
          {alarm.resolvedAt && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Risolto</span>
                </div>
                <span className="text-sm font-medium">
                  {formatDate(alarm.resolvedAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Warning Message */}
        <div className="flex items-start gap-2 rounded-lg bg-error/5 border border-error/20 p-3">
          <AlertTriangle className="h-4 w-4 text-error mt-0.5 shrink-0" />
          <p className="text-sm text-error font-medium">
            Questa azione non può essere annullata. L'allarme verrà eliminato
            permanentemente dal sistema.
          </p>
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="cursor-pointer">
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-error text-error-foreground hover:bg-error/90 cursor-pointer"
          >
            Elimina Allarme
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
