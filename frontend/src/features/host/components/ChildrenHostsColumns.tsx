import { Button } from "@/components/ui";
import { StatusBadge } from "@/components/common";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { Host } from "@/types";

export function getChildrenHostsColumns(): ColumnDef<Host>[] {
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
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
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
      size: 120,
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
      sortingFn: (rowA, rowB, columnId) => {
        const statusOrder = {
          DOWN: 0,
          UNREACHABLE: 1,
          PENDING: 2,
          UP: 3,
          MAINTENANCE: 4,
        };
        const statusA = rowA.getValue(columnId) as keyof typeof statusOrder;
        const statusB = rowB.getValue(columnId) as keyof typeof statusOrder;
        return statusOrder[statusA] - statusOrder[statusB];
      },
    },

    {
      accessorKey: "averageLatency",
      size: 120,
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
        if (!latency) return <span className="text-muted-foreground">N/A</span>;
        return <span className="text-sm">{latency.toFixed(2)} ms</span>;
      },
      enableSorting: true,
      sortingFn: "basic",
      sortUndefined: 1,
    },

    {
      accessorKey: "averagePacketLoss",
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
            % Pacchetti Persi
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
      size: 120,
      cell: ({ row }) => {
        const latency = row.original.averageLatency;
        if (!latency) return <span className="text-muted-foreground">N/A</span>;
        return <span className="text-sm">{latency.toFixed(2)}%</span>;
      },
      enableSorting: true,
      sortingFn: "basic",
      sortUndefined: 1,
    },
  ];
}
