import Link from "next/link";
import {MapPin} from "lucide-react";

export default function Footer() {
  return (
    <footer id="contacto" className="bg-[#3D2B1F] text-[#FFF8F2]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✦</span>
              <span className="font-playfair text-xl">SA Ideas Creativas</span>
            </Link>
            <p className="text-sm text-white/70">
              Fotos impresas, stickers y productos personalizados con amor.
            </p>
          </div>

          <div>
            <h3 className="font-playfair text-lg mb-4">Contacto</h3>
            <div className="space-y-2 text-sm text-white/70">
              <a
                href="https://instagram.com/saideascreativas"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @saideascreativas
              </a>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Av. Corrientes 150 - Colonia Elisa - Chaco</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-playfair text-lg mb-4">Links rápidos</h3>
            <div className="space-y-2 text-sm text-white/70">
              <Link href="/" className="block hover:text-white transition-colors">Inicio</Link>
              <Link href="/productos" className="block hover:text-white transition-colors">Productos</Link>
              <Link href="/#como-funciona" className="block hover:text-white transition-colors">Cómo funciona</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/50">
          <p>Desarrollado por Devbyte</p>
        </div>
      </div>
    </footer>
  );
}