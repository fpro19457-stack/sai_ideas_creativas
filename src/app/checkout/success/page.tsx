"use client";

import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {CheckCircle} from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 bg-[#B8E0D2] rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-[#5C3D2E]" />
          </div>
          <h1 className="text-2xl font-playfair mb-4">¡Pago confirmado! 🎉</h1>
          <p className="text-muted-foreground mb-6">
            Tu pago fue procesado correctamente. Vas a recibir un email con los detalles de tu pedido.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/productos">Seguir comprando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        .confetti {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 100;
        }
        .confetti span {
          position: absolute;
          top: -20px;
          animation: confetti 3s ease-in forwards;
        }
      `}</style>
      <div className="confetti">
        {["#F9C6C9", "#D4B8E0", "#B8E0D2", "#FFF8F2"].map((color, i) => (
          <span key={i} style={{left: `${i * 25}%`, background: color, width: 10, height: 10, borderRadius: "50%", animationDelay: `${i * 0.2}s`}} />
        ))}
      </div>
    </div>
  );
}