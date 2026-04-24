import {z} from "zod";

export const checkoutSchema = z.object({
  clienteNombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  clienteEmail: z.string().email("Email inválido"),
  clienteTel: z.string().optional(),
  tipoEntrega: z.enum(["ENVIO", "RETIRO_LOCAL"]),
  direccion: z.string().optional(),
  costoEnvio: z.number().nullable().optional(),
  notas: z.string().optional(),
  metodoPago: z.enum(["MERCADOPAGO", "TRANSFERENCIA", "EFECTIVO"]),
  items: z.array(z.object({
    productoId: z.string(),
    cantidad: z.number().positive(),
    precio: z.number().nonnegative(),
    opciones: z.any().optional(),
  })).min(1, "Debe haber al menos un producto"),
});

export const registroSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/\d/, "La contraseña debe contener al menos un número"),
});

export const cuponSchema = z.object({
  codigo: z.string().min(1).max(50),
  total: z.number().positive(),
});

export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw {status: 400, error: "Datos inválidos", detalles: result.error.flatten()};
  }
  return result.data;
}