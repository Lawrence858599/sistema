import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/errors";
import { orderService } from "@/services/order-service";

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  const orders = await orderService.listUserOrders(currentUser.id);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ message: "Nao autenticado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const order = await orderService.placeOrder(currentUser.id, body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
  }
}
