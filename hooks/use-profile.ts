"use client";
import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { UpdateProfileSchemaInput, UpdatePasswordSchemaInput } from "@/lib/zod";
import { ApiResponseWithPagination, ProfileWithFavoritesAndGroups, ReportWithIsExistsAndCategoryAndGroup } from "@/types";
export const useGetProfile = () => {
  return useQuery<ProfileWithFavoritesAndGroups>({
    queryKey: ["get-profile"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/profile`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateProfileSchemaInput) => {
      try {
        const response = await apiClient.put(`/api/profile`, data);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordSchemaInput) => {
      try {
        const response = await apiClient.put(
          `/api/profile/update-password`,
          data
        );
        const { result } = await response.data;
        if (response.status === 200) {
          return result;
        }
        return null;
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || "Failed to update password";
        throw new Error(errorMessage);
      }
    },
    onSuccess: (data) => {
      console.log(data);
    },
    onError: (error) => {
      console.log(error);
    },
  });
};

export const useToggleFavoriteReport = () => {
  return useMutation({
    mutationFn: async (reportId: string) => {
      try {
        const response = await apiClient.patch(
          `/api/profile/toggle-favorite-report`,
          { id: reportId }
        );
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useGetProfileFavoriteReports = () => {
  return useQuery({
    queryKey: ["get-profile-favorite-reports"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/profile/favorite-reports`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useGetProfileMetrics = () => {
  return useQuery({
    queryKey: ["get-profile-metrics"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/profile/metrics`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};

export const useGetProfileReports = ({ query }: { query: string }) => {
  return useQuery<ApiResponseWithPagination<ReportWithIsExistsAndCategoryAndGroup>>({
    queryKey: ["get-profile-reports", query],
    queryFn: async () => {
      const response = await apiClient.get(`/api/profile/reports?${query}`);
      const data = await response.data;
      return data;
    },
  });
};

export const useGetProfileTrendingReports = () => {
  return useQuery({
    queryKey: ["get-profile-trending-reports"],
    queryFn: async () => {
      try {
        const response = await apiClient.get(`/api/profile/reports/trending`);
        const { result } = await response.data;
        return result;
      } catch (error) {
        console.error("Get user error:", error);
        return null;
      }
    },
  });
};
