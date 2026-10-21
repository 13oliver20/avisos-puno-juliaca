'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, PlusCircle, LogIn, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/authContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isHome = pathname === '/' || pathname.startsWith('/public');
  const isCreateAd = pathname === '/advertiser/nuevo';
  const isUserPanel = pathname === '/panel';
  const isLoginRoute = pathname === '/login' || pathname === '/register';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:hidden safe-area-bottom">
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-center">
        {/* Buscar Empleos */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center h-full transition ${
            isHome
              ? 'text-emerald-600 font-extrabold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Avisos</span>
        </Link>

        {/* Publicar Anuncio (Destacado Central) */}
        <Link
          href="/advertiser/nuevo"
          className="flex flex-col items-center justify-center h-full group"
        >
          <div className={`w-10 h-10 -mt-2 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-active:scale-95 ${
            isCreateAd
              ? 'bg-emerald-700 ring-2 ring-emerald-300'
              : 'bg-gradient-to-tr from-emerald-600 to-teal-600'
          }`}>
            <PlusCircle className="w-5 h-5" />
          </div>
          <span className={`text-[10px] mt-0.5 font-bold ${isCreateAd ? 'text-emerald-700' : 'text-slate-700'}`}>
            Publicar
          </span>
        </Link>

        {/* Iniciar Sesión / Nombre de Usuario si está logeado */}
        {user ? (
          <Link
            href="/panel"
            className={`flex flex-col items-center justify-center h-full transition ${
              isUserPanel
                ? 'text-emerald-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black mb-0.5">
              {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[64px]">
              {user.firstName || 'Mi Panel'}
            </span>
          </Link>
        ) : (
          <Link
            href="/login"
            className={`flex flex-col items-center justify-center h-full transition ${
              isLoginRoute
                ? 'text-emerald-600 font-extrabold'
                : 'text-slate-500 hover:text-slate-900 font-medium'
            }`}
          >
            <LogIn className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] tracking-tight">Iniciar Sesión</span>
          </Link>
        )}

        {/* Panel Admin */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center h-full transition ${
            isAdmin
              ? 'text-purple-700 font-extrabold'
              : 'text-slate-500 hover:text-purple-700 font-medium'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Admin</span>
        </Link>
      </div>
    </nav>
  );
}
