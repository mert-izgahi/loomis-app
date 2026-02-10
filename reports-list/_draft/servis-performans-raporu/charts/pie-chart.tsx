"use client"

import { faker } from "@faker-js/faker"

import { ChartConfig } from "@/components/ui/chart"
import { DefaultPieChart } from "@/components/charts/pie-chart/default"

export default function ServicePieChartPerformanceReport() {
    // Generate fake pie data for different service statuses
    const serviceStatuses = ["Tamamlandı", "Beklemede", "İptal Edildi", "Devam Ediyor"]

    const pieData = serviceStatuses.map((status) => ({
        key: status,
        value: faker.number.int({ min: 10, max: 100 }),
        fill: faker.helpers.arrayElement(["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]),
    }))

    const chartConfig: ChartConfig = {
        Tamamlandı: {
            label: "Tamamlandı",
            color: "var(--chart-4)",
        },
        Beklemede: {
            label: "Beklemede",
            color: "var(--chart-5)", // yellow
        },
        "İptal Edildi": {
            label: "İptal Edildi",
            color: "var(--chart-1)", // red
        },
        "Devam Ediyor": {
            label: "Devam Ediyor",
            color: "var(--chart-2)", // blue
        },
    }

    return (
        <DefaultPieChart
            data={pieData}
            config={chartConfig}
            dataKey="value"
            nameKey="key"
            title="Servis Performans Raporu"
            description="Hizmet türlerine göre tamamlanma durumu"
            footerText="Toplam servis işlemleri baz alınmıştır"
            trendText="Son ay %8 artış"
            showLabel
        />
    )
}
