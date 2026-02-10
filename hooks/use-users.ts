"use client";
import { apiClient } from "@/lib/api-client";
import { CreateUserSchemaInput, UpdateUserSchemaInput } from "@/lib/zod";
import { ApiResponseWithPagination, UserWithGroups, UserWithGroupsAndFavorites } from "@/types";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGetUsers = ({ query }: { query: string }) => {
  return useQuery<ApiResponseWithPagination<UserWithGroups>>({
    queryKey: ["get-users", query],
    queryFn: async () => {
      const response = await apiClient.get(`/api/users?${query}`);
      const data = await response.data;
      return data;
    },
  });
};

export const useGetUser = (id: string) => {
  return useQuery<UserWithGroupsAndFavorites | null>({
    queryKey: ["get-user", id],
    queryFn: async () => {
      const response = await apiClient.get(`/api/users/${id}`);
      const { result } = await response.data;
      return result;
    },
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: async (data: CreateUserSchemaInput) => {
      const response = await apiClient.post("/api/users", data);
      return response.data;
    },
  });
};

export const useUpdateUser = () => {
  return useMutation({
    mutationFn: async ({
      id,
      args,
    }: {
      id: string;
      args: UpdateUserSchemaInput;
    }) => {
      const response = await apiClient.put(`/api/users/${id}`, args);
      return response.data;
    },
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/api/users/${id}`);
      return response.data;
    },
  });
};

export const useGetAllUsers = () => {
  return useQuery<UserWithGroups[]>({
    queryKey: ["get-all-users"],
    queryFn: async () => {
      const response = await apiClient.get(`/api/users/all`);
      const data = await response.data;
      const { result } = data;
      return result;
    },
  });
};
