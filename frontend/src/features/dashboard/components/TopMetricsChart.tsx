import { useState } from "react";
import { ArrowUpDown, BarChart2 } from "lucide-react";
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

interface TopMetricsChartProps {
  title: string;
  subtitle: string;
  hosts: Host[];
  metric: {
    key: "averageLatency" | "averagePacketLoss";
    label: string;
    unit: string;
  };
  average: number;
  color?: string;
}

export function TopMetricsChart({
  title,
  subtitle,
  hosts,
  metric,
  average,
  color = "hsl(var(--primary))",
}: TopMetricsChartProps) {
  const [topN, setTopN] = useState<number>(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const chartData = [...hosts]
    .sort((a, b) => {
      const valueA = a[metric.key] || 0;
      const valueB = b[metric.key] || 0;

      return sortOrder === "desc" ? valueB - valueA : valueA - valueB;
    })
    .slice(0, topN)
    .map((host) => ({
      name: host.name,
      ip: host.ipAddress,
      value: host[metric.key] || 0,
    }));

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/20 p-2">
            <BarChart2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Controls */}
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
              <SelectItem value="desc">Alto → Basso</SelectItem>
              <SelectItem value="asc">Basso → Alto</SelectItem>
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
              value: `${metric.label} (${metric.unit})`,
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
                      {data.value.toFixed(2)} {metric.unit}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />

          {/* Average line */}
          <ReferenceLine
            y={average}
            stroke="hsl(var(--pending))"
            strokeDasharray="5 5"
            strokeWidth={2}
          >
            <Label
              value={`Media: ${average.toFixed(2)} ${metric.unit}`}
              position="insideTopRight"
              fill="hsl(var(--pending))"
              style={{ fontWeight: "bold" }}
            />
          </ReferenceLine>
          <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
