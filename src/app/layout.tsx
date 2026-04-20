import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import { Providers } from "@/components/providers";
import NextAuthProvider from "@/components/providers/SessionProvider";
import { CartProvider } from "@/lib/cart-context";
import NavbarCondicional from "@/components/shared/NavbarCondicional";
import WhatsAppButtonCondicional from "@/components/shared/WhatsAppButtonCondicional";
import FooterCondicional from "@/components/shared/FooterCondicional";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://saideascreativas.com"),
  title: {
    template: "%s | Sai Ideas Creativas",
    default: "Sai Ideas Creativas — Fotos y Stickers Personalizados",
  },
  description: "Imprimí tus fotos favoritas, creá stickers únicos y pedidos personalizados a medida. Envíos a todo el país o retiro en local.",
  keywords: ["fotos impresas", "stickers personalizados", "fotitos", "impresión de fotos", "regalo personalizado", "fotos 10x15", "stickers de vinilo", "album de fotos"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Sai Ideas Creativas",
    images: [{url: "/og-image.svg", width: 1200, height: 630, alt: "Sai Ideas Creativas"}],
  },
  twitter: {
    card: "summary_large_image",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "SA Ideas Creativas",
  "description": "Fotos impresas, stickers y productos personalizados",
  "url": process.env.NEXT_PUBLIC_URL || "https://saideascreativas.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Corrientes 150",
    "addressLocality": "Colonia Elisa",
    "addressRegion": "Chaco",
    "addressCountry": "AR"
  },
  "sameAs": ["https://instagram.com/saideascreativas"],
  "priceRange": "$$",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${playfair.variable} ${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLd)}}
        />
        <Providers>
          <CartProvider>
            <NextAuthProvider>
              <NavbarCondicional />
              <WhatsAppButtonCondicional />
              {children}
              <FooterCondicional />
            </NextAuthProvider>
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}