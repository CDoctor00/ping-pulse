import { hostsAPI } from "@/api/endpoints/hosts";
import { APIError, type Host, type NewHost } from "@/types";
import { formatErrorDetails } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useHostMutations() {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: (newHosts: NewHost[]) => hostsAPI.add(newHosts),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["hosts", "all"],
      });
      toast.success("Host aggiunto", {
        description: "Le modifiche sono state salvate con successo",
        closeButton: true,
      });
    },
    onError: (error: Error) => {
      console.log(error);
      const description =
        error instanceof APIError && error.details
          ? formatErrorDetails(error.details)
          : error.message;

      toast.error("Errore nell'aggiunta", {
        description,
        closeButton: true,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (hostIDs: number[]) => hostsAPI.delete(hostIDs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts", "all"] });
      toast.success("Host rimossi", {
        description: "Le modifiche sono state salvate con successo",
        closeButton: true,
      });
    },
    onError: (error: Error) => {
      console.log(error);
      const description =
        error instanceof APIError && error.details
          ? formatErrorDetails(error.details)
          : error.message;

      toast.error("Errore nell'eliminazione", {
        description,
        closeButton: true,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (hosts: Host[]) => hostsAPI.update(hosts),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hosts", "all"] });
      toast.success("Host aggiornato", {
        description: "Le modifiche sono state salvate con successo",
        closeButton: true,
      });
    },
    onError: (error: Error) => {
      console.log(error);
      const description =
        error instanceof APIError && error.details
          ? formatErrorDetails(error.details)
          : error.message;

      toast.error("Errore nell'aggiornamento", {
        description,
        closeButton: true,
      });
    },
  });

  const switchMaintananceMutation = useMutation({
    mutationFn: ({
      id,
      ipAddress,
      set,
    }: {
      id: number;
      ipAddress: string;
      set: boolean;
    }) => hostsAPI.switchMaintenance(id, ipAddress, set),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["hosts", "all"] });
      toast.success(
        variables.set ? "Manutenzione attivata" : "Manutenzione disattivata",
        {
          description: variables.set
            ? "L'host è stato messo in modalità manutenzione"
            : "L'host è tornato operativo",
          closeButton: true,
        },
      );
    },
    onError: (error: Error) => {
      console.log(error);
      const description =
        error instanceof APIError && error.details
          ? formatErrorDetails(error.details)
          : error.message;

      toast.error("Errore nel cambio stato", {
        description,
        closeButton: true,
      });
    },
  });

  return {
    addHosts: addMutation.mutate,
    isAdding: addMutation.isPending,
    deleteHosts: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    updateHosts: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    switchMaintenance: switchMaintananceMutation.mutate,
    isSwitchingMaintenance: switchMaintananceMutation.isPending,
  };
}
