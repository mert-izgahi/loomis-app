import React from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "../ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";

interface PrintReportButtonProps {
    componentRef: React.RefObject<HTMLDivElement>;
}

const PrintReportButton = ({ componentRef }: PrintReportButtonProps) => {
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: "Dispatcher Raporu",
        suppressErrors: true,
        onBeforePrint: async () => {
            // Wait for charts to fully render
            await new Promise(resolve => setTimeout(resolve, 500));
        },
        onAfterPrint: () => toast.success("Rapor başarıyla yazdırıldı!"),
        onPrintError: (error:any) => toast.error(`Rapor yazdırma hatası`, error?.message),
        pageStyle: `
            @page { 
                size: A4 landscape;
                margin: 15mm; 
            }
            
            @media print {
                body { 
                    -webkit-print-color-adjust: exact !important; 
                    print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                
                /* Prevent page breaks inside charts */
                .recharts-wrapper,
                .recharts-surface,
                canvas,
                svg {
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                }
                
                /* Ensure charts are visible */
                .recharts-wrapper {
                    width: 100% !important;
                    height: auto !important;
                    min-height: 400px !important;
                }
                
                /* Better spacing for print */
                .grid {
                    gap: 20px !important;
                }
                
                /* Hide unnecessary elements */
                button,
                .no-print {
                    display: none !important;
                }
                
                /* Table improvements */
                table {
                    page-break-inside: auto !important;
                }
                
                tr {
                    page-break-inside: avoid !important;
                    page-break-after: auto !important;
                }
                
                thead {
                    display: table-header-group !important;
                }
                
                /* Ensure proper sizing */
                * {
                    box-sizing: border-box;
                }
                
                /* Chart container improvements */
                .recharts-responsive-container {
                    width: 100% !important;
                    height: 450px !important;
                }
            }
        `,
    });

    return (
        <Button size="icon" variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4" />
        </Button>
    );
};

export default PrintReportButton;