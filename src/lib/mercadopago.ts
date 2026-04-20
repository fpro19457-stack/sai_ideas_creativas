import MercadoPago, {MercadoPagoConfig, Preference, Payment} from "mercadopago";

const config = new MercadoPagoConfig({accessToken: process.env.MP_ACCESS_TOKEN || ""});
const preferenceClient = new Preference(config);

export async function createPreference(pedido: any) {
  const items = pedido.items.map((item: any) => ({
    title: item.producto.nombre,
    quantity: item.cantidad,
    unit_price: item.precio,
    currency_id: "ARS",
  }));

  const preference = {
    items,
    payer: {
      email: pedido.clienteEmail,
    },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_URL}/checkout/success`,
      failure: `${process.env.NEXT_PUBLIC_URL}/checkout/failure`,
      pending: `${process.env.NEXT_PUBLIC_URL}/checkout/pending`,
    },
    auto_return: "approved" as const,
    external_reference: pedido.numero,
    notification_url: `${process.env.NEXT_PUBLIC_URL}/api/pagos/mercadopago/webhook`,
  };

  const result = await preferenceClient.create({body: preference});
  return result;
}

export async function getPayment(paymentId: string) {
  const paymentClient = new Payment(config);
  return paymentClient.get({id: paymentId});
}

export function validateWebhook(data: any): boolean {
  return true;
}