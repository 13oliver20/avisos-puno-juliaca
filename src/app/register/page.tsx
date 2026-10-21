'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState('');

  // Validaciones de Robustez de Contraseña en Tiempo Real
  const hasMinLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Cálculo de fuerza de contraseña (0 a 100%)
  const checksPassed = [hasMinLength, hasNumber, hasUpperCase, passwordsMatch].filter(Boolean).length;
  const strengthPercent = (checksPassed / 4) * 100;
  const isFormValid = hasMinLength && hasNumber && hasUpperCase && passwordsMatch && firstName.trim() && lastName.trim() && email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isFormValid) {
      setErrorMessage('Por favor cumple con todos los requisitos de seguridad antes de continuar.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al procesar el registro.');
      }

      setSuccessEmail(email.trim().toLowerCase());
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error de conexión al registrarse.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              ¡Cuenta Creada Exitosamente!
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-2">
              ¡Bienvenido a Chamba Al Toque!
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Hemos registrado tu cuenta con el correo <strong className="text-slate-900 font-mono">{successEmail}</strong> y te enviamos un correo de confirmación de bienvenida con tus datos.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 text-left space-y-1.5">
            <p className="font-bold">✉️ Correo de confirmación enviado</p>
            <p className="text-emerald-800">
              Revisa tu bandeja de entrada o spam. Tu cuenta ya está lista para publicar ofertas de empleo en Puno y Juliaca.
            </p>
          </div>

          <Link
            href="/login"
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-sm"
          >
            <span>Iniciar Sesión Ahora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden">
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-6 sm:p-8 text-white text-center relative overflow-hidden">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto mb-3 text-white shadow-inner">
            <UserPlus className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold tracking-widest uppercase text-emerald-200 bg-emerald-950/40 border border-emerald-400/30 px-3 py-1 rounded-full">
            Registro de Anunciantes y Empleadores
          </span>
          <h1 className="text-2xl font-black mt-2 tracking-tight">
            Crear Nueva Cuenta
          </h1>
          <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
            Publica tus ofertas de trabajo al instante y conecta con los mejores trabajadores de Puno y Juliaca.
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

          {/* Nombres y Apellidos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombres *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Apellidos *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Ej: Quispe Mamani"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Correo Electrónico *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tuempresa@correo.com"
                required
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, 1 mayúscula, 1 número"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
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

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirmar Contraseña *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña exactamente"
                required
                autoComplete="new-password"
                className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
                tabIndex={-1}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Indicador Visual Interactivo de Seguridad */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/90 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Seguridad de la Contraseña:
              </span>
              <span className={`font-bold ${
                checksPassed === 4 ? 'text-emerald-600' : checksPassed >= 2 ? 'text-amber-600' : 'text-slate-400'
              }`}>
                {checksPassed === 4 ? 'Excelente' : checksPassed >= 2 ? 'Media' : 'Débil'}
              </span>
            </div>

            {/* Barra de Progreso */}
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  checksPassed === 4 
                    ? 'bg-emerald-500 w-full' 
                    : checksPassed >= 2 
                    ? 'bg-amber-500 w-1/2' 
                    : checksPassed >= 1 
                    ? 'bg-red-400 w-1/4' 
                    : 'w-0'
                }`}
              />
            </div>

            {/* Lista de Requisitos Dinámica */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {hasMinLength ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>Mínimo 8 caracteres</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {hasNumber ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>Al menos un número (0-9)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {hasUpperCase ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>Al menos una mayúscula (A-Z)</span>
              </div>

              <div className={`flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                {passwordsMatch ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <X className="w-3.5 h-3.5 text-slate-400" />}
                <span>Contraseñas coinciden</span>
              </div>
            </div>
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition text-sm disabled:opacity-40 disabled:cursor-not-allowed mt-3"
          >
            {isLoading ? (
              <span>Creando tu cuenta y enviando correo...</span>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear Cuenta de Empleador</span>
              </>
            )}
          </button>

          {/* Link a Iniciar Sesión */}
          <div className="pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              ¿Ya tienes una cuenta registrada?{' '}
              <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800 transition">
                Iniciar Sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
