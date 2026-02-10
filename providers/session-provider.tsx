// providers/session-provider.tsx
"use client";

import { Role } from "@/models/user.model";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { LDAPLoginInput, LoginSchemaInput } from "@/lib/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { User } from "@/generated/prisma/client";

interface SessionProviderContextType {
    user: User | null;
    fetchingUser: boolean;
    loggingIn: boolean;
    loggingOut: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    login: (credentials: LoginSchemaInput | LDAPLoginInput, type: "email" | "ldap") => Promise<User | null>;
    logout: () => Promise<void>;
    getProfile: () => Promise<void>;
}

export const SessionContext = createContext<SessionProviderContextType>({
    user: null,
    fetchingUser: true,
    loggingIn: false,
    loggingOut: false,
    isAuthenticated: false,
    isAdmin: false,
    login: async (c) => null,
    logout: async () => { },
    getProfile: async () => { },
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [fetchingUser, setFetchingUser] = useState(true);
    const [loggingIn, setLoggingIn] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // Role Management
    const [isAdmin, setIsAdmin] = useState(false);

    const router = useRouter();
    // Fetch user data from the API
    const fetchUser = useCallback(async () => {
        try {
            setFetchingUser(true);
            const response = await axios.get("/api/auth/profile", {
                withCredentials: true,
                timeout: 10000 // 10 second timeout
            });
            const data = await response.data;

            if (data.success) {
                setUser(data.result);
            } else {
                setUser(null);
            }
        } catch (error: any) {
            console.error("Failed to fetch user:", error);
            setUser(null);

            if (error.response?.status !== 401) {
                toast.error("Failed to fetch user profile");
            }
        } finally {
            setFetchingUser(false);
        }
    }, []);

    // login function
    // const login = async (data: LoginSchemaInput): Promise<UserDocumentType | null> => {
    //     try {
    //         setLoggingIn(true);
    //         const response = await axios.post("/api/auth/login", data, {
    //             withCredentials: true,
    //             timeout: 10000
    //         });
    //         const { result, success } = await response.data;
    //         if (success) {
    //             setUser(result);
    //             toast.success(response.data.message || "Giriş başarılı, Lütfen bekleyin...");
    //             return result;
    //         } else {
    //             toast.error(response.data.message || "Giriş yapılamadı");
    //             return null;
    //         }
    //     } catch (error: any) {
    //         console.error("Login error:", error);
    //         const errorMessage = error.response?.data?.message || "Giriş sırasında bir hata oluştu";
    //         toast.error(errorMessage);
    //         return null;
    //     } finally {
    //         setLoggingIn(false);
    //     }
    // };

    const login = async (
        credentials: LoginSchemaInput | LDAPLoginInput,
        type: "email" | "ldap" = "email"
    ): Promise<User | null> => {
        setLoggingIn(true);

        try {
            const endpoint =
                type === "ldap" ? "/api/auth/ldap/login" : "/api/auth/login";

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include", // Important for cookies
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success && data.result) {
                setUser(data.result);
                toast.success(data.message || "Giriş başarılı!");
                return data.result;
            } else {
                toast.error(data.message || "Giriş başarısız!");
                return null;
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
            return null;
        } finally {
            setLoggingIn(false);
        }
    };

    // logout function
    const logout = async () => {
        try {
            setLoggingOut(true);
            await axios.post("/api/auth/logout", {}, {
                withCredentials: true,
                timeout: 10000
            });

            setUser(null);
            toast.success("Çıkış yapıldı, yönlendiriliyorsunuz...");
            setTimeout(() => {
                router.push("/auth")
            }, 300);
        } catch (error: any) {
            console.error("Logout error:", error);
            // Even if logout fails, clear user locally
            setUser(null);
            toast.error("Çıkış sırasında bir hata oluştu");
        } finally {
            setLoggingOut(false);
        }
    };

    const isAuthenticated = useMemo(() => {
        return user !== null;
    }, [user]);

    useEffect(() => {
        setIsAdmin(user?.role == Role.Admin);
    }, [user]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Show loading screen only on initial load
    if (fetchingUser && user === null) {
        return (
            <div className="w-screen h-screen flex justify-center items-center">
                <Loader2 className="animate-spin h-8 w-8" />
            </div>
        );
    }

    return (
        <SessionContext.Provider value={{
            user,
            fetchingUser,
            loggingIn,
            loggingOut,
            isAuthenticated,
            login,
            logout,
            getProfile: fetchUser,
            isAdmin,
        }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context;
};