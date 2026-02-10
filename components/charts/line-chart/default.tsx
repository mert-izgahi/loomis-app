"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

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
import { useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface LineChartDataType {
    [key: string]: string | number
}

interface Props {
    data: LineChartDataType[]
    config: ChartConfig
    xAxisKey: string
    lineKeys: string[]
    title?: string
    description?: string
    footerText?: string
    trendText?: string
    className?: string
    showTrend?: boolean
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    lineType?: 'natural' | 'linear' | 'monotone' | "step"
    strokeWidth?: number
    showDots?: boolean
    height?: number
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
    hideLabel?: boolean
    withFilters?: boolean
}

export function DefaultLineChart({
    data,
    config,
    xAxisKey,
    lineKeys,
    title = "Line Chart",
    description = "January - June 2024",
    footerText = "Showing total visitors for the last 6 months",
    trendText = "Trending up by 5.2% this month",
    className = "",
    showTrend = true,
    showGrid = true,
    showXAxis = true,
    showYAxis = false,
    lineType = 'natural',
    strokeWidth = 2,
    showDots = false,
    height = 300,
    margin = { left: 12, right: 12, top: 12, bottom: 12 },
    hideLabel = false,
    withFilters = false
}: Props) {
    const [selectedKey, setSelectedKey] = useState("all");

    // Filter the data to only show the selected key when withFilters is enabled
    const displayedLineKeys = withFilters 
        ? (selectedKey === "all" ? lineKeys : [selectedKey])
        : lineKeys;
    
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
                            <SelectItem value="all">All</SelectItem>
                            {lineKeys.map((key) => (
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
                    <LineChart
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
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                            />
                        )}
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel={hideLabel} />}
                        />
                        {displayedLineKeys.map((key) => (
                            <Line
                                key={key}
                                dataKey={key}
                                type={lineType}
                                stroke={`var(--color-${key})`}
                                strokeWidth={strokeWidth}
                                dot={showDots}
                            />
                        ))}
                    </LineChart>
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