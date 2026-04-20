import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/db";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret-change-in-production";
const COOKIE_NAME = "cliente-session";
const TOKEN_EXPIRY = "7d";

export interface ClienteTokenPayload {
  clienteId: string;
  email: string;
}

export function signClienteToken(clienteId: string, email: string): string {
  return jwt.sign({clienteId, email}, JWT_SECRET, {expiresIn: TOKEN_EXPIRY});
}

export function verifyClienteToken(token: string): ClienteTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ClienteTokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

export async function setClienteCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export async function clearClienteCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getClienteFromRequest(): Promise<ClienteTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyClienteToken(token);
}

export async function getClienteFromDb(): Promise<any | null> {
  const payload = await getClienteFromRequest();
  if (!payload) return null;

  const cliente = await prisma.cliente.findUnique({
    where: {id: payload.clienteId},
  });

  return cliente;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}