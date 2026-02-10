// lib/auth.ts
import { Context, Next } from "hono";
import { getCookie } from "hono/cookie";
import { verifyToken } from "./jwt";
import { cookies } from "next/headers";
import UserService from "@/services/user.service";
import { prisma } from "./prisma";

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const token = getCookie(c, "token");

    if (!token) {
      return c.json(
        {
          success: false,
          message: "Token bulunamadı",
          result: null,
        },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return c.json(
        {
          success: false,
          message: "Geçersiz token",
          result: null,
        },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { favouriteReports: true, groups: true },
    });
    if (!user) {
      return c.json(
        {
          success: false,
          message: "Kullanıcı bulunamadı",
          result: null,
        },
        { status: 401 }
      );
    }

    c.set("user", user);
    c.set("userId", user.id.toString());

    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json(
      {
        success: false,
        message: "Kimlik doğrulama hatası",
        result: null,
      },
      { status: 401 }
    );
  }
};

export const roleMiddleware =
  (roles: string[]) => async (c: Context, next: Next) => {
    try {
      const user = c.get("user");

      if (!user) {
        return c.json(
          {
            success: false,
            message: "Kullanıcı bulunamadı",
            result: null,
          },
          { status: 401 }
        );
      }

      if (!roles.includes(user.role)) {
        return c.json(
          {
            success: false,
            message: "Yetkiniz yok",
            result: null,
          },
          { status: 403 }
        );
      }

      return next();
    } catch (error) {
      console.error("Role middleware error:", error);
      return c.json(
        {
          success: false,
          message: "Yetki kontrolü hatası",
          result: null,
        },
        { status: 403 }
      );
    }
  };

export const getCurrentUser = async () => {
  try {
    const cookieStore = await cookies();
    if (cookieStore) {
      const token = cookieStore.get("token")?.value;

      if (!token) return null;

      const decoded = await verifyToken(token);
      if (!decoded) return null;
      const user = await UserService.findById(decoded.id);
      return user || null;
    }
    return null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};
