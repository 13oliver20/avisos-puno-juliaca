'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { 
  KeyRound, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Send,
  HelpCircle
} from 'lucide-react';

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'https://avisos-puno-juliaca.vercel.app';
      const redirectUrl = `${origin}/reset-password`;

      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectUrl
        });

        if (error) {
          throw new Error(error.message || 'Error al solicitar el enlace de recuperación.');
        }
      } else {
        // En modo demostrativo / fallback
        console.log('[Recuperación Fallback] Solicitud de reseteo para:', cleanEmail, 'Redirect:', redirectUrl);
      }

      setIsSent(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'No se pudo enviar el enlace. Verifica el correo e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-8 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 text-emerald-400 shadow-inner">
            <KeyRound className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-3 py-1 rounded-full">
            Recuperación de Contraseña
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            ¿Olvidaste tu contraseña?
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            Ingresa el correo electrónico asociado a tu cuenta de empleador y te enviaremos las instrucciones de recuperación.
          </p>
        </div>

        {/* Contenido / Formulario */}
        <div className="p-6 sm:p-8 space-y-5">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSent ? (
            <div className="space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900">
                  Se ha enviado un enlace a tu correo
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Hemos enviado las instrucciones para restablecer tu contraseña a <strong className="text-slate-800 font-mono">{email}</strong>.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-[11px] text-slate-600 text-left space-y-1">
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ¿No recibes el correo?
                </p>
                <p>
                  1. Revisa tu carpeta de correo no deseado (Spam) o Promociones.<br/>
                  2. Asegúrate de haber escrito el correo con el que te registraste.<br/>
                  3. El enlace de seguridad tiene una vigencia limitada por tu protección.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold py-3 px-6 rounded-xl transition text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Iniciar Sesión</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Correo Electrónico Registrado
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    required
                    autoFocus
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-sm disabled:opacity-50 mt-1"
              >
                {isLoading ? (
                  <span>Enviando enlace de recuperación...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Enlace a mi Correo</span>
                  </>
                )}
              </button>

              <div className="pt-3 border-t border-slate-100 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Recordé mi contraseña, volver a iniciar sesión</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
