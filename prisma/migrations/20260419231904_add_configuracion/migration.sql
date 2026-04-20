-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "datos" JSONB NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);
