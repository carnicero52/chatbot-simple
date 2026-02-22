-- CreateTable
CREATE TABLE "BotConfig" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'Asistente',
    "greeting" TEXT NOT NULL DEFAULT '¡Hola! ¿En qué puedo ayudarte?',
    "placeholder" TEXT NOT NULL DEFAULT 'Escribe tu mensaje...',
    "password" TEXT NOT NULL DEFAULT 'admin123',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QA" (
    "id" TEXT NOT NULL,
    "keywords" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QA_pkey" PRIMARY KEY ("id")
);
