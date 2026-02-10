"use client";
import { apiClient } from "@/lib/api-client";
import {  ViewSchemaInput } from "@/lib/zod";
import { ApiResponseWithPagination, ViewWithUserAndReport } from "@/types";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGetViews = ({ query }: { query: string }) => {
    return useQuery<ApiResponseWithPagination<ViewWithUserAndReport>>({
        queryKey: ["get-views", query],
        queryFn: async () => {
            const response = await apiClient.get(`/api/views?${query}`);
            const data = await response.data;
            return data;
        }
    })
}

export const useGetAllViews =  () => {
    return useQuery<ViewWithUserAndReport[]>({
        queryKey: ["get-all-views"],
        queryFn: async () => {
            const response = await apiClient.get(`/api/views/all`);
            const data = await response.data;
            const { result } = data;
            return result;
        }
    })
}

export const useCreateView = () => {
    return useMutation({
        mutationFn: async (data: ViewSchemaInput) => {
            const response = await apiClient.post("/api/views", data);
            return response.data;
        },
        retry: false,
    });
}

