
            import { AnimatedCardsContainer } from "@/components/shared/animated";
            import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
            import React from "react";
            
            export default function Page() {
                return (
                    <AnimatedCardsContainer className="bg-muted p-4 flex items-center justify-center h-64 rounded-md">
                        <div className="max-w-xl flex flex-col gap-3 p-4">
                            <h1 className="font-bold text-xl">
                            Internal rapor
                            </h1>
                            <p className="text-xs">
                                Internal rapor
                            </p>
            
                            <Alert className="bg-red-100 shadow-none">
                                <AlertTitle>
                                    Rapor Beklemede
                                </AlertTitle>
                                <AlertDescription>
                                    Raport Üzerinde çalışmalar yapılyor tamamlandıkten sonra tekrar burdan görebilirsiniz
                                </AlertDescription>
                            </Alert>
                        </div>
                    </AnimatedCardsContainer>
                );
            }
                    