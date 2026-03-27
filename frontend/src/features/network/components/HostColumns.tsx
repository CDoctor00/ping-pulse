import { StatusBadge } from "@/components/common";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Host } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Eye } from "lucide-react";

interface HostsTableActionsProps {
  onViewDetails: (host: Host) => void;
}

export function getHostsColumns(
  actions: HostsTableActionsProps,
): ColumnDef<Host>[] {
  return [
    {
      accessorKey: "id",
      size: 100,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            ID
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium text-foreground">{row.original.id}</div>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: "basic",
    },
    {
      accessorKey: "name",
      size: 200,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            Nome
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => {
        return (
          <div>
            <div className="font-medium text-foreground">
              {row.original.name}
            </div>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "ipAddress",
      size: 150,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            Indirizzo IP
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => (
        <code className="text-sm text-muted-foreground">
          {row.original.ipAddress}
        </code>
      ),
      enableSorting: true,
      sortingFn: "alphanumeric",
    },
    {
      accessorKey: "status",
      size: 150,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            Status
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}

              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      enableSorting: true,
      sortingFn: (rowA, rowB, columnID) => {
        const statusOrder = {
          DOWN: 0,
          UNREACHABLE: 1,
          PENDING: 2,
          UP: 3,
          MAINTENANCE: 4,
        };
        const statusA = rowA.getValue(columnID) as keyof typeof statusOrder;
        const statusB = rowB.getValue(columnID) as keyof typeof statusOrder;
        return statusOrder[statusA] - statusOrder[statusB];
      },
      filterFn: (row, columnID, filterValue) => {
        const status = row.getValue(columnID);
        return status === filterValue;
      },
    },
    {
      accessorKey: "averageLatency",
      size: 125,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            Latenza Media
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}

              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => {
        const latency = row.original.averageLatency;
        if (latency === null)
          return <span className="text-muted-foreground">N/A</span>;

        const color =
          latency < 100
            ? "text-success"
            : latency < 200
              ? "text-pending"
              : latency < 300
                ? "text-warning"
                : "text-error";

        return (
          <div className="flex items-center gap-2">
            <span className={cn("font-medium", color)}>
              {latency.toFixed(2)} ms
            </span>
            {/* Mini bar grafico */}
            {/* <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  latency < 100
                    ? "bg-success"
                    : latency < 200
                      ? "bg-pending" : 
                      latency < 300 ? 
                      "bg-warning" 
                      : "bg-error",
                )}
                style={{ width: `${Math.min((latency / 200) * 100, 100)} %` }}
              />
            </div> */}
          </div>
        );
      },
      enableSorting: true,
      sortingFn: "basic",
      sortUndefined: 1,
    },
    {
      accessorKey: "averagePacketLoss",
      size: 125,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            % Pacchetti persi
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => {
        const packetLoss = row.original.averagePacketLoss;
        if (packetLoss === null)
          return <span className="text-muted-foreground">N/A</span>;

        const color =
          packetLoss < 1
            ? "text-success"
            : packetLoss < 10
              ? "text-pending"
              : packetLoss < 25
                ? "text-warning"
                : "text-error";

        return (
          <span className={cn("font-medium", color)}>
            {packetLoss.toFixed(2)}%
          </span>
        );
      },
      enableSorting: true,
      sortingFn: "basic",
      sortUndefined: 1,
    },
    {
      accessorKey: "disconnectionCount",
      size: 100,
      header: ({ column }) => {
        const isSorted = column.getIsSorted();
        const sortIndex = column.getSortIndex();

        return (
          <Button
            variant="ghost"
            onClick={(event) => {
              column.toggleSorting(
                column.getIsSorted() === "asc",
                event.shiftKey,
              );
            }}
            className="-ml-4 hover:bg-accent cursor-pointer"
          >
            Disconnessioni
            <div className="ml-2 flex items-center gap-1">
              {isSorted === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : isSorted === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4 opacity-50" />
              )}
              {sortIndex !== -1 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {sortIndex + 1}
                </span>
              )}
            </div>
          </Button>
        );
      },
      cell: ({ row }) => {
        const disconnections = row.original.disconnectionCount;
        if (disconnections === null)
          return <span className="text-muted-foreground">N/A</span>;

        const color =
          disconnections < 1
            ? "text-success"
            : disconnections < 10
              ? "text-pending"
              : disconnections < 25
                ? "text-warning"
                : "text-error";

        return (
          <span className={cn("font-medium", color)}>{disconnections}</span>
        );
      },
      enableSorting: true,
      sortingFn: "basic",
    },
    {
      id: "actions",
      size: 100,
      header: () => <div className="text-center">Azioni</div>,
      cell: ({ row }) => {
        const host = row.original;

        return (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => actions.onViewDetails(host)}
              className="gap-2 cursor-pointer"
            >
              <Eye className="h-4 w-4" />
              Dettagli
            </Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}
