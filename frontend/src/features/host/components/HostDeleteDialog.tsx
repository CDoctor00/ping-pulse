import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui";
import type { Host } from "@/types";

interface HostDeleteDialogProps {
  host: Host | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (host: Host) => void;
}

export function HostDeleteDialog({
  host,
  isOpen,
  onOpenChange,
  onConfirm,
}: HostDeleteDialogProps) {
  if (!host) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sei sicuro? </AlertDialogTitle>
          <AlertDialogDescription>
            Stai per eliminare l'host <strong>{host.name}</strong> (
            {host.ipAddress}). Questa azione è irreversibile e rimuoverà anche
            tutti i dati e gli allarmi associati (figli host compresi).
          </AlertDialogDescription>

          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onConfirm(host)}
              className="bg-error text-error-foreground hover:bg-error/90"
            >
              Elimina Host
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}
