"use client"

import { faker } from "@faker-js/faker"
import { DefaultBarChart } from "@/components/charts/bar-chart/default"
import { ChartConfig } from "@/components/ui/chart"

export default function ServicePerformanceBarChart() {
    // Example: service types (categories)
    const serviceTypes = [
        "Bakım",
        "Kurulum",
        "Destek",
        "Denetim",
        "Eğitim",
        "Yedek Parça",
    ]

    // Generate fake dataset: each bar = one service type
    const barData = serviceTypes.map((type) => ({
        hizmet: type,
        tamamlanan: faker.number.int({ min: 20, max: 120 }),
        bekleyen: faker.number.int({ min: 5, max: 60 }),
        iptal: faker.number.int({ min: 0, max: 30 }),
    }))

    // Define colors for each bar key
    const chartConfig: ChartConfig = {
        tamamlanan: {
            label: "Tamamlanan",
            color: "var(--chart-1)", // green
        },
        bekleyen: {
            label: "Bekleyen",
            color: "var(--chart-2)", // yellow
        },
        iptal: {
            label: "İptal",
            color: "var(--chart-3)", // red
        },
    }

    return (
        <DefaultBarChart
            data={barData}
            config={chartConfig}
            xAxisKey="hizmet"
            barKeys={["tamamlanan", "bekleyen", "iptal"]}
            title="Servis Performans Raporu"
            description="Hizmet türlerine göre tamamlanan, bekleyen ve iptal edilen işler"
            footerText="Son 3 aylık işlem verilerine göre"
            trendText="Performans %6 arttı"
            showLabelList
            showGrid
            barRadius={0}
            height={350}
            stack={true} // stack bars for better comparison
        />
    )
}
