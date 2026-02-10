"use client";
import FavoriteReportButton from "@/components/buttons/favorite-report-button";
import PrintReportButton from "@/components/buttons/print-report-button";
import ReportSheetButton from "@/components/buttons/report-sheet-button";
import ReportStatusField from "@/components/fields/report-status-field";
import Container from "@/components/layouts/container";
import LoadingState from "@/components/shared/loading-state";
import { AnimatedCardsContainer } from "@/components/shared/animated";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useGetProfile } from "@/hooks/use-profile";
import { useGetReport } from "@/hooks/use-reports";
import { useCreateView } from "@/hooks/use-views";
import { Role } from "@/lib/enums";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef } from "react";
import ReportViewsButton from "@/components/buttons/report-views-button";

interface Props {
  id: string;
}

function ReportPageClient({ id }: Props) {
  const { data: report, isLoading, isError } = useGetReport({ id });
  const { data: profile } = useGetProfile();
  const role = useMemo(() => profile?.role, [profile]);
  const reportRef = useRef<HTMLDivElement>(null);
  const relativeSlug = useMemo(() => report?.slug || "", [report]);

  const ReportComponent = useMemo<any>(() => {
    if (!relativeSlug) return null;
    return dynamic(
      () =>
        import(`@/reports-list/${relativeSlug}/client`).catch(() => {
          // Return a fallback component if import fails
          return {
            default: () => (
              <Alert className="bg-red-100 shadow-none">
                <AlertTitle>Rapor Bulunamadı</AlertTitle>
                <AlertDescription>
                  Bu rapor için içerik dosyası bulunamadı. Lütfen yönetici ile
                  iletişime geçin.
                </AlertDescription>
              </Alert>
            ),
          };
        }),
      {
        ssr: false,
        loading: () => <LoadingState />,
      }
    );
  }, [relativeSlug]);

  const { mutateAsync: createView } = useCreateView();

  const handleCreateView = useCallback(async () => {
    if (report) {
      await createView({ reportId: report.id });
    }
  }, [createView, report]);

  useEffect(() => {
    if (report && report.status === "Published") {
      handleCreateView();
    }
  }, [handleCreateView, report]);

  if (isLoading) return <LoadingState />;
  if (isError || !report) {
    return (
      <Container>
        <Alert className="bg-red-100 shadow-none">
          <AlertTitle>Rapor Bulunamadı</AlertTitle>
          <AlertDescription>
            Bu rapora erişim yetkiniz yok ya da rapor bulunamadı.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  // Show alert if report is not published
  if (report.status === "Pending") {
    return (
      <Container>
        <AnimatedCardsContainer className="bg-muted p-4 flex items-center justify-center h-64 rounded-md">
          <div className="max-w-xl flex flex-col gap-3 p-4">
            <h1 className="font-bold text-xl">{report.name}</h1>
            <p className="text-xs">{report.description}</p>

            <Alert className="bg-yellow-100 shadow-none">
              <AlertTitle>Rapor Beklemede</AlertTitle>
              <AlertDescription>
                Rapor üzerinde çalışmalar yapılıyor. Tamamlandıktan sonra tekrar
                buradan görebilirsiniz.
              </AlertDescription>
            </Alert>
          </div>
        </AnimatedCardsContainer>
      </Container>
    );
  }

  if (report && report.type === "Internal") {
    return (
      <Container className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{report.name}</h1>
          <div className="flex flex-row gap-4">
            <FavoriteReportButton report={report} />
            <PrintReportButton componentRef={reportRef as any} />
            {role === Role.Admin && <ReportStatusField report={report} />}
            {role === Role.Admin && <ReportSheetButton report={report} />}
          </div>
        </div>
        <div ref={reportRef}>
          <ReportComponent />
        </div>
      </Container>
    );
  }

  if (report && report.type === "External") {
    return (
      <Container className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">{report.name}</h1>
          <div className="flex flex-row gap-4">
            <FavoriteReportButton report={report} />
            {role === Role.Admin && <ReportStatusField report={report} />}
            {role === Role.Admin && <ReportSheetButton report={report} />}
            {role === Role.Admin && <ReportViewsButton reportId={report!.id} />}
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs">{report.description}</p>

          <div className="max-w-xl">
            {
              report.link ? (
                <Button asChild variant="outline">
                  <Link href={report.link!} target="_blank">
                    Raporu Aç
                  </Link>
                </Button>
              ) : (<p>Rapor linki bulunamadı.</p>
              )
            }
          </div>
        </div>
      </Container>
    );
  }
}

export default ReportPageClient;
