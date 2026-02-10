"use client";

import React, { useMemo, useRef, useState } from "react";
import Modal from "../shared/modal";
import { Button } from "../ui/button";
import { useReadCsv } from "@/hooks/use-utils";
import { Upload } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { ClientDataTable } from "../tables/client-table";

interface ReadCsvButtonProps {
    target: "categories" | "groups";
}

const ReadCsvButton: React.FC<ReadCsvButtonProps> = ({ target }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const { mutateAsync, isPending } = useReadCsv();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setRows([]);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const result = await mutateAsync({ file, target });
            if (result?.result) {
                setRows(result.result);
            }
        } catch (error) {
            console.error("CSV read error:", error);
        }
    };

    const handleClick = () => fileInputRef.current?.click();
    const helperText = target === "groups" ? "Eklemek istediğiniz kullanıcı gruplarını içeren CSV dosyasını seçin." : "Eklemek istediğiniz kategori verilerini içeren CSV dosyasını seçin.";
    const formatExample = target === "groups" ? "name,description\nGroup A,Description for Group A\nGroup B,Description for Group B" : "name,description\nCategory A,Description for Category A\nCategory B,Description for Category B";
    // Build columns dynamically based on CSV headers
    const columns = useMemo<ColumnDef<any, any>[]>(() => {
        if (!rows || rows.length === 0) return [];

        return Object.keys(rows[0]).map((key) => ({
            accessorKey: key,
            header: key.charAt(0).toUpperCase() + key.slice(1),
            cell: ({ row }) => <span>{row.original[key]}</span>,
            enableSorting: false,
            enableColumnFilter: true,
        }));
    }, [rows]);

    return (
        <>
            <Button onClick={openModal} disabled={isPending} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                CSV Oku
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={closeModal}
                title="CSV Dosyası Yükle"
                className="sm:max-w-3xl"
            >
                <div className="flex flex-col gap-4">
                    <p>Yüklemek istediğiniz CSV dosyasını seçin.</p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    <div className="flex flex-col gap-2">
                        <Button onClick={handleClick} disabled={isPending} variant="default">
                            Dosya Seç
                        </Button>
                        <Button onClick={closeModal} variant="outline">
                            İptal
                        </Button>

                        {
                            rows.length > 0 && (
                                <Button variant="outline" disabled={isPending || rows.length === 0}>
                                    {rows.length} satır Db'e ekle
                                </Button>
                            )
                        }
                    </div>
                    {
                        !rows || rows.length === 0 ? (
                            <div className='flex flex-col gap-4 bg-muted rounded p-4 w-full h-64 items-center justify-center'>
                                <p className='text-muted-foreground text-sm'>
                                    {helperText}
                                </p>
                                <div className='text-xs text-muted-foreground'>
                                    Örnek format:

                                    <pre>
                                        {formatExample}
                                    </pre>
                                </div>
                            </div>
                        ) : null
                    }
                    {rows.length > 0 && (
                        <div className="mt-4">
                            <ClientDataTable columns={columns} data={rows} />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default ReadCsvButton;
