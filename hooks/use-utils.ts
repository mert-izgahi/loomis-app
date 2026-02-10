"use client";
import { apiClient } from "@/lib/api-client";
import { useMutation } from "@tanstack/react-query";


export const useReadCsv = () => {
    return useMutation({
        mutationFn: async ({ file, target }: { file: File; target: "categories" | "groups" }) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("target", target);
            const response = await apiClient.post("/api/utils/read-csv", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        },
    });
};
