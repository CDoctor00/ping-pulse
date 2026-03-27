import { useHostMutations } from "@/hooks";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from "@/components/ui";
import { Plus, X } from "lucide-react";
import {
  formDataToNewHost,
  hostAddSchema,
  type HostAddFormData,
} from "../schemas/hostSchemas";

interface HostAddDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostAddDialog({ isOpen, onOpenChange }: HostAddDialogProps) {
  const { addHosts, isAdding } = useHostMutations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostAddFormData>({
    resolver: zodResolver(hostAddSchema),
    defaultValues: {
      name: "",
      ipAddress: "",
      parentIP: "",
      note: "",
    },
  });

  const onSubmit: SubmitHandler<HostAddFormData> = (data) => {
    const newHost = formDataToNewHost(data);

    addHosts([newHost], {
      onSuccess: () => {
        reset();
        onOpenChange(false);
      },
    });
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      reset();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5 text-primary" />
            Aggingi Nuovo Host
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="add-name">
              Nome Host <span className="text-error">*</span>
            </Label>
            <Input
              id="add-name"
              {...register("name")}
              placeholder="es. gateway-principale"
              className={errors.name ? "border-error" : ""}
              autoFocus
            />
            {errors.name && (
              <p className="text-sm text-error">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-ipAddress">
              Indirizzo IP <span className="text-error">*</span>
            </Label>
            <Input
              id="add-ipAddress"
              {...register("ipAddress")}
              placeholder="es. 192.168.1.1"
              className={errors.ipAddress ? "border-error" : ""}
            />
            {errors.ipAddress && (
              <p className="text-sm text-error">{errors.ipAddress.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Lascia vuoto se queto è un nodo root
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-parentIP">Parent IP (opzionale)</Label>
            <Input
              id="add-parentIP"
              {...register("parentIP")}
              placeholder="es. 192.168.1.254"
              className={errors.parentIP ? "border-error" : ""}
            />
            {errors.parentIP && (
              <p className="text-sm text-error">{errors.parentIP.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Lascia vuoto se questo è un nodo root
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-note">Note (opzionale)</Label>
            <Textarea
              id="add-note"
              {...register("note")}
              placeholder="Aggiungi note o descrizione..."
              rows={3}
              className={errors.note ? "border-error" : ""}
            />
            {errors.note && (
              <p className="text-sm text-error">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isAdding}
              className="cursor-poiner"
            >
              <X className="mr-2 h-4 w-4" />
              Annulla
            </Button>
            <Button
              type="submit"
              disabled={isAdding}
              className="cursor-pointer"
            >
              <Plus className="mr-2 h-4 w-4" />
              {isAdding ? "Aggiunta in corso..." : "Aggiungi Host"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
