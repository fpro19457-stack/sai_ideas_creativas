import Link from "next/link";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Clock} from "lucide-react";

export default function CheckoutPendingPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardContent className="pt-8 pb-6">
          <div className="mx-auto w-16 h-16 bg-[#D4B8E0] rounded-full flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-[#5C3D2E]" />
          </div>
          <h1 className="text-2xl font-playfair mb-4">Tu pago está siendo procesado ⏳</h1>
          <p className="text-muted-foreground mb-6">
            Tu pago está siendo verificado. Tan pronto como esté confirmado vas a recibir un email.
          </p>
          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/productos">Seguir navegando</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}