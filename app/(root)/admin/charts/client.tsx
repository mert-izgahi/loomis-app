"use client";

import React from "react";
import {
  DefaultPieChart,
  PieChartDataType,
} from "@/components/charts/pie-chart/default";
import { LabelListPieChart } from "@/components/charts/pie-chart/label-list-pie-chart";
import Container from "@/components/layouts/container";
import { ChartConfig } from "@/components/ui/chart";
import { LegendPieChart } from "@/components/charts/pie-chart/legend-pie-chart";
import { DonutPieChart } from "@/components/charts/pie-chart/donut-pie-chart";
import { Separator } from "@/components/ui/separator";
import {
  AreaChartDataType,
  DefaultAreaChart,
} from "@/components/charts/area-chart/default";
import {
  DefaultLineChart,
  LineChartDataType,
} from "@/components/charts/line-chart/default";
import {
  AnimatedCard,
  AnimatedCardsContainer,
} from "@/components/shared/animated";
import DefaultBarChart from "@/components/charts/bar-chart/default";
import DefaultHorizontalBarChart from "@/components/charts/bar-chart/horizontal-bar-chart";
import DivergingBarChart, {
  DivergingBarTooltip,
} from "@/components/charts/bar-chart/diverging-bar-chart";

const pieChartData = [
  { key: "chrome", value: 275, fill: "var(--color-chrome)" },
  { key: "safari", value: 200, fill: "var(--color-safari)" },
  { key: "firefox", value: 187, fill: "var(--color-firefox)" },
  { key: "edge", value: 173, fill: "var(--color-edge)" },
  { key: "other", value: 90, fill: "var(--color-other)" },
] as PieChartDataType[];

const pieChartConfig = {
  value: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

const areaChatData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
] as AreaChartDataType[];

const areaChatConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const comparisonData = [
  { month: "Jan", current: 186, previous: 150 },
  { month: "Feb", current: 305, previous: 280 },
  { month: "Mar", current: 237, previous: 220 },
  { month: "Apr", current: 73, previous: 65 },
  { month: "May", current: 209, previous: 190 },
  { month: "Jun", current: 214, previous: 200 },
] as AreaChartDataType[];

const comparisonConfig = {
  current: {
    label: "2024",
    color: "var(--chart-1)",
  },
  previous: {
    label: "2023",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const stackedData = [
  { month: "January", desktop: 186, mobile: 80, other: 45 },
  { month: "February", desktop: 305, mobile: 200, other: 100 },
  { month: "March", desktop: 237, mobile: 120, other: 150 },
  { month: "April", desktop: 73, mobile: 190, other: 50 },
  { month: "May", desktop: 209, mobile: 130, other: 100 },
  { month: "June", desktop: 214, mobile: 140, other: 160 },
];

const stackedConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  other: {
    label: "Other",
    color: "var(--chart-3)",
  },
};

const lineChartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
] as LineChartDataType[];

const lineChartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

// const comparisonLineChatData = [
//     { month: "Jan", current: 186, previous: 150 },
//     { month: "Feb", current: 305, previous: 280 },
//     { month: "Mar", current: 237, previous: 220 },
//     { month: "Apr", current: 73, previous: 65 },
//     { month: "May", current: 209, previous: 190 },
//     { month: "Jun", current: 214, previous: 200 },
// ] as LineChartDataType[]

const comparisonLineChatConfig = {
  current: {
    label: "2024",
    color: "var(--chart-1)",
  },
  previous: {
    label: "2023",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const advancedLineChatData = [
  { week: "W1", users: 1000, revenue: 5000, conversions: 100 },
  { week: "W2", users: 1200, revenue: 6200, conversions: 124 },
  { week: "W3", users: 1100, revenue: 5800, conversions: 116 },
  { week: "W4", users: 1400, revenue: 7500, conversions: 150 },
] as LineChartDataType[];

const advancedLineChatConfig = {
  users: { label: "Active Users", color: "var(--chart-1)" },
  revenue: { label: "Revenue ($)", color: "var(--chart-2)" },
  conversions: { label: "Conversions", color: "var(--chart-3)" },
} satisfies ChartConfig;

const barChartData = [
  { month: "Jan", current: 186, previous: 150 },
  { month: "Feb", current: 305, previous: 280 },
  { month: "Mar", current: 237, previous: 220 },
  { month: "Apr", current: 73, previous: 65 },
  { month: "May", current: 209, previous: 190 },
  { month: "Jun", current: 214, previous: 200 },
] as AreaChartDataType[];

const barChartConfig = {
  current: {
    label: "2024",
    color: "var(--chart-1)",
  },
  previous: {
    label: "2023",
    color: "var(--chart-2)",
  },
};

// Sample data
const horizontalBarData = [
  { category: "Product A", value: 275 },
  { category: "Product B", value: 200 },
  { category: "Product C", value: 187 },
  { category: "Product D", value: 173 },
  { category: "Product E", value: 90 },
];

// Config for the chart
const horizontalBarConfig = {
  value: {
    label: "Sales",
    color: "hsl(var(--chart-1))",
  },
};

const divergingData = [
  { name: "18-24", male: -50, female: 60 },
  { name: "25-34", male: -45, female: 55 },
  { name: "35-44", male: -40, female: 50 },
  { name: "45-54", male: -35, female: 45 },
  { name: "55-64", male: -30, female: 40 },
  { name: "65+", male: -25, female: 35 },
];

const chartConfig = {
  male: {
    label: "Erkekler",
    color: "var(--chart-1)",
  },
  female: {
    label: "Kadınlar",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;
function ChartsPage() {
  return (
    <Container className="flex flex-col gap-y-12">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Pie Charts</h1>
          <p className="text-muted-foreground text-xs">Örnek Chart Modelleri</p>
        </div>

        <AnimatedCardsContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedCard>
            <DefaultPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Default Pie Chart"
              description="Default Pie Chart"
            />
          </AnimatedCard>

          <AnimatedCard>
            <LabelListPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Label List Pie Chart"
              description="Label List Pie Chart"
              formatter={(value) => `${value}`}
            />
          </AnimatedCard>

          <AnimatedCard>
            <LegendPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Legend Pie Chart"
              description="Legend Pie Chart"
            />
          </AnimatedCard>

          <AnimatedCard>
            <DonutPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Donut Pie Chart"
              description="Donut Pie Chart"
              showLabel
              innerRadius={70}
              strokeWidth={2}
            />
          </AnimatedCard>

          <AnimatedCard>
            <DonutPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Donut Pie Chart With Active Index"
              description="Donut Pie Chart With Active Index"
              showLabel
              innerRadius={70}
              strokeWidth={2}
              activeIndex={2}
            />
          </AnimatedCard>

          <AnimatedCard>
            <DefaultPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Default Pie Chart"
              description="Default Pie Chart"
              withFilters
            />
          </AnimatedCard>
          <AnimatedCard>
            <DonutPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Donut Pie Chart"
              description="Donut Pie Chart"
              showLabel
              innerRadius={70}
              strokeWidth={2}
              withFilters
            />
          </AnimatedCard>

          <AnimatedCard>
            <DonutPieChart
              data={pieChartData}
              config={pieChartConfig}
              dataKey="value"
              nameKey="key"
              title="Donut Pie Chart With Active Index"
              description="Donut Pie Chart With Active Index"
              showLabel
              innerRadius={70}
              strokeWidth={2}
              activeIndex={2}
              withFilters
            />
          </AnimatedCard>
        </AnimatedCardsContainer>
      </div>

      <Separator />

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Area Charts</h1>
          <p className="text-muted-foreground text-xs">Örnek Chart Modelleri</p>
        </div>

        <AnimatedCardsContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatedCard>
            <DefaultAreaChart
              data={areaChatData}
              config={areaChatConfig}
              xAxisKey="month"
              areaKeys={["desktop"]}
              title="Default Area Chart - Linear Single Area"
              description="Default Area Chart - Linear Single Area"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="linear"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              animateFrom="left" // 👈 animate from left, right, or bottom
              animationDelay={0.2}
              animationDuration={0.8}
            />
          </AnimatedCard>
          <AnimatedCard>
            <DefaultAreaChart
              data={areaChatData}
              config={areaChatConfig}
              xAxisKey="month"
              areaKeys={["desktop"]}
              title="Default Area Chart - Monotone Single Area"
              description="Default Area Chart - Monotone Single Area"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="monotone"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            />
          </AnimatedCard>
          <AnimatedCard>
            <DefaultAreaChart
              data={areaChatData}
              config={areaChatConfig}
              xAxisKey="month"
              areaKeys={["desktop"]}
              title="Default Area Chart - Natural Single Area"
              description="Default Area Chart - Natural Single Area"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="natural"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            />
          </AnimatedCard>
          <AnimatedCard>
            <DefaultAreaChart
              data={areaChatData}
              config={areaChatConfig}
              xAxisKey="month"
              areaKeys={["desktop"]}
              title="Default Area Chart - Step Single Area"
              description="Default Area Chart - Step Single Area"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="step"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
            />
          </AnimatedCard>
          <AnimatedCard>
            <DefaultAreaChart
              data={comparisonData}
              config={comparisonConfig}
              xAxisKey="month"
              areaKeys={["current", "previous"]}
              title="Comparison Area Chart - Linear Comparison Area Chart"
              description="Comparison Area Chart - Linear Comparison Area Chart"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="linear"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              withFilters
            />
          </AnimatedCard>
          <AnimatedCard>
            <DefaultAreaChart
              data={stackedData}
              config={stackedConfig}
              xAxisKey="month"
              areaKeys={["desktop", "mobile", "other"]}
              title="Stacked Area Chart - Linear Comparison Area Chart"
              description="Stacked Area Chart - Linear Comparison Area Chart"
              footerText="Showing total visitors for the last 6 months"
              trendText="Trending up by 5.2% this month"
              showTrend
              showGrid
              showXAxis
              showYAxis
              areaType="linear"
              fillOpacity={0.8}
              height={300}
              margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
              withFilters
            />
          </AnimatedCard>
        </AnimatedCardsContainer>
      </div>

      <Separator />

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Line Charts</h1>
          <p className="text-muted-foreground text-xs">Örnek Chart Modelleri</p>
        </div>

        <AnimatedCardsContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DefaultLineChart
            data={lineChartData}
            config={lineChartConfig}
            xAxisKey="month"
            lineKeys={["desktop"]}
            title="Line Chart - Default Line Chart"
            description="Default Line Chart"
          />
          <DefaultLineChart
            data={lineChartData}
            config={lineChartConfig}
            xAxisKey="month"
            lineKeys={["desktop"]}
            title="Line Chart - Step Line Chart"
            description="Step Line Chart"
            lineType="step"
          />
          <DefaultLineChart
            data={lineChartData}
            config={lineChartConfig}
            xAxisKey="month"
            lineKeys={["desktop"]}
            title="Line Chart - Monotone Line Chart"
            description="Monotone Line Chart"
            lineType="linear"
          />

          <DefaultLineChart
            data={comparisonData}
            config={comparisonLineChatConfig}
            xAxisKey="month"
            lineKeys={["current", "previous"]}
            title="Comparison Line Chart"
            description="Comparison Line Chart- Linear Comparison Line Chart"
            trendText="15% growth compared to last year"
            strokeWidth={3}
          />

          <DefaultLineChart
            data={comparisonData}
            config={comparisonLineChatConfig}
            xAxisKey="month"
            lineKeys={["current", "previous"]}
            title="Comparison Line Chart"
            description="Comparison Line Chart- Step Comparison Line Chart"
            trendText="15% growth compared to last year"
            strokeWidth={3}
            lineType="step"
          />

          <DefaultLineChart
            data={comparisonData}
            config={comparisonLineChatConfig}
            xAxisKey="month"
            lineKeys={["current", "previous"]}
            title="Comparison Line Chart"
            description="Comparison Line Chart- Step Comparison Line Chart"
            trendText="15% growth compared to last year"
            strokeWidth={3}
            showGrid
            showXAxis
            showYAxis
            showDots
          />

          <DefaultLineChart
            data={advancedLineChatData}
            config={advancedLineChatConfig}
            xAxisKey="week"
            lineKeys={["users", "revenue", "conversions"]}
            title="Weekly Performance Metrics"
            description="Key metrics trend over the month"
            trendText="Overall growth of 25% this month"
            footerText="January 2024 performance data"
            showYAxis={true}
            className="w-full"
          />
        </AnimatedCardsContainer>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Bar Charts</h1>
          <p className="text-muted-foreground text-xs">Örnek Chart Modelleri</p>
        </div>

        <AnimatedCardsContainer className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DefaultBarChart
            data={barChartData}
            config={barChartConfig}
            xAxisKey="month"
            barKeys={["current", "previous"]}
            title="Bar Chart - Monthly Comparison"
            description="Comparing 2024 vs 2023 data"
          />

          <DefaultHorizontalBarChart
            data={horizontalBarData}
            config={horizontalBarConfig}
            nameKey="category"
            valueKey="value"
            title="Product Sales"
            description="Sales by product category"
          />

          <DefaultHorizontalBarChart
            data={horizontalBarData}
            config={horizontalBarConfig}
            nameKey="category"
            valueKey="value"
            title="Product Sales Performance"
            description="Top performing products this quarter"
            footerText="Showing total sales across all products"
            trendText="Sales increased by 12% this quarter"
            showTrend={true}
            showLabelList={true}
            barSize={40}
            unit="units"
            color="var(--chart-3)"
            labelFormatter={(value) => `${value}k`}
            tooltipFormatter={(value, payload) => [
              `${value} units sold`,
              payload.category as string,
            ]}
            truncateName={(name, isMobile, isLargeScreen) => {
              const maxLength = isLargeScreen ? 25 : isMobile ? 10 : 15;
              return name.length > maxLength
                ? `${name.slice(0, maxLength)}...`
                : name;
            }}
            yAxisWidth={120}
            barRadius={[0, 8, 8, 0]}
            minChartHeight={300}
            maxChartHeight={600}
          />

          <DivergingBarChart
            data={divergingData}
            config={chartConfig}
            nameKey="name"
            leftBarKey="male"
            rightBarKey="female"
            title="Yaş Gruplarına Göre Cinsiyet Dağılımı"
            description="Erkek ve kadınların yaş gruplarına göre karşılaştırması"
            leftBarLabel="Erkekler"
            rightBarLabel="Kadınlar"
            height={400}
            customTooltip={DivergingBarTooltip}
          />
        </AnimatedCardsContainer>
      </div>
    </Container>
  );
}

export default ChartsPage;
