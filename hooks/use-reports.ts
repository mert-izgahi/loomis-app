"use client";
import { apiClient } from "@/lib/api-client";
import { ReportSchemaInput } from "@/lib/zod";
import {
  ApiResponseWithPagination,
  ReportWithIsExistsAndCategoryAndGroup,
} from "@/types";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGetReports = ({ query }: { query: string }) => {
  return useQuery<
    ApiResponseWithPagination<ReportWithIsExistsAndCategoryAndGroup>
  >({
    queryKey: ["get-admin-reports", query],
    queryFn: async () => {
      const response = await apiClient.get(`/api/reports?${query}`);
      const data = await response.data;
      return data;
    },
  });
};

export const useGetAllReports = () => {
  return useQuery<ReportWithIsExistsAndCategoryAndGroup[]>({
    queryKey: ["get-all-reports"],
    queryFn: async () => {
      const response = await apiClient.get(`/api/reports/all`);
      const data = await response.data;
      const { result } = data;
      return result;
    },
  });
};

export const useGetReport = ({ id }: { id: string }) => {
  return useQuery<ReportWithIsExistsAndCategoryAndGroup>({
    queryKey: ["get-report", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/reports/${id}`);
      const { result } = await response.data;
      return result;
    },
    enabled: !!id,
  });
};

export const useCreateReport = () => {
  return useMutation({
    mutationFn: async (data: ReportSchemaInput) => {
      try {
        const response = await apiClient.post("/api/reports", data);
        return response.data;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to create report";
        throw new Error(errorMessage);
      }
    },
  });
};

export const useDeleteReport = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/reports/${id}`);
      return response.data;
    },
  });
};

export const useUpdateReport = () => {
  return useMutation({
    mutationFn: async ({
      id,
      args,
    }: {
      id: string;
      args: ReportSchemaInput;
    }) => {
      const response = await apiClient.put(`/api/reports/${id}`, args);
      return response.data;
    },
  });
};

export const useUpdateReportStatus = (id: string) => {
  return useMutation({
    mutationKey: ["update-report-status", id],
    mutationFn: async ({ status }: { status: string }) => {
      const response = await apiClient.patch(`/api/reports/${id}/status`, {
        status,
      });
      return response.data;
    },
  });
};

export const useCreateReportView = (id: string) => {
  return useMutation({
    mutationKey: ["create-report-view", id],
    mutationFn: async () => {
      const response = await apiClient.patch(`/api/reports/${id}/create-view`);
      return response.data;
    },
  });
};

export const useGetTrendingReports = () => {
  return useQuery({
    queryKey: ["get-trending-reports"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/reports/trending`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useGetReportViews = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ["get-report-views", id],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/views/report/${id}`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get views error:", error);
        return null;
      }
    },
  });
}