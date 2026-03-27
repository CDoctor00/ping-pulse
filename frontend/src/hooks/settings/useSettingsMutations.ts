import { settingsAPI } from "@/api/endpoints/settings";
import { APIError } from "@/types";
import { formatErrorDetails } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useSettingsMutations() {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: settingsAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["configs"],
      });
      toast.success("Configurazione aggiornata", {
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

  return {
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
