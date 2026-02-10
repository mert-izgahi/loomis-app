"use client";
import { apiClient } from "@/lib/api-client";
import { GroupSchemaInput } from "@/lib/zod";
import { GroupDocumentType } from "@/models/group.model";
import { ApiResponseWithPagination, GroupWithMembers } from "@/types";
import { Group } from "@/generated/prisma/client";
import { useQuery, useMutation } from "@tanstack/react-query";

export const useGetGroups = ({ query }: { query: string }) => {
    return useQuery<ApiResponseWithPagination<GroupDocumentType>>({
        queryKey: ["get-groups", query],
        queryFn: async () => {
            const response = await apiClient.get(`/api/groups?${query}`);
            const data = await response.data;
            return data;
        }
    })
}

export const useGetAllGroups = () => {
    return useQuery<Group[]>({
        queryKey: ["get-all-groups"],
        queryFn: async () => {
            const response = await apiClient.get(`/api/groups/all`);
            const data = await response.data;
            const { result } = data;
            return result;
        }
    })
}

export const useGetGroup = (id: string) => {
    return useQuery<GroupWithMembers>({
        queryKey: ["get-group", id],
        queryFn: async () => {
            const response = await apiClient.get(`/api/groups/${id}`);
            const { result } = await response.data;
            return result;
        },
        enabled: !!id
    })
}

export const useCreateGroup = () => {
    return useMutation({
        mutationFn: async (data: GroupSchemaInput) => {
            const response = await apiClient.post("/api/groups", data);
            return response.data;
        }
    });
}

export const useUpdateGroup = () => {
    return useMutation({
        mutationFn: async ({ id, args }: { id: string, args: GroupSchemaInput }) => {
            const response = await apiClient.put(`/api/groups/${id}`, args);
            return response.data;
        }
    });
}

export const useDeleteGroup = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            try {
                const response = await apiClient.delete(`/api/groups/${id}`);
                const data = await response.data;
                const { result } = data;
                return result;

            } catch (error: any) {
                const errorMessage = error.response?.data?.message || "Failed to delete group";
                throw new Error(errorMessage);
            }
        }
    });
};

