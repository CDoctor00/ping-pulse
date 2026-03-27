import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useCachedHost, useHostMutations } from "@/hooks";
import { HostStatsCard } from "./HostStatsCard";
import { HostMetricsCard } from "./HostMetricsCard";
import { HostDeleteDialog } from "./HostDeleteDialog";
import { hostEditSchema, type HostEditFormData } from "../schemas/hostSchemas";
import {
  Activity,
  Calendar,
  Edit,
  Globe,
  Network,
  Save,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";
import { DataTable, LoadingSpinner, StatusBadge } from "@/components/common";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  Input,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@/components/ui";
import { getAlarmsColumns } from "./AlarmsColumns";
import { getChildrenHostsColumns } from "./ChildrenHostsColumns";
import type { SortingState } from "@tanstack/react-table";
import type { Host } from "@/types";
import { useHostDetails } from "../hooks/useHostDetails";
import { Switch } from "@/components/ui/switch";

interface HostDetailsDrawerProps {
  hostID: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HostDetailsDrawer({
  hostID,
  isOpen,
  onOpenChange,
}: HostDetailsDrawerProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [activeTab, setActiveTab] = useState("overview");
  const [childrenSorting, setChildrenSorting] = useState<SortingState>([]);
  const [alarmsSorting, setAlarmsSorting] = useState<SortingState>([]);

  const { host, isLoading: hostLoading } = useCachedHost(hostID);

  const {
    deleteHosts,
    isDeleting,
    updateHosts,
    isUpdating,
    switchMaintenance,
    isSwitchingMaintenance,
  } = useHostMutations();

  const {
    hostAlarms,
    childrenHosts,
    alarmsCausedCount,
    alarmsInvolvedCount,
    hasActiveAlarm,
    uptimePercentage,
    isLoading,
  } = useHostDetails({ host, enabled: isOpen });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HostEditFormData>({
    resolver: zodResolver(hostEditSchema),
    defaultValues: {
      name: "",
      ipAddress: "",
      parentIP: "",
      note: "",
    },
  });

  useEffect(() => {
    if (isOpen && host) {
      reset({
        name: host.name,
        ipAddress: host.ipAddress,
        parentIP: host.parentIP ?? "",
        note: host.note ?? "",
      });
    }
  }, [isOpen, host, reset]);

  if (!host) return null;

  //? Utility Functions

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";

    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatUptime = (dateString: string) => {
    const added = new Date(dateString);
    const now = new Date();
    const totalDays = Math.floor(
      (now.getTime() - added.getTime()) / (1000 * 60 * 60 * 24),
    );
    const hours = Math.floor(
      ((now.getTime() - added.getTime()) % (1000 * 60 * 60 * 24)) /
        (1000 * 60 * 60),
    );

    return `${totalDays} giorni e ${hours} ore`;
  };

  const handleDelete = () => {
    deleteHosts([host.id], {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        onOpenChange(false);
      },
    });
  };

  const handleEdit = () => {
    setEditMode(true);
    reset({
      name: host.name,
      ipAddress: host.ipAddress,
      parentIP: host.parentIP ?? "",
      note: host.note ?? "",
    });
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    reset({
      name: host.name,
      ipAddress: host.ipAddress,
      parentIP: host.parentIP ?? "",
      note: host.note ?? "",
    });
  };

  const handleMaintenanceToggle = (checked: boolean) => {
    if (!host) return;

    switchMaintenance({
      id: host.id,
      ipAddress: host.ipAddress,
      set: checked,
    });
  };

  const onSubmit: SubmitHandler<HostEditFormData> = (data) => {
    const updatedHost: Host = {
      ...host,
      name: data.name.trim(),
      ipAddress: data.ipAddress.trim(),
      parentIP: data.parentIP?.trim() || null,
      note: data.note?.trim() || null,
    };

    updateHosts([updatedHost], {
      onSuccess: () => {
        setEditMode(false);
      },
    });
  };

  if (hostLoading || !host) {
    return (
      <Drawer open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <div className="flex h-[400px] items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  //? Columns
  const alarmsColumns = getAlarmsColumns();
  const childrenColumns = getChildrenHostsColumns();

  const isInMaintenance = host.status === "MAINTENANCE";

  return (
    <>
      <Drawer key={host.id} open={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          {/* Header */}
          <DrawerHeader className="border-b border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Network className="h-6 w-6 text-primary" />
                </div>

                <div>
                  <DrawerTitle className="text-2xl font-bold">
                    {editMode ? "Modifica Host" : host.name}
                  </DrawerTitle>
                  <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    {!editMode && (
                      <>
                        <code className="rounded bg-muted px-2 py-0.5 font-mono">
                          {host.ipAddress}
                        </code>
                        <span>•</span>
                        <StatusBadge status={host.status} />
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          <span>Attivo da: {formatUptime(host.addedAt)}</span>
                        </div>
                      </>
                    )}
                    {editMode && <span>Modifica i campi sottostanti</span>}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {!editMode ? (
                  <>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Wrench className="h-5 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Modalità Manutenzione</p>
                            <p className="text-sm text-muted-foreground">
                              {isInMaintenance
                                ? "L'host è in manutenzione"
                                : "L'host è operativo"}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={isInMaintenance}
                          onCheckedChange={handleMaintenanceToggle}
                          disabled={isSwitchingMaintenance}
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEdit}
                      className="cursor-pointer"
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Modifica
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialogOpen(true)}
                      disabled={isDeleting}
                      className="text-error hover:bg-error/10 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isDeleting ? "Eliminazione..." : "Elimina"}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onOpenChange(false)}
                      className="cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isUpdating}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isUpdating ? "Salvataggio..." : "Salva"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelEdit}
                      disabled={isUpdating}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Annulla
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DrawerHeader>

          {/* Body */}
          <div
            className="overflow-auto py-6 px-6"
            style={{ height: "calc(85vh - 300px)" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-sm text-muted-foreground">
                  Caricamento dati...
                </div>
              </div>
            ) : editMode ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="rounded-lg border border-border bg-card p-6">
                  <h3 className="mb-4 text-lg font-semibold">
                    Informazioni Host
                  </h3>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Host *</Label>
                      <Input
                        id="name"
                        {...register("name")}
                        placeholder="es. gateway-principale"
                        className={errors.name ? "border-error" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-error">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipAddress">Indirizzo IP *</Label>
                      <Input
                        id="ipAddress"
                        {...register("ipAddress")}
                        placeholder="es. 192.168.1.1"
                        className={errors.ipAddress ? "border-error" : ""}
                      />
                      {errors.ipAddress && (
                        <p className="text-sm text-error">
                          {errors.ipAddress.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="parentIP">Parent IP (opzionale)</Label>
                      <Input
                        id="parentIP"
                        {...register("parentIP")}
                        placeholder="es. 192.168.1.254"
                        className={errors.parentIP ? "border-error" : ""}
                      />
                      {errors.parentIP && (
                        <p className="text-sm text-error">
                          {errors.parentIP.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Lascia vuoto se questo è un nodo root
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="note">Note (opzionale)</Label>
                      <Textarea
                        id="note"
                        {...register("note")}
                        placeholder="Aggiungi note o descrizione..."
                        rows={3}
                        className={errors.note ? "border-error" : ""}
                      />
                      {errors.note && (
                        <p className="text-sm text-error">
                          {errors.note.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-6">
                  <h3 className="mb-4 text-sm font-semibold text-muted-foreground">
                    Informazioni di Sistema (non modificabili)
                  </h3>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID:</span>{" "}
                      <span className="font-mono">{host.id}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Stato:</span>{" "}
                      <StatusBadge status={host.status} />
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Aggiunto il:
                      </span>{" "}
                      {formatDate(host.addedAt)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Ultimo ping:
                      </span>{" "}
                      {formatDate(host.lastPing)}
                    </div>
                  </div>
                </div>
              </form>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                {/* Tab List */}
                <TabsList className="mb-6">
                  <TabsTrigger value="overview" className="cursor-pointer">
                    Panoramica
                  </TabsTrigger>
                  <TabsTrigger value="children" className="cursor-pointer">
                    Host Figli
                    {childrenHosts.length > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {childrenHosts.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="alarms" className="cursor-pointer">
                    Storico Allarmi
                    {hostAlarms.length > 0 && (
                      <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        {hostAlarms.length}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="details" className="cursor-pointer">
                    Dettagli Tecnici
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-6">
                    <HostStatsCard
                      host={host}
                      childrenCount={childrenHosts.length}
                    />
                    <HostMetricsCard
                      alarmsCausedCount={alarmsCausedCount}
                      alarmsInvolvedCount={alarmsInvolvedCount}
                      hasActiveAlarm={hasActiveAlarm}
                      uptimePercentage={uptimePercentage}
                    />
                  </div>
                </TabsContent>

                {/* Children Tab */}
                <TabsContent value="children" className="flex-1">
                  <DataTable
                    data={childrenHosts}
                    columns={childrenColumns}
                    emptyMessage="Nessun host figlio"
                    pageSize={10}
                    pageSizeOptions={[5, 10, 20]}
                    tableHeight="calc(85vh - 450)px"
                    sorting={childrenSorting}
                    onSortingChange={setChildrenSorting}
                  />
                </TabsContent>

                {/* Alarms Tab */}
                <TabsContent value="alarms" className="flex-1">
                  <DataTable
                    data={hostAlarms}
                    columns={alarmsColumns}
                    emptyMessage="Nessun allarme registrato"
                    pageSize={10}
                    pageSizeOptions={[5, 10, 20]}
                    tableHeight="calc(85vh - 450)px"
                    sorting={alarmsSorting}
                    onSortingChange={setAlarmsSorting}
                  />
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6 flex-1">
                  <div className="grid grid-cols-2 gap-6">
                    {/* Host configurations */}
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <Globe className="h-5 w-5 text-primary" />
                        Configurazione Host
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Nome Host
                          </div>
                          <div className="text-sm font-medium">{host.name}</div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Indirizzo IP
                          </div>
                          <code className="text-sm font-medium">
                            {host.ipAddress}
                          </code>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Indirizzo IP Genitore
                          </div>
                          <code className="text-sm font-medium">
                            {host.parentIP || "Nodo radice"}
                          </code>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Host Figli
                          </div>
                          <div className="text-sm font-medium">
                            {childrenHosts.length}
                          </div>
                        </div>

                        {host.note && (
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Note
                            </div>
                            <div className="text-sm">{host.note}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="rounded-lg border border-border bg-card p-6">
                      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                        <Calendar className="h-5 w-5 text-primary" />
                        Timeline
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Aggiunto il
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(host.addedAt)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Ultimo Ping
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(host.lastPing)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Ultimo Pulse
                          </div>
                          <div className="text-sm font-medium">
                            {formatDate(host.lastPulse)}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Tempo Online
                          </div>
                          <div className="text-sm font-medium">
                            {formatUptime(host.addedAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <HostDeleteDialog
        host={host}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
}
