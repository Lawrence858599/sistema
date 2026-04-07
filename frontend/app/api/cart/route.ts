import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { cartService } from "@/services/cart-service";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const cart = await cartService.getSummary(currentUser.id);
  return NextResponse.json(cart);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { productId: string; quantity: number };
    const cart = await cartService.addItem(currentUser.id, body);
    return NextResponse.json(cart, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
