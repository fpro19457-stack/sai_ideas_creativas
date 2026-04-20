import type {Metadata} from "next";

export const metadata: Metadata = {
  title: "Catálogo de productos",
  description: "Encontrá fotos impresas, stickers personalizados y productos a medida. Todos nuestros productos se pueden personalizar.",
};

export default function ProductosLayout({children}: {children: React.ReactNode}) {
  return children;
}