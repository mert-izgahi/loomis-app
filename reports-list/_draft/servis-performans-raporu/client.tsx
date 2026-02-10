
import { AnimatedCard, AnimatedCardsContainer } from "@/components/shared/animated";
import React from "react";
import ServicePieChartPerformanceReport from "./charts/pie-chart";
import ServicePerformanceBarChart from "./charts/bar-chart";

export default function Page() {
    return (
        <AnimatedCardsContainer className="grid grid-cols-1 xl:grid-cols-2 print:grid print:grid-cols-2  gap-4">
            <AnimatedCard>
                <ServicePieChartPerformanceReport />
            </AnimatedCard>
            <AnimatedCard>
                <ServicePerformanceBarChart />
            </AnimatedCard>
        </AnimatedCardsContainer>
    );
}
