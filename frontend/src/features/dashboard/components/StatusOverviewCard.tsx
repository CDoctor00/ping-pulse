import { Card, Separator } from "@/components/ui";
import {
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
  type PieSectorShapeProps,
} from "recharts";
import type { LucideIcon } from "lucide-react";

interface StatusData {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

interface StatusOverviewCardProps {
  title: string;
  icon: LucideIcon;
  total: number;
  data: StatusData[];
  subtitle?: string;
}

export function StatusOverviewCard({
  title,
  icon: Icon,
  total,
  data,
  subtitle,
}: StatusOverviewCardProps) {
  const chartData = data.filter((item) => item.value > 0);

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-accent/20 p-2">
            <Icon className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Totale</p>
          <p className="text-2xl font-bold">{total}</p>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Body */}
      <div className="grid grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="flex items-center justify-center">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  shape={(props: PieSectorShapeProps) => {
                    return <Sector {...props} fill={props.payload.color} />;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border border-border bg-card/80 p-2 shadow-lg">
                          <p className="text-sm font-medium">{data.name}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Quantità:{" "}
                            <span className="font-medium text-foreground">
                              {data.value}
                            </span>
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Percentuale:{" "}
                            <span className="font-medium text-foreground">
                              ({data.percentage.toFixed(1)}%)
                            </span>
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[240px] items-center justify-center text-muted-foreground">
              Nessun dato
            </div>
          )}
        </div>

        {/* Bottom Legend */}
        <div className="flex flex-col justify-center space-y-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium truncate">
                  {item.name}
                </span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-base font-bold">{item.value}</p>
                <p className="text-xs text-muted-foreground">
                  {item.percentage.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
