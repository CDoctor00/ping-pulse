import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Alarm, AlarmStatus } from "@/types";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown, Clock } from "lucide-react";

export function getAlarmsColumns(): ColumnDef<Alarm>[] {
  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("it-IT", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  };

  const calculateDuration = (alarm: Alarm) => {
    const start = new Date(alarm.startedAt);
    const end = alarm.resolvedAt ? new Date(alarm.resolvedAt) : new Date();
    const totalMinutes = Math.floor(
      (end.getTime() - start.getTime()) / (1000 * 60),
    );

    if (totalMinutes < 60) return `${totalMinutes}m`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours < 24) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }

    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}g ${remainingHours}h` : `${days}g`;
  };

  const getStatusBadge = (status: AlarmStatus) => {
    const variants = {
      RESOLVED: "secondary",
      ACKNOWLEDGED: "outline",
      PENDING: "destructive",
    } as const;

    return (
      <Badge
        variant={variants[status]}
        className={cn(
          status === "RESOLVED" && "bg-success text-success-foreground",
          status === "ACKNOWLEDGED" && "bg-warning text-warning-foreground",
        )}
      >
        {status}
      </Badge>
    );
  };

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
            className="-ml-4 hover:bg-accent"
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
            className="-ml-4 hover:bg-accent"
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
      cell: ({ row }) => getStatusBadge(row.original.status as AlarmStatus),
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const statusOrder = {
          PENDING: 0,
          ACKNOWLEDGED: 1,
          RESOLVED: 2,
        };
        const statusA = rowA.getValue(columnId) as AlarmStatus;
        const statusB = rowB.getValue(columnId) as AlarmStatus;
        return statusOrder[statusA] - statusOrder[statusB];
      },
    },
    {
      accessorKey: "startedAt",
      size: 180,
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
            className="-ml-4 hover:bg-accent"
          >
            Iniziato
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
        <span className="text-sm">
          {formatTimestamp(row.original.startedAt)}
        </span>
      ),
      enableSorting: true,
      sortingFn: "datetime",
    },
    {
      id: "duration",
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
            className="-ml-4 hover:bg-accent"
          >
            Durata
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
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-3 w-3 text-muted-foreground" />
          {calculateDuration(row.original)}
        </div>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const getDurationMinutes = (alarm: Alarm) => {
          const start = new Date(alarm.startedAt);
          const end = alarm.resolvedAt
            ? new Date(alarm.resolvedAt)
            : new Date();
          return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
        };

        return (
          getDurationMinutes(rowA.original) - getDurationMinutes(rowB.original)
        );
      },
    },
    {
      accessorKey: "resolvedAt",
      size: 180,
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
            className="-ml-4 hover:bg-accent"
          >
            Risolto
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
        <span className="text-sm">
          {row.original.resolvedAt
            ? formatTimestamp(row.original.resolvedAt)
            : "-"}
        </span>
      ),
      enableSorting: true,
      sortingFn: (rowA, rowB, columnId) => {
        const a = rowA.getValue(columnId) as string | null;
        const b = rowB.getValue(columnId) as string | null;

        if (a === null && b === null) return 0;
        if (a === null) return 1;
        if (b === null) return -1;

        return new Date(a).getTime() - new Date(b).getTime();
      },
    },
  ];
}
