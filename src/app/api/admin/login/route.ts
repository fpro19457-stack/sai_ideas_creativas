import {NextResponse} from "next/server";
import bcrypt from "bcryptjs";
import {prisma} from "@/lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET || "fallback-secret";

export async function POST(request: Request) {
  try {
    const {email, password} = await request.json();

    if (!email || !password) {
      return NextResponse.json({error: "Missing credentials"}, {status: 400});
    }

    const user = await prisma.adminUser.findUnique({
      where: {email},
    });

    if (!user) {
      return NextResponse.json({error: "Invalid credentials"}, {status: 401});
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({error: "Invalid credentials"}, {status: 401});
    }

    const token = jwt.sign(
      {id: user.id, email: user.email, role: user.role},
      JWT_SECRET,
      {expiresIn: "7d"}
    );

    const response = NextResponse.json({ok: true});
    response.cookies.set("admin-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({error: "Server error"}, {status: 500});
  }
}