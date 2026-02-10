"use client";

import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface AreaChartDataType {
  [key: string]: string | number;
}

interface Props {
  data: AreaChartDataType[];
  config: ChartConfig;
  xAxisKey: string;
  areaKeys: string[];
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  className?: string;
  showTrend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  areaType?: "natural" | "linear" | "monotone" | "step";
  fillOpacity?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  animationDelay?: number;
  animationDuration?: number;
  threshold?: number; // How much of the component should be visible to trigger
  animateFrom?: "left" | "right" | "bottom"; // What direction should the animation come from
  withFilters?: boolean;
}

export function DefaultAreaChart({
  data,
  config,
  xAxisKey,
  areaKeys,
  title = "Area Chart",
  description = "Showing total visitors for the last 6 months",
  footerText = "January - June 2024",
  trendText = "Trending up by 5.2% this month",
  className = "",
  showTrend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = false,
  areaType = "natural",
  fillOpacity = 0.4,
  height = 300,
  margin = { left: 12, right: 12, top: 12, bottom: 12 },
  withFilters = false,
}: Props) {
  const [selectedKey, setSelectedKey] = useState("all");

  // Filter the data to only show the selected key when withFilters is enabled
  const displayedAreaKeys = withFilters
    ? selectedKey === "all"
      ? areaKeys
      : [selectedKey]
    : areaKeys;

  return (
    <Card className={cn("shadow-none rounded-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {/* Filter Select */}
        {withFilters && (
          <Select
            defaultValue={selectedKey}
            onValueChange={(val) => setSelectedKey(val)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select dataset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {areaKeys.map((key) => (
                <SelectItem key={key} value={key}>
                  {config[key]?.label ?? key}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <AreaChart
            accessibilityLayer
            data={data}
            margin={margin}
            height={height}
          >
            {showGrid && <CartesianGrid vertical={false} />}
            {showXAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
            )}
            {showYAxis && (
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            {displayedAreaKeys.map((key) => (
              <Area
                key={key}
                dataKey={key}
                type={areaType}
                fill={`var(--color-${key})`}
                fillOpacity={fillOpacity}
                stroke={`var(--color-${key})`}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            {showTrend && (
              <div className="flex items-center gap-2 leading-none font-medium">
                {trendText} <TrendingUp className="h-4 w-4" />
              </div>
            )}
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {footerText}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
