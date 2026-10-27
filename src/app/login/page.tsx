'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Briefcase,
  ArrowRight
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, user, isAdmin } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Si ya está logeado, redirigir automáticamente según su rol
  React.useEffect(() => {
    if (user) {
      if (isAdmin || user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/panel');
      }
    }
  }, [user, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (res.isAdmin) {
          // El sistema identifica que es el administrador y lo lleva directamente al panel admin
          router.push('/admin');
        } else {
          router.push('/panel');
        }
      } else {
        setErrorMessage(res.error || 'Credenciales incorrectas. Verifica tu correo y contraseña.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-8 text-white text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 text-white shadow-inner">
            <LogIn className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 bg-emerald-950/40 border border-emerald-400/30 px-3 py-1 rounded-full">
            Portal de Empleadores & Anunciantes
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-xs mx-auto">
            Accede a tu cuenta para publicar ofertas laborales y gestionar tus avisos en Puno y Juliaca.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Campo Correo o Usuario */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Correo Electrónico o Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com o admin123"
                required
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Contraseña
              </label>
              <Link
                href="/recuperar"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-sm disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span>Verificando credenciales...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
              </>
            )}
          </button>

          {/* Separador y Enlace Crear Cuenta */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              ¿Todavía no tienes cuenta en la plataforma?
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 transition mt-1.5"
            >
              <span>Crear cuenta gratis como empleador</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
