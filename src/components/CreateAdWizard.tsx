'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Category, CityOption } from '@/types/database';
import { fetchCategories, createAdWithPayment, fetchPlatformConfig, PlatformConfig, DEFAULT_PLATFORM_CONFIG } from '@/lib/adService';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  DollarSign,
  Smartphone,
  ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

export function CreateAdWizard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [config, setConfig] = useState<PlatformConfig>(DEFAULT_PLATFORM_CONFIG);

  // Form State
  const [step, setStep] = useState<1 | 2>(1); // 1: Datos del aviso y duración, 2: Pago Yape
  const [categoryId, setCategoryId] = useState('');
  const [city, setCity] = useState<CityOption>('Juliaca');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [salaryInfo, setSalaryInfo] = useState('');

  // Duration & Pricing (dynamic from platform config)
  const [days, setDays] = useState<number>(7);
  const pricePerDay = typeof config.pricePerDay === 'number' ? config.pricePerDay : 0.50;
  const totalCost = (days * pricePerDay).toFixed(2);

  // Yape State
  const [yapeCode, setYapeCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdAdId, setCreatedAdId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const yapeNumber = config.yapePhone || '951 847 210';
  const yapeHolder = config.yapeHolder || 'Avisos Clasificados Puno & Juliaca';

  useEffect(() => {
    async function load() {
      try {
        const [cats, platConfig] = await Promise.all([
          fetchCategories(),
          fetchPlatformConfig()
        ]);
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
        if (platConfig) {
          setConfig(platConfig);
        }
      } catch (err) {
        console.error('Error loading initial wizard data', err);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    load();
  }, []);

  // Fechas dinámicas calculadas con date-fns
  const startDate = new Date();
  const endDate = addDays(startDate, days);

  const formattedStartDate = format(startDate, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });
  const formattedEndDate = format(endDate, "d 'de' MMMM, yyyy 'a las' h:mm a", { locale: es });

  const handleStep1Validation = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Por favor ingresa un título para el aviso.');
      return;
    }
    if (!description.trim() || description.length < 20) {
      setErrorMessage('La descripción debe tener al menos 20 caracteres explicando el puesto o requerimiento.');
      return;
    }
    const cleanPhone = contactPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setErrorMessage('Ingresa un número de celular de contacto válido de 9 dígitos.');
      return;
    }
    if (!categoryId) {
      setErrorMessage('Selecciona un rubro o categoría.');
      return;
    }

    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanYapeCode = yapeCode.trim();
    if (!cleanYapeCode || cleanYapeCode.length < 4) {
      setErrorMessage('Ingresa un código de validación / número de operación de Yape válido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAdWithPayment({
        title,
        description,
        categoryId,
        city,
        contactPhone,
        address,
        salaryInfo,
        daysContracted: days,
        yapeValidationCode: cleanYapeCode,
      });

      setCreatedAdId(res.adId);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error submitting ad:', err);
      setErrorMessage(err.message || 'Ocurrió un error al registrar el anuncio. Inténtalo nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-xl text-center">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          ¡Aviso Registrado con Éxito!
        </h2>
        <p className="text-slate-600 text-sm mb-6 leading-relaxed">
          Tu anuncio se encuentra en estado <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Pendiente de Validación</span>.
          Nuestro equipo verificará el código de operación de Yape (<strong className="font-mono">{yapeCode}</strong>) y activará tu aviso en pocos minutos.
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs sm:text-sm text-slate-600 space-y-2 mb-6 border border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Título:</span>
            <span className="font-semibold text-slate-800 text-right">{title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Días Contratados:</span>
            <span className="font-semibold text-slate-800">{days} días (S/ {totalCost} PEN)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vigencia Estimada:</span>
            <span className="font-semibold text-slate-800 text-right">{days} días desde su aprobación</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/advertiser"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition"
          >
            Ir a Mi Panel de Anunciante
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-800 transition"
          >
            Ver Tablón Público
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200/80 shadow-lg overflow-hidden">
      {/* Header Wizard */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold tracking-wider uppercase bg-white/20 px-3 py-1 rounded-full">
            Paso {step} de 2
          </span>
          <span className="text-xs text-emerald-100">
            Tarifa: S/ {pricePerDay.toFixed(2)} PEN x día
          </span>
        </div>
        <h1 className="text-2xl font-black">
          {step === 1 ? 'Crear Nuevo Aviso Clasificado' : 'Validación y Pago con Yape'}
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100 mt-1">
          {step === 1
            ? 'Completa los detalles de tu oferta laboral para llegar a trabajadores de Puno y Juliaca.'
            : 'Escanea el código QR de Yape y registra el número de operación para activar tu aviso.'}
        </p>
      </div>

      {errorMessage && (
        <div className="m-6 mb-0 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* PASO 1: FORMULARIO PRINCIPAL */}
      {step === 1 && (
        <form onSubmit={handleStep1Validation} className="p-6 sm:p-8 space-y-6">
          {/* Rubro y Ciudad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                1. Selección de Rubro *
              </label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              >
                {isLoadingCategories ? (
                  <option>Cargando rubros...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Ciudad de la Oferta *
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value as CityOption)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              >
                <option value="Juliaca">Juliaca</option>
                <option value="Puno">Puno</option>
                <option value="Ambas">Puno y Juliaca (Ambas)</option>
              </select>
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Título del Puesto o Aviso *
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Se necesita ayudante de cocina con o sin experiencia"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              2. Descripción del Aviso (Texto Libre) *
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ej: Se necesita un ayudante de cocina para restaurante ubicado en el centro, horario de 8am a 4pm, incluye almuerzo. Personas responsables..."
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
            <p className="text-xs text-slate-400 mt-1">
              Sé claro con los horarios, requisitos y beneficios para recibir candidatos ideales.
            </p>
          </div>

          {/* Celular y Salario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                3. Celular de Contacto (WhatsApp) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm font-semibold">
                  +51
                </span>
                <input
                  type="tel"
                  maxLength={9}
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="951234567"
                  required
                  className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Sueldo / Pago Ofrecido (Opcional)
              </label>
              <input
                type="text"
                value={salaryInfo}
                onChange={e => setSalaryInfo(e.target.value)}
                placeholder="Ej: S/ 1,200 mensual / S/ 50 diario"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
              />
            </div>
          </div>

          {/* Dirección */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Dirección o Referencia del Local / Obra (Opcional)
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ej: Jr. Moquegua con Lima, frente al mercado central"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:outline-none transition"
            />
          </div>

          {/* CONFIGURACIÓN DE TIEMPO E INVERSIÓN */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-5 rounded-2xl border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-700" />
                4. Configuración de Tiempo e Inversión
              </label>
              <span className="text-xs font-bold bg-emerald-200/80 text-emerald-800 px-2 py-0.5 rounded-full">
                S/ {pricePerDay.toFixed(2)} x día
              </span>
            </div>

            {/* Slider Interactivo */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Duración de publicación:
                </span>
                <span className="text-lg font-black text-emerald-700">
                  {days} {days === 1 ? 'Día' : 'Días'}
                </span>
              </div>

              <input
                type="range"
                min={config.minDays || 1}
                max={config.maxDays || 30}
                step={1}
                value={days}
                onChange={e => setDays(Number(e.target.value))}
                className="w-full h-2.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />

              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>1 día (S/ {(pricePerDay * 1).toFixed(2)})</span>
                <span>7 días (S/ {(pricePerDay * 7).toFixed(2)})</span>
                <span>15 días (S/ {(pricePerDay * 15).toFixed(2)})</span>
                <span>30 días (S/ {(pricePerDay * 30).toFixed(2)})</span>
              </div>
            </div>

            {/* Resumen de Tiempos Dinámico con date-fns */}
            <div className="mt-4 pt-4 border-t border-emerald-200/60 text-xs sm:text-sm text-emerald-950 space-y-1.5">
              <p className="font-semibold text-emerald-900">
                Resumen de Tiempos:
              </p>
              <p className="bg-white/90 p-3 rounded-xl border border-emerald-200 text-xs text-slate-700 leading-relaxed">
                Tu anuncio comenzará el <strong className="text-emerald-800">{formattedStartDate}</strong> y finalizará el <strong className="text-emerald-800">{formattedEndDate}</strong>.
              </p>
            </div>

            {/* Cálculo de Inversión */}
            <div className="mt-4 flex items-center justify-between bg-emerald-600 text-white p-3.5 rounded-xl shadow-xs">
              <span className="text-sm font-medium">Total a pagar:</span>
              <span className="text-xl font-extrabold font-mono">
                S/ {totalCost} PEN
              </span>
            </div>
          </div>

          {/* Botón Siguiente */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-base"
            >
              <span>Continuar con el Pago (S/ {totalCost})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      )}

      {/* PASO 2: PASARELA DE PAGO YAPE */}
      {step === 2 && (
        <form onSubmit={handleFinalSubmit} className="p-6 sm:p-8 space-y-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 font-semibold mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver a editar detalles
          </button>

          {/* Tarjeta de Pago Yape */}
          <div className="bg-[#742284] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#9c35b0]/30 rounded-full blur-2xl"></div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-[#742284] text-xl">
                  Y
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-none">Paga con Yape</h3>
                  <span className="text-[11px] text-purple-200">BCP - Al instante</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-purple-200">Monto Exacto:</span>
                <p className="text-2xl font-black font-mono">S/ {totalCost}</p>
              </div>
            </div>

            {/* Código QR y Datos */}
            <div className="bg-white rounded-xl p-4 text-slate-900 flex flex-col sm:flex-row items-center gap-4">
              {/* Código QR Ilustrativo */}
              <div className="w-32 h-32 bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center p-2 relative flex-shrink-0">
                <QrCode className="w-24 h-24 text-[#742284]" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">QR Yape Oficial</span>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Número para Yapear:</span>
                  <p className="text-xl font-extrabold font-mono text-[#742284]">
                    {yapeNumber}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Titular / Empresa:</span>
                  <p className="text-xs font-bold text-slate-700">
                    {yapeHolder}
                  </p>
                </div>
                <div className="text-[11px] text-slate-400">
                  Concepto: Aviso de {days} días ({title.slice(0, 24)}...)
                </div>
              </div>
            </div>
          </div>

          {/* Input Obligatorio de Código de Validación Yape */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Ingresa el código de validación / número de operación de Yape *
            </label>
            <div className="relative">
              <input
                type="text"
                value={yapeCode}
                onChange={e => setYapeCode(e.target.value)}
                placeholder="Ej: 148920 ó YP-892301"
                required
                className="w-full px-4 py-3 bg-slate-50 border-2 border-purple-200 rounded-xl text-base focus:border-[#742284] focus:bg-white focus:outline-none transition font-mono font-bold text-slate-900"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Lo encuentras en la constancia de pago de tu aplicación Yape en tu celular.
            </p>
          </div>

          {/* Resumen final */}
          <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-600 space-y-1 border border-slate-200">
            <p><strong>Aviso:</strong> {title}</p>
            <p><strong>Celular de contacto:</strong> +51 {contactPhone}</p>
            <p><strong>Vigencia:</strong> {days} días ({formattedStartDate} al {formattedEndDate})</p>
          </div>

          {/* Botón Finalizar */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#742284] hover:bg-[#5b1867] active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-base disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Guardando y registrando aviso...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmar y Enviar Anuncio</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
