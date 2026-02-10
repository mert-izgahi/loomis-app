// components/charts/diverging-bar-chart.tsx
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine, Cell, ResponsiveContainer } from "recharts"

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

export interface DivergingBarChartDataType {
    name: string
    [key: string]: string | number
}

interface Props {
    data: DivergingBarChartDataType[]
    config: ChartConfig
    nameKey: string
    leftBarKey: string
    rightBarKey: string
    title?: string
    description?: string
    footerText?: string
    trendText?: string
    className?: string
    showTrend?: boolean
    showGrid?: boolean
    showXAxis?: boolean
    showYAxis?: boolean
    height?: number
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
    xAxisFormatter?: (value: number) => string
    yAxisWidth?: number
    barSize?: number
    // Radius props for left and right bars
    leftBarRadius?: [number, number, number, number] // [top-left, top-right, bottom-right, bottom-left]
    rightBarRadius?: [number, number, number, number] // [top-left, top-right, bottom-right, bottom-left]
    referenceLine?: number
    stackOffset?: 'none' | 'expand' | 'wiggle' | 'silhouette' | 'sign'
    domainPadding?: number
    leftBarLabel?: string
    rightBarLabel?: string
    showReferenceLine?: boolean
    referenceLineProps?: any
    customTooltip?: React.ComponentType<any>
}

export function DivergingBarChart({
    data,
    config,
    nameKey = "name",
    leftBarKey,
    rightBarKey,
    title = "Diverging Bar Chart",
    description = "Chart showing comparison between two categories",
    footerText = "Showing comparison between categories",
    trendText = "Comparison analysis",
    className = "",
    showTrend = true,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    height = 400,
    margin = { top: 5, right: 30, left: 20, bottom: 5 },
    xAxisFormatter = (value) => Math.abs(value).toString(),
    yAxisWidth = 80,
    barSize = 40,
    leftBarRadius = [0, 4, 4, 0],
    rightBarRadius = [0, 4, 4, 0],
    referenceLine = 0,
    stackOffset = "sign",
    domainPadding = 50,
    leftBarLabel,
    rightBarLabel,
    showReferenceLine = true,
    referenceLineProps = { stroke: "#ccc", strokeWidth: 2 },
    customTooltip
}: Props) {

    // Calculate domain based on data
    const allValues = data.flatMap(item => [
        Number(item[leftBarKey]),
        Number(item[rightBarKey])
    ])
    const dataMin = Math.min(...allValues)
    const dataMax = Math.max(...allValues)

    const domain = [
        Math.min(dataMin, -Math.abs(dataMax)) - domainPadding,
        Math.max(dataMax, Math.abs(dataMin)) + domainPadding
    ]

    return (
        <Card className={cn("shadow-none rounded-sm", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config} className="h-full w-full">
                    <ResponsiveContainer width="100%" height={height}>
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={margin}
                            stackOffset={stackOffset}
                        >
                            {showGrid && (
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    horizontal={true}
                                    vertical={false}
                                />
                            )}
                            {showXAxis && (
                                <XAxis
                                    type="number"
                                    tickFormatter={xAxisFormatter}
                                    domain={domain}
                                    axisLine={false}
                                    tickLine={false}
                                />
                            )}
                            {showYAxis && (
                                <YAxis
                                    dataKey={nameKey}
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={10}
                                    width={yAxisWidth}
                                />
                            )}
                            {showReferenceLine && (
                                <ReferenceLine x={referenceLine} {...referenceLineProps} />
                            )}
                            <ChartTooltip
                                content={customTooltip ? customTooltip as any : ChartTooltipContent}
                            />



                            {/* Left Bar (Negative side) */}
                            <Bar
                                dataKey={leftBarKey}
                                fill={`var(--color-${leftBarKey})`}
                                stackId="stack"
                                radius={leftBarRadius}
                                name={leftBarLabel || leftBarKey}
                                barSize={barSize}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-left-${index}`} fill={`var(--color-${leftBarKey})`} />
                                ))}
                            </Bar>

                            {/* Right Bar (Positive side) */}
                            <Bar
                                dataKey={rightBarKey}
                                fill={`var(--color-${rightBarKey})`}
                                stackId="stack"
                                radius={rightBarRadius}
                                name={rightBarLabel || rightBarKey}
                                barSize={barSize}
                            >
                                {data.map((_, index) => (
                                    <Cell key={`cell-right-${index}`} fill={`var(--color-${rightBarKey})`} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start justify-end h-full gap-2 text-sm">
                {showTrend && (
                    <div className="flex gap-2 leading-none font-medium">
                        {trendText} <TrendingUp className="h-4 w-4" />
                    </div>
                )}
                <div className="text-muted-foreground leading-none mt-auto">
                    {footerText}
                </div>
            </CardFooter>
        </Card>
    )
}

// Custom tooltip component for diverging bars
export function DivergingBarTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-background border rounded-lg p-3 shadow-sm">
                <p className="font-medium">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p
                        key={index}
                        className="text-sm"
                        style={{ color: entry.color }}
                    >
                        {entry.name}: {Math.abs(entry.value)}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default DivergingBarChart