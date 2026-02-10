// components/charts/default-horizontal-bar-chart.tsx
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"
import { useScreenSize } from "@/hooks/use-screen-size"

export interface HorizontalBarChartDataType {
    [key: string]: string | number
}

interface Props {
    data: HorizontalBarChartDataType[]
    config: ChartConfig
    nameKey: string
    valueKey: string
    title?: string
    description?: string
    footerText?: string
    trendText?: string
    className?: string
    showTrend?: boolean
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    showLabelList?: boolean
    color?: string
    barSize?: number
    height?: number
    minChartHeight?: number
    maxChartHeight?: number
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
    labelFormatter?: (value: number) => string
    tooltipFormatter?: (value: number, payload: HorizontalBarChartDataType) => React.ReactNode[]
    truncateName?: (name: string, isMobile: boolean, isLargeScreen: boolean) => string
    yAxisWidth?: number
    barRadius?: [number, number, number, number]
    unit?: string
}

export function DefaultHorizontalBarChart({
    data,
    config,
    nameKey,
    valueKey,
    title = "Horizontal Bar Chart",
    description = "Chart showing values by category",
    footerText = "Showing total values across all categories",
    trendText = "Trending up this period",
    className = "",
    showTrend = true,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    showLabelList = true,
    color = "var(--chart-1)",
    barSize = 30,
    height = 400,
    minChartHeight = 200,
    maxChartHeight = 1200,
    margin = { top: 10, right: 30, left: 0, bottom: 10 },
    labelFormatter = (value) => value.toString(),
    tooltipFormatter,
    truncateName,
    yAxisWidth,
    barRadius = [0, 4, 4, 0],
    unit = ""
}: Props) {
    const { isLargeScreen, isMobile } = useScreenSize()

    const itemCount = data.length
    

    // Calculate dynamic chart height
    const chartHeight = Math.max(
        minChartHeight,
        Math.min(itemCount * barSize + 120, maxChartHeight, height)
    )

    // Default truncation function
    const defaultTruncate = (name: string) => {
        if (isLargeScreen) return name.length > 20 ? `${name.slice(0, 20)}...` : name
        if (isMobile) return name.length > 12 ? `${name.slice(0, 12)}...` : name
        return name.length > 16 ? `${name.slice(0, 16)}...` : name
    }

    const finalTruncate = truncateName
        ? (name: string) => truncateName(name, isMobile, isLargeScreen)
        : defaultTruncate

    // Default tooltip formatter
    const defaultTooltipFormatter = (value: number, payload: HorizontalBarChartDataType) => [
        `${value}${unit ? ` ${unit}` : ''}`,
        payload[nameKey] as string
    ]

    return (
        <Card className={cn("shadow-none rounded-sm", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="w-full" style={{ height: chartHeight }}>
                    <BarChart
                        data={data}
                        layout="vertical"
                        margin={margin}
                        height={chartHeight}
                    >
                        {showGrid && <CartesianGrid horizontal={false} />}
                        {showXAxis && (
                            <XAxis
                                type="number"
                                dataKey={valueKey}
                                axisLine={false}
                                tickLine={false}
                                tickMargin={8}
                                hide={!isLargeScreen}
                            />
                        )}
                        {showYAxis && (
                            <YAxis
                                type="category"
                                dataKey={nameKey}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                                width={yAxisWidth || (isLargeScreen ? 140 : isMobile ? 100 : 90)}
                                tickFormatter={finalTruncate}
                                className="text-xs"
                            />
                        )}
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            content={
                                <ChartTooltipContent
                                    hideLabel
                                    formatter={(value, _, props) => {
                                        const payload = props.payload as HorizontalBarChartDataType
                                        return tooltipFormatter
                                            ? tooltipFormatter(value as number, payload)
                                            : defaultTooltipFormatter(value as number, payload)
                                    }}
                                />
                            }
                        />
                        <Bar
                            dataKey={valueKey}
                            fill={color}
                            radius={barRadius}
                            minPointSize={2}
                            barSize={barSize}
                        >
                            {showLabelList && (
                                <LabelList
                                    dataKey={valueKey}
                                    position="right"
                                    className="fill-foreground text-xs"
                                    formatter={labelFormatter}
                                />
                            )}
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                {showTrend && (
                    <div className="flex gap-2 leading-none font-medium">
                        {trendText} <TrendingUp className="h-4 w-4" />
                    </div>
                )}
                <div className="text-muted-foreground leading-none">
                    {footerText}
                </div>
            </CardFooter>
        </Card>
    )
}

export default DefaultHorizontalBarChart