import { useState } from "react";
import { AlertTriangle, ArrowUpDown } from "lucide-react";
import {
  Card,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Host } from "@/types";

interface HostAlarmCount {
  host: Host;
  alarmCount: number;
}

interface MostAlarmsChartProps {
  data: HostAlarmCount[];
}

export function MostAlarmsChart({ data }: MostAlarmsChartProps) {
  const [topN, setTopN] = useState<number>(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const avgAlarms =
    data.length > 0
      ? data.reduce((sum, item) => sum + item.alarmCount, 0) / data.length
      : 0;

  const chartData = [...data]
    .sort((a, b) => {
      return sortOrder === "desc"
        ? b.alarmCount - a.alarmCount
        : a.alarmCount - b.alarmCount;
    })
    .slice(0, topN)
    .map((item) => ({
      name: item.host.name,
      ip: item.host.ipAddress,
      value: item.alarmCount,
    }));

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-error/10 p-2">
            <AlertTriangle className="h-6 w-6 text-error" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Host con più Allarmi</h3>
            <p className="text-base text-muted-foreground">
              Totale allarmi generati per host
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Top N Selector */}
          <Select
            value={topN.toString()}
            onValueChange={(v) => setTopN(parseInt(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Top 5</SelectItem>
              <SelectItem value="10">Top 10</SelectItem>
              <SelectItem value="20">Top 20</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order */}
          <Select
            value={sortOrder}
            onValueChange={(v: "asc" | "desc") => setSortOrder(v)}
          >
            <SelectTrigger className="w-[175px]">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Più → Meno</SelectItem>
              <SelectItem value="asc">Meno → Più</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
          />

          <YAxis
            stroke="hsl(var(--muted-foreground))"
            tick={{ fill: "hsl(var(--muted-foreground))" }}
            label={{
              value: "Numero Allarmi",
              angle: -90,
              position: "insideLeft",
              style: { fill: "hsl(var(--muted-foreground))" },
            }}
          />

          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border border-border bg-card/80 p-3 shadow-lg">
                    <p className="font-medium">{data.name}</p>
                    <p className="text-sm text-muted-foreground">{data.ip}</p>
                    <p className="mt-1 text-sm font-bold">
                      {data.value} allarmi
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Average line */}
          <ReferenceLine
            y={avgAlarms}
            stroke="hsl(var(--pending))"
            strokeDasharray="5 5"
            strokeWidth={2}
          >
            <Label
              value={`Media: ${avgAlarms.toFixed(2)} allarmi`}
              position="insideTopRight"
              fill="hsl(var(--pending))"
              style={{ fontWeight: "bold" }}
            />
          </ReferenceLine>
          <Bar dataKey="value" fill="hsl(var(--error))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
