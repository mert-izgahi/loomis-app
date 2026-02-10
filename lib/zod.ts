import { object, z } from "zod";
import { Role } from "./enums";
export const loginSchema = z.object({
    email: z.email("Lütfen geçerli bir email adresi giriniz."),
    password: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),
})
// New LDAP login schema
export const ldapLoginSchema = z.object({
    username: z
        .string()
        .min(3, "Kullanıcı adı en az 3 karakter olmalıdır")
        .regex(
            /^[a-zA-Z0-9._-]+$/,
            "Kullanıcı adı sadece harf, rakam ve ._- karakterlerini içerebilir"
        ),
    password: z.string().min(1, "Şifre gereklidir"),
});
export const categorySchema = z.object({
    name: z.string().min(3, "Kategori adı en az 3 karakterden oluşmalıdır."),
    description: z.string().min(3, "Kategori açıklaması en az 3 karakterden oluşmalıdır.")
        .max(256, "Kategori açıklaması en fazla 256 karakterden oluşmalıdır."),
});

export const groupSchema = z.object({
    name: z.string().min(3, "Grup adı en az 3 karakterden oluşmalıdır."),
    description: z.string().min(3, "Grup açıklaması en az 3 karakterden oluşmalıdır.")
        .max(256, "Grup açıklaması en fazla 256 karakterden oluşmalıdır."),
    memberIds: z.array(z.string()).optional(),
});

export const createUserSchema = z.object({
    firstName: z.string().min(3, "Kullanıcı adı en az 3 karakterden oluşmalıdır."),
    lastName: z.string().min(3, "Kullanıcı soyadı en az 3 karakterden oluşmalıdır."),
    email: z.email("Lütfen geçerli bir email adresi giriniz."),
    phone: z.string().optional(),
    role: z.enum([Role.Admin, Role.User]),
    password: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),
    confirmPassword: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),

    isActive: z.boolean(),
    groupIds: z.array(z.string()).optional(),
}).refine((data) => {
    if (data.phone) {
        const trPhoneRegex = /^(?:\+90|0)?\s?(5\d{2})\s?\d{3}\s?\d{2}\s?\d{2}$/;
        return trPhoneRegex.test(data.phone);
    }
    return true;
}, {
    message: "Lütfen geçerli bir Türk telefon numarası giriniz.",
    path: ["phone"]
}).refine((data) => {
    return data.password === data.confirmPassword;
}, {
    message: "Sifreler uyusmuyor",
    path: ["confirmPassword"]
});


export const updateProfileSchema = z.object({
    firstName: z.string().min(3, "Kullanıcı adı en az 3 karakterden oluşmalıdır."),
    lastName: z.string().min(3, "Kullanıcı soyadı en az 3 karakterden oluşmalıdır."),
    email: z.email("Lütfen geçerli bir email adresi giriniz."),
    phone: z.string().optional(),
});

export const updatePasswordSchema = z.object({
    oldPassword: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),
    newPassword: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),
    confirmPassword: z.string().min(6, "Şifreniz en az 6 karakterden oluşmalıdır."),
}).refine((data) => {
    return data.newPassword === data.confirmPassword;
}, {
    message: "Şifreler uyuşmuyor",
    path: ["confirmPassword"]
})

export const updateUserSchema = z.object({
    firstName: z.string().min(3, "Kullanıcı adı en az 3 karakterden oluşmalıdır."),
    lastName: z.string().min(3, "Kullanıcı soyadı en az 3 karakterden oluşmalıdır."),
    email: z.email("Lütfen geçerli bir email adresi giriniz."),
    phone: z.string().optional(),
    role: z.string().optional(),
    isActive: z.boolean(),
    department: z.string().optional(),
    title: z.string().optional(),
    office: z.string().optional(),
    distinguishedName: z.string().optional(),
    groupIds: z.array(z.string()).optional(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.phone) {
        const trPhoneRegex = /^(?:\+90|0)?\s?(5\d{2})\s?\d{3}\s?\d{2}\s?\d{2}$/;
        return trPhoneRegex.test(data.phone);
    }
    return true;
}, {
    message: "Lütfen geçerli bir Türk telefon numarası giriniz.",
    path: ["phone"]
}).refine((data) => {
    if (data.password) {
        return data.password === data.confirmPassword;
    }
    return true;
}, {
    message: "Sifreler uyusmuyor",
    path: ["confirmPassword"]
});


export const reportSchema = z.object({
    name: z.string().min(3, "Rapor başlığı en az 3 karakterden oluşmalıdır."),
    description: z.string().min(3, "Rapor açıklaması en az 3 karakterden oluşmalıdır.")
        .max(256, "Rapor açıklaması en fazla 256 karakterden oluşmalıdır."),
    categoryId: z.string().min(3, "Kategori adı en az 3 karakterden oluşmalıdır."),
    groupIds: z.array(z.string()).optional(),
    status: z.enum(["Pending", "Draft", "Published"]).optional(),
    type: z.enum(["Internal", "External"]),
    link: z.string().optional(),
}).superRefine((data, ctx) => {
    // Only validate link if type is External and link exists
    if (data.type === "External") {
        if (!data.link || data.link.trim().length === 0) {
            ctx.addIssue({
                code: "custom",
                message: "External raporlar için link zorunludur.",
                path: ["link"]
            });
        } else {
            // Validate URL format only if link exists and type is External
            try {
                new URL(data.link);
            } catch {
                ctx.addIssue({
                    code: "custom",
                    message: "Geçerli bir URL giriniz.",
                    path: ["link"]
                });
            }
        }
    }
});




export const viewSchema = z.object({
    reportId: z.string().min(3, "Rapor adı en az 3 karakterden oluşmalıdır."),
})

export type LoginSchemaInput = z.infer<typeof loginSchema>
export type LDAPLoginInput = z.infer<typeof ldapLoginSchema>;

export type CategorySchemaInput = z.infer<typeof categorySchema>
export type GroupSchemaInput = z.infer<typeof groupSchema>
export type CreateUserSchemaInput = z.infer<typeof createUserSchema>
export type UpdateUserSchemaInput = z.infer<typeof updateUserSchema>
export type ReportSchemaInput = z.infer<typeof reportSchema>
export type UpdateProfileSchemaInput = z.infer<typeof updateProfileSchema>
export type UpdatePasswordSchemaInput = z.infer<typeof updatePasswordSchema>
export type ViewSchemaInput = z.infer<typeof viewSchema>