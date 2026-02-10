"use client";

import { TrendingUp } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

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

export interface BarChartDataType {
  [key: string]: string | number;
}

interface Props {
  data: BarChartDataType[];
  config: ChartConfig;
  xAxisKey: string;
  barKeys: string[];
  title?: string;
  description?: string;
  footerText?: string;
  trendText?: string;
  className?: string;
  showTrend?: boolean;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showLabelList?: boolean;
  barSize?: number;
  height?: number;
  margin?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
  hideLabel?: boolean;
  labelFormatter?: (value: number) => string;
  tooltipFormatter?: (
    value: number,
    name: string,
    props: any
  ) => React.ReactNode[];
  xAxisFormatter?: (value: any) => string;
  yAxisFormatter?: (value: any) => string;
  barRadius?: number | [number, number, number, number];
  unit?: string;
  maxBarSize?: number;
  stack?: boolean;
  filters?: React.ReactNode;
  emptyState?: React.ReactNode;
  isEmpty?: boolean;
}

export function DefaultBarChart({
  data,
  config,
  xAxisKey,
  barKeys,
  title = "Bar Chart",
  description = "Chart showing values across categories",
  footerText = "Showing total values across all categories",
  trendText = "Trending up this period",
  className = "",
  showTrend = true,
  showGrid = true,
  showXAxis = true,
  showYAxis = true,
  showLabelList = false,
  barSize = 40,
  height = 300,
  margin = { top: 20, right: 30, left: 20, bottom: 60 },
  hideLabel = false,
  labelFormatter = (value) => value.toString(),
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
  barRadius = 4,
  unit = "",
  maxBarSize = 100,
  stack = false,
  filters = null,
}: Props) {
  const total = data.reduce((acc, item) => {
    return acc + barKeys.reduce((sum, key) => sum + (item[key] as number), 0);
  }, 0);

  // Fixed tooltip formatter that handles payload correctly
  const defaultTooltipFormatter = (value: number, name: string, props: any) => {
    if (props && props.payload) {
      // Try to get the xAxis value from the payload
      const payloadItem = Array.isArray(props.payload)
        ? props.payload[0]?.payload
        : props.payload;
      if (payloadItem && payloadItem[xAxisKey]) {
        name = payloadItem[xAxisKey] as string;
      }
    }

    const configLabel = config[name]?.label || name;

    return [`${value} - ${unit ? ` ${unit}` : ""}`, configLabel];
  };

  return (
    <Card className={cn("shadow-none rounded-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex flex-col gap-2">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {filters && filters}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart
            accessibilityLayer
            data={data}
            margin={margin}
            height={height}
            barSize={barSize}
            barGap={stack ? 0 : 4}
          >
            {showGrid && <CartesianGrid vertical={false} />}
            {showXAxis && (
              <XAxis
                dataKey={xAxisKey}
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                angle={-45}
                textAnchor="end"
                height={50}
                tickFormatter={xAxisFormatter}
                interval={0}
              />
            )}
            {showYAxis && (
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={yAxisFormatter}
              />
            )}
            <ChartTooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              content={
                <ChartTooltipContent
                  hideLabel={hideLabel}
                  formatter={(value, name, props) => {
                    return tooltipFormatter
                      ? tooltipFormatter(Number(value), name as string, props)
                      : defaultTooltipFormatter(
                          Number(value),
                          name as string,
                          props
                        );
                  }}
                />
              }
            />
            {barKeys.map((key) => (
              <Bar
                key={key}
                dataKey={key}
                fill={`var(--color-${key})`}
                radius={barRadius}
                maxBarSize={maxBarSize}
                stackId={stack ? "stack" : undefined}
              >
                {showLabelList && (
                  <LabelList
                    dataKey={key}
                    position="top"
                    className="fill-foreground text-xs"
                    formatter={labelFormatter}
                  />
                )}
              </Bar>
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        {showTrend && (
          <div className="flex gap-2 leading-none font-medium">
            {trendText} <TrendingUp className="h-4 w-4" />
          </div>
        )}
        <div className="text-muted-foreground leading-none">{footerText}</div>
      </CardFooter>
    </Card>
  );
}

export default DefaultBarChart;
