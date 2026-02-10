// components/charts/multi-bar-chart.tsx
"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Legend } from "recharts"

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

export interface MultiBarChartDataType {
    [key: string]: string | number
}

export interface RawMultiBarDataItem {
    [key: string]: string | number
}

interface Props {
    data: RawMultiBarDataItem[]
    primaryCategoryKey: string
    secondaryCategoryKey: string
    valueKey: string
    config: ChartConfig
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
    showLegend?: boolean
    barSize?: number
    height?: number
    margin?: {
        top?: number
        right?: number
        bottom?: number
        left?: number
    }
    hideLabel?: boolean
    labelListPosition?: "top" | "bottom" | "left" | "right"
    labelFormatter?: (value: number) => string
    tooltipFormatter?: (value: number, name: string, props: any) => React.ReactNode[]
    xAxisFormatter?: (value: any) => string
    yAxisFormatter?: (value: any) => string
    barRadius?: number | [number, number, number, number]
    unit?: string
    maxBarSize?: number
    stack?: boolean
    barGap?: number | string
    angle?: number
    textAnchor?: "start" | "middle" | "end"
    transformData?: (data: RawMultiBarDataItem[], primaryKey: string, secondaryKey: string, valueKey: string) => MultiBarChartDataType[]
}

export function MultiBarChart({
    data,
    primaryCategoryKey,
    secondaryCategoryKey,
    valueKey,
    config,
    title = "Multi Bar Chart",
    description = "Chart showing values across multiple categories",
    footerText = "Showing total values across all categories",
    trendText = "Trending up this period",
    className = "",
    showTrend = true,
    showGrid = true,
    showXAxis = true,
    showYAxis = true,
    showLabelList = false,
    showLegend = true,
    barSize = 40,
    height = 300,
    margin = { top: 20, right: 30, left: 20, bottom: 60 },
    hideLabel = false,
    labelFormatter = (value) => value.toString(),
    tooltipFormatter,
    xAxisFormatter,
    yAxisFormatter,
    barRadius = 0,
    unit = "",
    maxBarSize = 100,
    stack = false,
    barGap = 4,
    angle = 0,
    labelListPosition = "top",
    textAnchor = "middle",
    transformData
}: Props) {

    // Default data transformation function
    const defaultTransformData = (
        rawData: RawMultiBarDataItem[],
        primaryKey: string,
        secondaryKey: string,
        valueKey: string
    ): MultiBarChartDataType[] => {
        const groupedData: { [key: string]: any } = {}
        rawData.forEach(item => {
            const primaryValue = item[primaryKey] as string
            const secondaryValue = item[secondaryKey] as string
            const value = Number(item[valueKey]) || 0

            if (!groupedData[primaryValue]) {
                groupedData[primaryValue] = { [primaryKey]: primaryValue }
            }

            // Create a safe key name for the secondary category
            const safeKey = secondaryValue.toString().replace(/\s+/g, '_')
            groupedData[primaryValue][safeKey] = value
        })

        return Object.values(groupedData)
    }

    // Get unique secondary keys for bar series
    const getBarKeys = (): string[] => {
        const uniqueKeys = [...new Set(data.map(item => item[secondaryCategoryKey] as string))]
        return uniqueKeys.map(key => key.toString().replace(/\s+/g, '_'))
    }

    // Transform data
    const transformedData = transformData
        ? transformData(data, primaryCategoryKey, secondaryCategoryKey, valueKey)
        : defaultTransformData(data, primaryCategoryKey, secondaryCategoryKey, valueKey)

    const barKeys = getBarKeys()

    // Calculate total for footer
    const total = data.reduce((acc, item) => acc + (Number(item[valueKey]) || 0), 0)

    // Default tooltip formatter
    const defaultTooltipFormatter = (value: number, name: string) => {
        const configEntry = config[name as keyof typeof config]
        const displayName = configEntry?.label || name.replace(/_/g, ' ')
        return [`${value}${unit ? ` ${unit}` : ''}`, displayName]
    }

    return (
        <Card className={cn("shadow-none rounded-sm", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={config}>
                    <BarChart
                        accessibilityLayer
                        data={transformedData}
                        margin={margin}
                        height={height}
                        barSize={barSize}
                        barGap={stack ? 0 : barGap}
                    >
                        {showGrid && <CartesianGrid vertical={false} />}
                        {showXAxis && (
                            <XAxis
                                dataKey={primaryCategoryKey}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                angle={angle}
                                textAnchor={textAnchor}
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
                        {showLegend && (
                            <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(value) => {
                                    const configEntry = config[value as keyof typeof config]
                                    return configEntry?.label || value.toString().replace(/_/g, ' ')
                                }}
                            />
                        )}
                        <ChartTooltip
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            content={
                                <ChartTooltipContent
                                    hideLabel={hideLabel}
                                    formatter={(value, name, props) => {
                                        if (tooltipFormatter) {
                                            return tooltipFormatter(Number(value), name as string, props)
                                        }
                                        return defaultTooltipFormatter(Number(value), name as string)
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
                                        position={labelListPosition}
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
                <div className="text-muted-foreground leading-none">
                    {footerText || `Toplam: ${total}${unit ? ` ${unit}` : ''}`}
                </div>
            </CardFooter>
        </Card>
    )
}

// Utility function for external use
export function transformMultiBarData(
    data: RawMultiBarDataItem[],
    primaryKey: string,
    secondaryKey: string,
    valueKey: string
): MultiBarChartDataType[] {
    const groupedData: { [key: string]: any } = {}

    data.forEach(item => {
        const primaryValue = item[primaryKey] as string
        const secondaryValue = item[secondaryKey] as string
        const value = Number(item[valueKey]) || 0

        if (!groupedData[primaryValue]) {
            groupedData[primaryValue] = { [primaryKey]: primaryValue }
        }

        const safeKey = secondaryValue.toString().replace(/\s+/g, '_')
        groupedData[primaryValue][safeKey] = value
    })

    return Object.values(groupedData)
}

export function getUniqueSecondaryKeys(
    data: RawMultiBarDataItem[],
    secondaryKey: string
): string[] {
    const uniqueKeys = [...new Set(data.map(item => item[secondaryKey] as string))]
    return uniqueKeys.map(key => key.toString().replace(/\s+/g, '_'))
}

export default MultiBarChart