// import { Hono } from "hono";
// import { setCookie, deleteCookie } from "hono/cookie";
// import { signToken } from "@/lib/jwt";
// import { authMiddleware } from "@/lib/auth";
// import { zValidator } from "@hono/zod-validator";
// import { loginSchema } from "@/lib/zod";
// import User from "@/models/user.model";
// import dbConnect from "@/lib/mongoose";
// import { configs } from "@/configs";

// export const authApi = new Hono();
// const isProduction = configs.NODE_ENV === "production";
// // @description Login
// // @route POST /api/auth/login
// // @access Public
// authApi.post("/login",
//     zValidator("json", loginSchema, (result, c) => {
//         if (!result.success) {
//             return c.json({ success: false, message: "Geçersiz istek", result: null }, { status: 400 });
//         }
//     }),
//     async (c) => {
//         try {
//             await dbConnect();
//             const { email, password } = await c.req.json();

//             const user = await User.findOne({ email });
//             if (!user) {
//                 return c.json({ success: false, message: "Kullanıcı bulunamadı", result: null }, { status: 401 });
//             }


//             const isPasswordValid = await user.comparePassword(password);
//             if (!isPasswordValid) {
//                 return c.json({ success: false, message: "Şifre yanlış", result: null }, { status: 401 });
//             }


//             if(!user.isActive) {
//                 return c.json({ success: false, message: "Hesap aktif değil. Lütfen yöneticinizle iletişime geçin.", result: null }, { status: 403 });
//             }

//             // Generate JWT token

//             const token = await signToken({ id: user.id.toString(), role: user.role });

//             setCookie(c, "token", token, {
//                 httpOnly: true,
//                 secure: isProduction, // true in production, false in development
//                 sameSite: isProduction ? "none" : "lax", // "none" for cross-origin, "lax" for same-origin
//                 maxAge: 60 * 60 * 24 * 7, // 7 days
//                 path: "/",
//             });

//             return c.json({ success: true, message: "Giriş başarılı", result: user }, { status: 200 });
//         } catch (error) {
//             console.error("Login error:", error);
//             return c.json({ success: false, message: "Giriş hatası", result: null }, { status: 500 });
//         }
//     });


// // @description Logout
// // @route POST /api/auth/logout
// // @access Private
// authApi.post("/logout", async (c) => {
//     try {
//         deleteCookie(c, "token");
//         return c.json({ success: true, message: "Logout oldu" }, { status: 200 });
//     } catch (error) {
//         console.error("Logout error:", error);
//         return c.json({ success: false, message: "Logout error", result: null }, { status: 500 });
//     }
// });


// // @description Get user
// // @route GET /api/auth/profile
// // @access Private
// authApi.get("/profile", authMiddleware, async (c) => {
//     try {
//         const user = c.get("user");
//         if (!user) {
//             return c.json({ success: false, message: "Kullanıcı bulunamadı", result: null }, { status: 401 });
//         }
//         return c.json({ success: true, message: "Kullanıcı bilgileri", result: user }, { status: 200 });
//     } catch (error) {
//         console.error("Get user error:", error);
//         return c.json({ success: false, message: "Get user error", result: null }, { status: 500 });
//     }
// });
