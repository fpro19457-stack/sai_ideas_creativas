import {NextResponse} from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({mensaje: "Sesión cerrada"});
    response.cookies.delete("cliente-session");
    return response;
  } catch (error) {
    console.error("Error en logout:", error);
    return NextResponse.json({error: "Error al cerrar sesión"}, {status: 500});
  }
}