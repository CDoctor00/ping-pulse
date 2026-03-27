import { EmptyState, FilterBar, LoadingSpinner } from "@/components/common";
import { Button } from "@/components/ui";
import { HostAddDialog, HostDetailsDrawer } from "@/features/host";
import { HostsTable, NetworkGraph } from "@/features/network";
import { useCachedHosts } from "@/hooks";
import { PageHeader } from "@/layout";
import { Info, NetworkIcon, Plus, TableIcon } from "lucide-react";
import { useMemo, useState } from "react";
import type { Host, HostStatus } from "@/types";
import type { SortingState } from "@tanstack/react-table";

export function Network() {
  const [view, setView] = useState<"table" | "graph">("table");
  const [selectedHostID, setSelectedHostID] = useState<number | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [statusFilter, setStatusFilter] = useState<HostStatus | undefined>(
    undefined,
  );

  //* Use Query
  const { data: hosts, isLoading, error } = useCachedHosts();

  //* Filters
  const statusOptions = [
    { value: undefined, label: "Tutti" },
    { value: "UP", label: "UP", color: "bg-success" },
    { value: "PENDING", label: "PENDING", color: "bg-pending" },
    { value: "UNREACHABLE", label: "UNREACHABLE", color: "bg-warning" },
    { value: "DOWN", label: "DOWN", color: "bg-error" },
    { value: "MAINTENANCE", label: "MAINTENANCE", color: "bg-info" },
  ];

  const hasActiveFilters = Boolean(searchQuery || statusFilter !== undefined);

  //* Data
  const filteredHosts = useMemo(() => {
    if (!hosts) return [];

    let filtered = hosts;

    if (statusFilter !== undefined) {
      filtered = filtered.filter((host) => host.status === statusFilter);
    }

    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((host) => {
        return (
          host.name.toLowerCase().includes(query) ||
          host.ipAddress.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [hosts, statusFilter, searchQuery]);

  //* Function Handlers
  const handleViewDetails = (host: Host) => {
    setSelectedHostID(host.id);
    setDetailsOpen(true);
  };

  const handleResetSorting = () => {
    setSorting([]);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter(undefined);
  };

  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  //* Error state
  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Network"
          description="Monitoraggio e gestione della rete"
        />
        <div className="rounded-lg border border-error bg-error/10 p-4 text-error">
          Si è verificato un errore: {error.message}
        </div>
      </div>
    );
  }

  //* Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Network"
          description="Monitoraggio e gestione della rete"
        />
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  //* Empty state
  if (!hosts || hosts.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Network"
          description="Monitoraggio e gestione host"
          actions={
            <Button onClick={handleAdd} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Host
            </Button>
          }
        />
        <EmptyState
          icon={NetworkIcon}
          title="Nessun host configurato"
          description="Inizia aggiungendo il tuo primo host da monitorare"
          action={{
            label: "Aggiungi Host",
            onClick: handleAdd,
          }}
        />

        <HostAddDialog isOpen={addDialogOpen} onOpenChange={setAddDialogOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Network"
        description="Monitoraggio e gestione della rete"
        actions={
          <>
            {/* Toggle View - Buttons */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
              <Button
                variant={view === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("table")}
                className="gap-2 cursor-pointer"
              >
                <TableIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Tabella</span>
              </Button>
              <Button
                variant={view === "graph" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setView("graph")}
                className="gap-2 cursor-pointer"
              >
                <NetworkIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Grafo</span>
              </Button>
            </div>

            <Button onClick={handleAdd} className="cursor-pointer">
              <Plus className="mr-2 h-4 w-4" />
              Aggiungi Host
            </Button>
          </>
        }
      />

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Cerca"
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={handleResetFilters}
        sorting={sorting}
        onResetSorting={handleResetSorting}
        filterGroups={[
          {
            id: "network-status",
            label: "Filtra per stato:",
            icon: <Info className="h-5 w-5" />,
            activeValue: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions,
          },
        ]}
      />

      {/* Content based on view */}
      {hosts.length === 0 ? (
        // No Results State
        <EmptyState
          icon={NetworkIcon}
          title="Nessun host trovato"
          description={
            searchQuery
              ? `Nessun risultato per "${searchQuery}"`
              : "Nessun host corrisponde ai filtri selezionati"
          }
          action={{
            label: "Reset Filtri",
            onClick: () => {
              setSearchQuery("");
              setStatusFilter(undefined);
            },
          }}
        />
      ) : view === "table" ? (
        <HostsTable
          hosts={filteredHosts}
          sorting={sorting}
          onSortingChange={setSorting}
          onViewDetails={handleViewDetails}
        />
      ) : (
        <NetworkGraph
          hosts={hosts}
          onNodeClick={handleViewDetails}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
        />
      )}

      {selectedHostID !== null && (
        <HostDetailsDrawer
          hostID={selectedHostID}
          isOpen={detailsOpen}
          onOpenChange={() => {
            setDetailsOpen(false);
            setSelectedHostID(null);
          }}
        />
      )}

      <HostAddDialog isOpen={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  );
}
