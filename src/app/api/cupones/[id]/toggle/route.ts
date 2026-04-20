import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function PATCH(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const body = await request.json();
    const {activo} = body;

    const cupon = await prisma.cupon.update({
      where: {id},
      data: {activo},
    });

    return NextResponse.json(cupon);
  } catch (error) {
    return NextResponse.json({error: "Error toggling cupon"}, {status: 500});
  }
}