"use client";

import { TrendingUp } from "lucide-react";
import { Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface PieChartDataType {
  key: string;
  value: number;
  fill: string;
}

interface Props {
  data: PieChartDataType[];
  config: ChartConfig;
  dataKey: string;
  nameKey: string;
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  className?: string;
  showTrend?: boolean;
  showLabel?: boolean;
  withFilters?: boolean;
  showFooter?: boolean;
}

export function LegendPieChart({
  data,
  config,
  dataKey,
  nameKey,
  title = "Pie Chart",
  description = "January - June 2024",
  footerText = "Showing total visitors for the last 6 months",
  trendText = "Trending up by 5.2% this month",
  className = "",
  showTrend = true,
  showLabel = false,
  withFilters = false,
  showFooter = false,
}: Props) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>(
    data.map((d) => d.key)
  );

  const toggleKey = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const filteredData = data.filter((d) => selectedKeys.includes(d.key));
  return (
    <Card className={`flex flex-col shadow-none rounded-sm ${className}`}>
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={withFilters ? filteredData : data}
              dataKey={dataKey}
              nameKey={nameKey}
              label={showLabel}
            />
            <ChartLegend
              content={<ChartLegendContent nameKey={nameKey} />}
              className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center"
            />
          </PieChart>
        </ChartContainer>

        {/* Checkbox filters */}
        {withFilters && (
          <div className="mt-4 flex flex-wrap gap-4 justify-center">
            {data.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <Checkbox
                  id={`chk-${d.key}`}
                  checked={selectedKeys.includes(d.key)}
                  onCheckedChange={() => toggleKey(d.key)}
                />
                <Label htmlFor={`chk-${d.key}`} className="text-sm">
                  {config[d.key]?.label ?? d.key}
                </Label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {showFooter && (
        <CardFooter className="flex-col gap-2 text-sm">
          {showTrend && (
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendText} <TrendingUp className="h-4 w-4" />
            </div>
          )}
          <div className="text-muted-foreground leading-none">{footerText}</div>
        </CardFooter>
      )}
    </Card>
  );
}
