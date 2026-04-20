import {NextResponse} from "next/server";
import {prisma} from "@/lib/db";

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const cupon = await prisma.cupon.findUnique({where: {id}});
    if (!cupon) {
      return NextResponse.json({error: "Cupon no encontrado"}, {status: 404});
    }
    return NextResponse.json(cupon);
  } catch (error) {
    return NextResponse.json({error: "Error fetching cupon"}, {status: 500});
  }
}

export async function PUT(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    const body = await request.json();
    const cupon = await prisma.cupon.update({
      where: {id},
      data: body,
    });
    return NextResponse.json(cupon);
  } catch (error) {
    return NextResponse.json({error: "Error updating cupon"}, {status: 500});
  }
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;
  try {
    await prisma.cupon.delete({where: {id}});
    return NextResponse.json({success: true});
  } catch (error) {
    return NextResponse.json({error: "Error deleting cupon"}, {status: 500});
  }
}