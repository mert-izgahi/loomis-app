# Chart Usage Guide

## Pie Chart

```tsx
// ========== PIE CHART - Utils ==========
const statusKeys = Array.from(new Set(reports.map((r) => r.status)));
const pieConfig = buildChartConfig(statusKeys);
const pieData = formatPieChartData(reports, "status", pieConfig);


<DefaultPieChart
        data={pieData}
        config={pieConfig}
        dataKey="value"
        nameKey="key"
/>
```

```tsx
// ========== PIE CHART - Hook ==========
const {
    data: pieData,
    config: pieConfig,
    keys: pieKeys,
  } = usePieChartData({
    records: reports,
    dataKey: "category.name",
  });


<DefaultPieChart
        data={pieData}
        config={pieConfig}
        dataKey="value"
        nameKey="key"
/>
```

## Bar Chart

```tsx
// ========== BAR CHART - Utils ==========
  const keys = ["value"]
  const config = buildChartConfig(keys);
  const data = formatBarLineData(reports, "type", keys);
// OR
const {
    data: barChartData,
    xAxisKey,
    barKeys,
    config
  } = useBarChartData({
    records: reports,
    xAxisKey: "category.name",
    dataKeys: ["value"],
  });
<DefaultBarChart 
        data={data}
        config={config}
        barKeys={keys}
        xAxisKey="type"
      />
```

## Fixes
