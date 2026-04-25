import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export async function GET() {
  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const sec = process.env.JWT_SECRET;
  if (!sec) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  try {
    const secret = new TextEncoder().encode(sec);
    const { payload } = await jwtVerify(token, secret);

    return NextResponse.json({
      user: {
        email: payload.email,
        role: payload.role,
        name: payload.name,
      },
    });
  } catch {
    // token invalid/expired -> treat as logged out
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
