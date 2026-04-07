import { NextResponse } from "next/server";
import { createUserSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { authService } from "@/services/auth-service";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      fullName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };
    const user = await authService.register(body);
    await createUserSession(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
