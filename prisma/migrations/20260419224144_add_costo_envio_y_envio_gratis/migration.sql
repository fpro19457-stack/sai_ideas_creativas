-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "costoEnvio" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Producto" ADD COLUMN     "envioGratis" BOOLEAN NOT NULL DEFAULT false;
