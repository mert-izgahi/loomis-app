
import { configs } from "@/configs";
import axios from "axios";

export const apiClient = axios.create({
    baseURL: configs.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds
});