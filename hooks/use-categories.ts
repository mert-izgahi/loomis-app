"use client";
import { apiClient } from "@/lib/api-client";
import { CategorySchemaInput } from "@/lib/zod";
import { ApiResponseWithPagination } from "@/types";
import { Category } from "@/generated/prisma/client";
import { useQuery, useMutation } from "@tanstack/react-query";


// @desc get categories
export const useGetCategories = ({ query }: { query: string }) => {
    return useQuery<ApiResponseWithPagination<Category>>({
        queryKey: ["get-categories", query],
        queryFn: async () => {
            const response = await apiClient.get(`/api/categories?${query}`);
            const data = await response.data;
            return data;
        }
    })
}


// @desc get all categories
export const useGetAllCategories = () => {
    return useQuery<Category[]>({
        queryKey: ["get-all-categories"],
        queryFn: async () => {
            const response = await apiClient.get(`/api/categories/all`);
            const data = await response.data;
            const { result } = data;
            return result;
        }
    })
}

// @desc create category
export const useCreateCategory = () => {
    return useMutation({
        mutationFn: async (data: CategorySchemaInput) => {
            const response = await apiClient.post("/api/categories", data);
            return response.data;
        }
    });
}



// @desc delete category
export const useDeleteCategory = () => {
    return useMutation({
        mutationFn: async (id: string) => {
            const response = await apiClient.delete(`/api/categories/${id}`);
            return response.data;
        }
    });
}



// @desc update category
export const useUpdateCategory = () => {
    return useMutation({
        mutationFn: async ({ id, args }: { id: string, args: CategorySchemaInput }) => {
            const response = await apiClient.put(`/api/categories/${id}`, args);
            return response.data;
        }
    });
}


// @desc get category
export const useGetCategory = (id: string) => {
    return useQuery({
        queryKey: ["get-category", id],
        queryFn: async () => {
            const response = await apiClient.get(`/api/categories/${id}`);
            const { result } = await response.data;
            return result;
        },
        enabled: !!id
    })
}

