import { alarmsAPI } from "@/api/endpoints/alarms";
import { APIError } from "@/types";
import { formatErrorDetails } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useAlarmMutations() {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (hostIDs: number[]) => alarmsAPI.delete(hostIDs),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["alarms", "all"],
      });
      toast.success("Allarme eliminato", {
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

  return {
    deleteAlarms: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
