"use client";

import {useRouter} from "next/navigation";
import {Button} from "@/components/ui/button";
import {useCart} from "@/lib/cart-context";
import {ShoppingCart, ArrowRight} from "lucide-react";

interface ProductoForCart {
  id: string;
  nombre: string;
  precio: number;
  imagenUrl: string | null;
  cantidadFotos: number | null;
  opciones: any;
  envioGratis: boolean;
}

export default function AddToCartButton({producto}: {producto: ProductoForCart}) {
  const router = useRouter();
  const {addItem} = useCart();

  const handleAddToCart = () => {
    addItem({
      productoId: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      cantidadFotos: producto.cantidadFotos || 0,
      opciones: {
        imagenUrl: producto.imagenUrl,
        ...producto.opciones,
      },
      envioGratis: producto.envioGratis || false,
    });
    router.push("/carrito");
  };

  return (
    <Button onClick={handleAddToCart} size="lg" className="w-full bg-[#F9C6C9] hover:bg-[#F9C6C9]/90 text-[#5C3D2E]">
      <ShoppingCart className="w-5 h-5 mr-2" />
      Agregar al carrito
    </Button>
  );
}