-- ==============================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE (POSTGRESQL) - AVISOS PUNO Y JULIACA
-- ==============================================================================
-- Proyecto: Digitalización de Avisos Clasificados Tradicionales de Empleo
-- Cobertura: Puno, Juliaca y Altiplano
-- Moneda: PEN (Soles peruanos) - Tarifa: 0.50 PEN / día
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIOS (users)
-- Vinculada directamente con auth.users de Supabase
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'anunciante' CHECK (role IN ('admin', 'anunciante')),
    full_name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA DE CATEGORÍAS / RUBROS (categories)
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT 'Briefcase',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA DE ANUNCIOS (ads)
CREATE TABLE IF NOT EXISTS public.ads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Juliaca' CHECK (city IN ('Puno', 'Juliaca', 'Ambas')),
    contact_phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente_pago' CHECK (status IN ('activo', 'pendiente_pago', 'expirado', 'rechazado')),
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    salary_info TEXT,
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA DE MÉTRICAS (metrics)
CREATE TABLE IF NOT EXISTS public.metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL UNIQUE REFERENCES public.ads(id) ON DELETE CASCADE,
    views_count INTEGER NOT NULL DEFAULT 0,
    whatsapp_clicks INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA DE PAGOS Y VALIDACIÓN YAPE (payments)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
    yape_validation_code TEXT NOT NULL,
    amount_paid NUMERIC(10, 2) NOT NULL,
    days_contracted INTEGER NOT NULL CHECK (days_contracted > 0),
    status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aprobado', 'rechazado')),
    reviewed_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. TRIGGERS Y FUNCIONES AUTOMÁTICAS
-- ==============================================================================

-- Función para inicializar métricas automáticamente cuando se crea un anuncio
CREATE OR REPLACE FUNCTION public.handle_new_ad_metrics()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.metrics (ad_id, views_count, whatsapp_clicks)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (ad_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_after_ad_insert_metrics ON public.ads;
CREATE TRIGGER tr_after_ad_insert_metrics
AFTER INSERT ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_ad_metrics();

-- Función para vincular nuevo usuario registrado en auth.users con public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, role, full_name, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'role', 'anunciante'),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '')
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_on_auth_user_created ON auth.users;
CREATE TRIGGER tr_on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- Función para marcar anuncios expirados si la fecha fin ya pasó
CREATE OR REPLACE FUNCTION public.check_ad_expiration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_date IS NOT NULL AND NEW.end_date < timezone('utc'::text, now()) AND NEW.status = 'activo' THEN
        NEW.status := 'expirado';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_check_ad_expiration ON public.ads;
CREATE TRIGGER tr_check_ad_expiration
BEFORE UPDATE ON public.ads
FOR EACH ROW
EXECUTE FUNCTION public.check_ad_expiration();

-- ==============================================================================
-- 8. RPC (REMOTE PROCEDURE CALLS) ATÓMICAS Y SEGURAS
-- ==============================================================================

-- Incremento atómico de clics en WhatsApp (Llamado desde frontend público)
CREATE OR REPLACE FUNCTION public.increment_whatsapp_click(p_ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.metrics
    SET whatsapp_clicks = whatsapp_clicks + 1,
        updated_at = timezone('utc'::text, now())
    WHERE ad_id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Incremento atómico de vistas (Llamado al abrir modal o cargar anuncio)
CREATE OR REPLACE FUNCTION public.increment_ad_view(p_ad_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.metrics
    SET views_count = views_count + 1,
        updated_at = timezone('utc'::text, now())
    WHERE ad_id = p_ad_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de Administrador: Aprobar pago y activar anuncio automáticamente
CREATE OR REPLACE FUNCTION public.approve_payment_and_activate_ad(p_payment_id UUID, p_admin_id UUID)
RETURNS JSON AS $$
DECLARE
    v_payment RECORD;
    v_ad_id UUID;
    v_days INTEGER;
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
BEGIN
    -- Validar pago
    SELECT * INTO v_payment FROM public.payments WHERE id = p_payment_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pago no encontrado';
    END IF;

    v_ad_id := v_payment.ad_id;
    v_days := v_payment.days_contracted;
    v_start := timezone('utc'::text, now());
    v_end := v_start + (v_days || ' days')::INTERVAL;

    -- Actualizar pago a aprobado
    UPDATE public.payments
    SET status = 'aprobado',
        reviewed_by = p_admin_id,
        updated_at = v_start
    WHERE id = p_payment_id;

    -- Activar anuncio con vigencia
    UPDATE public.ads
    SET status = 'activo',
        start_date = v_start,
        end_date = v_end,
        updated_at = v_start
    WHERE id = v_ad_id;

    RETURN json_build_object('success', true, 'ad_id', v_ad_id, 'start_date', v_start, 'end_date', v_end);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper para verificar si usuario actual es admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLÍTICAS: CATEGORIES (Público puede leer, solo admin edita)
CREATE POLICY "Categorias visibles para todos" 
    ON public.categories FOR SELECT 
    USING (true);

CREATE POLICY "Solo admin gestiona categorias" 
    ON public.categories FOR ALL 
    USING (public.is_admin());

-- POLÍTICAS: ADS
-- 1. Público: Anuncios activos con vigencia válida
CREATE POLICY "Publico puede ver anuncios activos vigentes" 
    ON public.ads FOR SELECT 
    USING (status = 'activo' AND (end_date IS NULL OR end_date > timezone('utc'::text, now())));

-- 2. Anunciante: Puede ver y crear sus propios anuncios
CREATE POLICY "Anunciantes ven sus propios anuncios" 
    ON public.ads FOR SELECT 
    USING (auth.uid() = advertiser_id OR public.is_admin());

CREATE POLICY "Anunciantes pueden crear anuncios" 
    ON public.ads FOR INSERT 
    WITH CHECK (auth.uid() = advertiser_id OR advertiser_id IS NULL OR public.is_admin());

CREATE POLICY "Anunciantes editan sus anuncios pendientes" 
    ON public.ads FOR UPDATE 
    USING (auth.uid() = advertiser_id OR public.is_admin());

CREATE POLICY "Admin puede borrar o actualizar cualquier anuncio" 
    ON public.ads FOR ALL 
    USING (public.is_admin());

-- POLÍTICAS: METRICS
-- Lectura pública para visualización en cards, o admin
CREATE POLICY "Metricas visibles publicamente" 
    ON public.metrics FOR SELECT 
    USING (true);

CREATE POLICY "Solo sistema o admin actualiza metricas completas" 
    ON public.metrics FOR ALL 
    USING (public.is_admin());

-- POLÍTICAS: PAYMENTS
CREATE POLICY "Anunciante puede registrar pago para su anuncio" 
    ON public.payments FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Anunciante ve sus propios pagos" 
    ON public.payments FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.ads 
            WHERE ads.id = payments.ad_id AND ads.advertiser_id = auth.uid()
        ) OR public.is_admin()
    );

CREATE POLICY "Solo admin actualiza estado de pagos" 
    ON public.payments FOR ALL 
    USING (public.is_admin());

-- POLÍTICAS: USERS
CREATE POLICY "Usuarios ven su propio perfil" 
    ON public.users FOR SELECT 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Usuarios actualizan su propio perfil" 
    ON public.users FOR UPDATE 
    USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admin tiene control total de usuarios" 
    ON public.users FOR ALL 
    USING (public.is_admin());

-- ==============================================================================
-- 10. INSERCIÓN DE RUBROS POR DEFECTO (PUNO Y JULIACA)
-- ==============================================================================

INSERT INTO public.categories (name, slug, icon) VALUES
    ('Restaurantes y Gastronomía', 'restaurantes-gastronomia', 'Utensils'),
    ('Hotelería y Turismo', 'hoteleria-turismo', 'Hotel'),
    ('Construcción y Albañilería', 'construccion-albanileria', 'Hammer'),
    ('Repartidores y Delivery', 'repartidores-delivery', 'Bike'),
    ('Oficios y Servicios Técnicos', 'oficios-tecnicos', 'Wrench'),
    ('Comercio y Ventas', 'comercio-ventas', 'ShoppingBag'),
    ('Transporte y Choferes', 'transporte-choferes', 'Truck'),
    ('Atención al Cliente y Limpieza', 'limpieza-atencion', 'Sparkles')
ON CONFLICT (name) DO NOTHING;
