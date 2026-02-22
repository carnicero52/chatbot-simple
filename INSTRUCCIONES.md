# Chatbot Simple - Instrucciones de Despliegue

## Paso 1: Crear cuenta en Neon (GRATIS)

1. Ve a: https://neon.tech
2. Haz clic en "Sign up" (gratis, no requiere tarjeta de crédito)
3. Confirma tu email
4. Crea un nuevo proyecto llamado "chatbot"

## Paso 2: Obtener credenciales de Neon

1. En tu proyecto Neon, ve a "Connection Details"
2. Copia la "Connection string" (se ve así):
   ```
   postgresql://usuario:contraseña@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. También copia la "Pooled connection string" (para DIRECT_DATABASE_URL)

## Paso 3: Crear proyecto en Vercel (NUEVO)

1. Ve a: https://vercel.com
2. "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. En "Environment Variables", agrega:
   ```
   DATABASE_URL = postgresql://tu-connection-string
   DIRECT_DATABASE_URL = postgresql://tu-pooled-connection-string
   ```
5. Haz clic en "Deploy"

## Paso 4: Inicializar la base de datos

Después del primer deploy, necesitas crear las tablas:

1. En Vercel, ve a tu proyecto → "Storage" → "Neon"
2. O usa la consola SQL de Neon para ejecutar:
   ```sql
   CREATE TABLE "BotConfig" (
     "id" TEXT PRIMARY KEY DEFAULT 'default',
     "name" TEXT DEFAULT 'Asistente',
     "greeting" TEXT DEFAULT '¡Hola! ¿En qué puedo ayudarte?',
     "placeholder" TEXT DEFAULT 'Escribe tu mensaje...',
     "password" TEXT DEFAULT 'admin123',
     "updatedAt" TIMESTAMP DEFAULT NOW()
   );

   CREATE TABLE "QA" (
     "id" TEXT PRIMARY KEY,
     "keywords" TEXT,
     "response" TEXT,
     "order" INTEGER DEFAULT 0,
     "createdAt" TIMESTAMP DEFAULT NOW()
   );
   ```

## Paso 5: Probar

- Chat público: `https://tu-proyecto.vercel.app`
- Admin: `https://tu-proyecto.vercel.app/admin`
- Contraseña por defecto: `admin123`

---

## Estructura del Proyecto

```
/                   → Chat público (cualquiera puede usarlo)
/admin              → Panel de administración (requiere contraseña)
/api/bot/config     → API: configuración del bot
/api/bot/chat       → API: respuestas del chat
/api/admin/login    → API: login del admin
/api/admin/config   → API: guardar configuración
/api/admin/qa       → API: gestionar preguntas/respuestas
```

---

## Costo: GRATIS

- Neon: 512 MB gratis
- Vercel: Hospedaje gratis
- Total: $0/mes
