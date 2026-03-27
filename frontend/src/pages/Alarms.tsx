import {
  FilterBar,
  DataTable,
  EmptyState,
  LoadingSpinner,
} from "@/components/common";
import { AlarmDeleteDialog, getAlarmsColumns } from "@/features/alarms";
import { useAlarmMutations, useCachedAlarms } from "@/hooks";
import { AlertTriangle, Calendar, Info } from "lucide-react";
import { useMemo, useState } from "react";
import { PageHeader } from "@/layout";
import type { Alarm, AlarmStatus, DateFilter } from "@/types";
import type { SortingState } from "@tanstack/react-table";

export function Alarms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AlarmStatus | undefined>(
    undefined,
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>(undefined);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startedAt", desc: true },
  ]);
  const [selectedAlarm, setSelectedAlarm] = useState<Alarm | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  //* Use Query
  const { data: alarms, isLoading, error } = useCachedAlarms();
  const { deleteAlarms } = useAlarmMutations();

  //* Filters
  const statusOptions = [
    { value: undefined, label: "Tutti" },
    { value: "PENDING", label: "PENDING", color: "bg-error" },
    { value: "ACKNOWLEDGED", label: "ACKNOWLEDGED", color: "bg-pending" },
    { value: "RESOLVED", label: "RESOLVED", color: "bg-success" },
  ];

  const dateOptions = [
    { value: undefined, label: "Tutti" },
    { value: "year", label: "Ultimo anno" },
    { value: "month", label: "Ultimo mese" },
    { value: "week", label: "Ultima settimana" },
    { value: "today", label: "Oggi" },
  ];

  const hasActiveFilters = Boolean(
    searchQuery || statusFilter !== undefined || dateFilter !== undefined,
  );

  //* Data
  const filteredAlarms = useMemo(() => {
    if (!alarms) return [];

    let filtered = alarms;

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((alarm) =>
        alarm.hostIP.toLowerCase().includes(query),
      );
    }

    if (statusFilter != undefined) {
      filtered = filtered.filter((alarm) => alarm.status === statusFilter);
    }

    if (dateFilter !== undefined) {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === "today") {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === "week") {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === "month") {
        filterDate.setMonth(now.getMonth() - 1);
      } else if (dateFilter === "year") {
        filterDate.setFullYear(now.getFullYear() - 1);
      }

      filtered = filtered.filter((alarm) => {
        const alarmDate = new Date(alarm.startedAt);
        return alarmDate >= filterDate;
      });
    }

    return filtered;
  }, [alarms, searchQuery, statusFilter, dateFilter]);

  //* Function Handlers
  const handleDelete = (alarm: Alarm) => {
    setSelectedAlarm(alarm);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedAlarm) return;

    deleteAlarms([selectedAlarm.id], {
      onSuccess: () => {
        setDeleteDialogOpen(false);
        setSelectedAlarm(null);
      },
    });
  };

  const handleResetSorting = () => {
    setSorting([]);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter(undefined);
    setDateFilter(undefined);
  };

  const columns = useMemo(
    () => getAlarmsColumns({ onDelete: handleDelete }),
    [],
  );

  //* Error state
  if (error) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <EmptyState
          icon={AlertTriangle}
          title="Errore nel caricamento"
          description="Impossibile caricare gli allarmi"
        />
      </div>
    );
  }

  //* Loading State
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  //* Empty state
  if (!alarms || alarms.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Allarmi"
          description="Storico e gestione degli allarmi di sistema"
        />
        <EmptyState
          icon={AlertTriangle}
          title="Nessun allarme registrato"
          description="Non ci sono allarmi nel sistema"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allarmi"
        description="Storico e gestione degli allarmi di sistema"
      />

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Cerca per IP host..."
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        sorting={sorting}
        onResetSorting={handleResetSorting}
        filterGroups={[
          {
            id: "alarms-status",
            label: "Filtra per stato:",
            icon: <Info className="h-5 w-5" />,
            activeValue: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions,
          },
          {
            id: "alarms-date",
            label: "Filtra per data:",
            icon: <Calendar className="h-5 w-5" />,
            activeValue: dateFilter,
            onChange: setDateFilter,
            options: dateOptions,
          },
        ]}
      />

      {/* Table */}
      {filteredAlarms.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Nessun allarme trovato"
          description="Modifica i filtri per visualizzare più risultati"
        />
      ) : (
        <DataTable
          data={filteredAlarms}
          columns={columns}
          sorting={sorting}
          onSortingChange={setSorting}
          pageSize={20}
          pageSizeOptions={[10, 20, 50, 100]}
          tableHeight="calc(100vh - 400px)"
        />
      )}

      {/* Delete Dialog */}
      <AlarmDeleteDialog
        alarm={selectedAlarm}
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
