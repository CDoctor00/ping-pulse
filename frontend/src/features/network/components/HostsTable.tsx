import type { Host } from "@/types";
import { DataTable } from "@/components/common";
import type { OnChangeFn, SortingState } from "@tanstack/react-table";
import { getHostsColumns } from "./HostColumns";

interface HostsTableProps {
  hosts: Host[];
  onViewDetails: (host: Host) => void;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
}

export function HostsTable({
  hosts,
  onViewDetails,
  sorting,
  onSortingChange,
}: HostsTableProps) {
  const columns = getHostsColumns({ onViewDetails });

  return (
    <DataTable
      data={hosts}
      columns={columns}
      emptyMessage="Nessun host trovato"
      sorting={sorting}
      onSortingChange={onSortingChange}
      pageSize={20}
      pageSizeOptions={[10, 20, 50, 100]}
      tableHeight="calc(100vh - 400px)"
    />
  );
}
