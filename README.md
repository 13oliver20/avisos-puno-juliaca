# 🇵🇪 Chamba Al Toque (Puno & Juliaca)

Plataforma Web Moderna, Responsiva (Mobile-First) y Escalable para la digitalización de avisos clasificados de empleo tradicional (oficios, hotelería, gastronomía, construcción) de las ciudades de **Puno** y **Juliaca**, Perú.

---

## 🚀 Stack Tecnológico

- **Frontend:** Next.js 15 (App Router, Server & Client Components, React 19).
- **Estilos:** Tailwind CSS (Diseño Mobile-First, badges de estado, paleta Yape & Altiplano).
- **Backend, DB y Auth:** Supabase (PostgreSQL con RLS, Triggers y RPCs atómicas).
- **Librerías clave:** `date-fns` (cálculo dinámico de fechas y horas con locale español), `lucide-react`.
- **Despliegue:** Vercel.
- **Control de Versiones:** GitHub (proyecto independiente).

---

## 🗄️ 1. Configuración de Base de Datos (Supabase)

1. Crea un **nuevo proyecto** en [Supabase](https://supabase.com) (ej: `avisos-puno-juliaca`). **No reutilices proyectos anteriores**.
2. Ve al **SQL Editor** en el dashboard de tu nuevo proyecto.
3. Copia y ejecuta el contenido completo del archivo [`supabase/schema.sql`](./supabase/schema.sql).
4. El script creará automáticamente:
   - Tabla `users` vinculada a `auth.users`.
   - Tabla `categories` con los 8 rubros tradicionales pre-cargados de Puno y Juliaca.
   - Tabla `ads` para los avisos y vigencias.
   - Tabla `metrics` vinculada con triggers automáticos.
   - Tabla `payments` para validación de Yape.
   - Funciones RPC atómicas: `increment_whatsapp_click`, `increment_ad_view`, `approve_payment_and_activate_ad`.
   - Políticas completas de seguridad Row Level Security (RLS).

---

## ⚙️ 2. Variables de Entorno

Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Configura tus credenciales obtenidas en **Project Settings > API** de Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-nuevo-id-de-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>

NEXT_PUBLIC_APP_NAME="Chamba Al Toque Puno-Juliaca"
NEXT_PUBLIC_PRICE_PER_DAY=0.50
NEXT_PUBLIC_YAPE_PHONE="951 847 210"
NEXT_PUBLIC_YAPE_HOLDER="Avisos Clasificados Puno"
```

---

## 💻 3. Ejecución en Desarrollo

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📱 4. Rutas y Perfiles

- `/` : **Tablón Público** (Mobile-first, filtros de Rubro, selector Puno/Juliaca, botón WhatsApp con tracking atómico, modal expandible).
- `/advertiser` : **Dashboard de Anunciante** (Métricas de vistas y contactos, estado de avisos).
- `/advertiser/nuevo` : **Wizard de Creación** (Slider interactivo de días, cálculo dinámico de costo a S/ 0.50/día, cálculo de fechas de inicio/fin en tiempo real con `date-fns`, pasarela con QR Yape y registro de código de operación).
- `/admin` : **Panel de Administración** (Aprobación instantánea de pagos Yape con activación automática, visualización de métricas y cuenta regresiva condicional: `> 24h` "Faltan X días" vs `< 24h` "Finaliza en X horas").

---

## 🌐 5. Despliegue en GitHub y Vercel (Proyectos Nuevos)

### A. Nuevo Repositorio en GitHub:
```bash
git init
git add .
git commit -m "feat: digitalización clasificados puno y juliaca"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/avisos-puno-juliaca.git
git push -u origin main
```

### B. Nuevo Proyecto en Vercel:
1. Entra a [Vercel](https://vercel.com/new).
2. Importa el nuevo repositorio `avisos-puno-juliaca`.
3. En la sección **Environment Variables**, agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_NAME`
   - `NEXT_PUBLIC_PRICE_PER_DAY`
   - `NEXT_PUBLIC_YAPE_PHONE`
   - `NEXT_PUBLIC_YAPE_HOLDER`
4. Clic en **Deploy**.
