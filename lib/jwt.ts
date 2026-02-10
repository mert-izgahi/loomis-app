// lib/jwt.ts

import { configs } from "@/configs";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { Role } from "./enums";

export type PayloadType = JWTPayload & {
    id: string;
    role: Role;
};

// Use environment variable for secret key

const secretKey = configs.JWT_SECRET  || "your-super-secret-key-change-in-production";

// Encode the secret key as bytes
const key = new TextEncoder().encode(secretKey as string);

export async function signToken(payload: Omit<PayloadType, keyof JWTPayload>): Promise<string> {
    return new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(key);
}

export async function verifyToken(token: string): Promise<PayloadType | null> {
    try {
        const { payload } = await jwtVerify(token, key);
        return payload as PayloadType;
    } catch (error) {
        console.error("JWT verification failed:", error);
        return null;
    }
}