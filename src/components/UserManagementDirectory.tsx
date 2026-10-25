'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { UserWithAdHistory, Ad } from '@/types/database';
import { fetchUsersWithAdHistory, deleteUserAdmin } from '@/lib/adService';
import { getAdExpirationDetails, extractOnlyFirstName } from '@/lib/adTime';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  MessageCircle,
  Briefcase,
  AlertCircle,
  ExternalLink,
  X,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  Filter,
  DollarSign,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

interface UserManagementDirectoryProps {
  onSelectUserAd?: (ad: Ad) => void;
}

export function UserManagementDirectory({ onSelectUserAd }: UserManagementDirectoryProps) {
  const [users, setUsers] = useState<UserWithAdHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'with_active' | 'with_expired' | 'no_ads'>('all');
  const [selectedUser, setSelectedUser] = useState<UserWithAdHistory | null>(null);

  // Estados para Eliminación de Usuario
  const [userToDelete, setUserToDelete] = useState<UserWithAdHistory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchUsersWithAdHistory();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users in directory', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const res = await deleteUserAdmin(userToDelete.id, userToDelete.email);
      if (res.success) {
        const deletedEmail = userToDelete.email;
        const deletedName = userToDelete.fullName || userToDelete.firstName;

        // Actualizar lista en vivo removiendo al usuario
        setUsers(prev => prev.filter(u => u.email.toLowerCase() !== deletedEmail.toLowerCase() && u.id !== userToDelete.id));

        // Si estaba abierto el modal de detalles, cerrarlo
        if (selectedUser?.email.toLowerCase() === deletedEmail.toLowerCase()) {
          setSelectedUser(null);
        }

        setUserToDelete(null);
        setActionSuccess(`El usuario "${deletedName}" y sus anuncios asociados han sido eliminados correctamente.`);
        setTimeout(() => setActionSuccess(null), 6000);
      } else {
        setDeleteError(res.error || 'Ocurrió un error al intentar eliminar el usuario.');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'Error de conexión.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtrado e indexado en tiempo real
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return users.filter(user => {
      // 1. Filtro por texto de búsqueda
      if (q) {
        const matchesName = (user.fullName || '').toLowerCase().includes(q);
        const matchesFirst = (user.firstName || '').toLowerCase().includes(q);
        const matchesEmail = (user.email || '').toLowerCase().includes(q);
        const matchesPhone = (user.phone || '').includes(q);
        const matchesAdTitle = user.ads.some(ad => ad.title.toLowerCase().includes(q));

        if (!matchesName && !matchesFirst && !matchesEmail && !matchesPhone && !matchesAdTitle) {
          return false;
        }
      }

      // 2. Filtro por pestañas de estado
      if (statusFilter === 'with_active') {
        return user.activeAdsCount > 0;
      }
      if (statusFilter === 'with_expired') {
        return user.expiredAdsCount > 0;
      }
      if (statusFilter === 'no_ads') {
        return user.ads.length === 0;
      }

      return true;
    });
  }, [users, searchQuery, statusFilter]);

  // Contadores para pestañas
  const counts = useMemo(() => {
    return {
      all: users.length,
      with_active: users.filter(u => u.activeAdsCount > 0).length,
      with_expired: users.filter(u => u.expiredAdsCount > 0).length,
      no_ads: users.filter(u => u.ads.length === 0).length
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Alerta de Acción Exitosa */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-700 hover:text-emerald-900 font-black text-xs px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {/* Barra Superior con Indexador y Buscador Avanzado */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Directorio & Administración de Usuarios
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Control Integral de Usuarios y Clasificados
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Supervisa la autoría de cada publicación, consulta la vigencia exacta de avisos, visualiza su historial y elimina cuentas no deseadas.
            </p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-slate-900 font-mono">{filteredUsers.length}</span>
            <span className="text-xs text-slate-400 block font-medium">
              {filteredUsers.length === 1 ? 'usuario indexado' : 'usuarios indexados'}
            </span>
          </div>
        </div>

        {/* Buscador en Tiempo Real */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Indexar usuarios por nombre, apellido, correo, celular o título de anuncio..."
            className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtros de Pestañas Rápidas */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Todos los Usuarios</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('with_active')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'with_active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Con Anuncios Activos</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'with_active' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'}`}>
              {counts.with_active}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('with_expired')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'with_expired'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Con Anuncios Expirados</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'with_expired' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {counts.with_expired}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('no_ads')}
            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              statusFilter === 'no_ads'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Nuevos / Sin Anuncios</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${statusFilter === 'no_ads' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-800'}`}>
              {counts.no_ads}
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Usuarios Indexados */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Cargando directorio de usuarios...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {searchQuery
              ? 'No se encontraron usuarios'
              : users.length === 0
                ? 'Aún no hay usuarios registrados'
                : 'No hay usuarios en esta categoría'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? `No existe ningún usuario con "${searchQuery}". Verifica que el correo o nombre estén correctos.`
              : users.length === 0
                ? 'Cuando alguien se registre o publique un anuncio, aparecerá aquí automáticamente.'
                : 'Ajusta el filtro o revisa en la pestaña "Todos los Usuarios".'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredUsers.map(user => {
            const firstName = extractOnlyFirstName(user.firstName || user.fullName, user.email);
            const userInitial = firstName.charAt(0).toUpperCase();
            const isProtectedAdmin = user.role === 'admin' || user.email === 'admin@chambaaltoque.pe';

            return (
              <div
                key={user.id || user.email}
                onClick={() => setSelectedUser(user)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Fila Superior de Usuario */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                        {userInitial}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition">
                            {user.fullName || firstName}
                          </h3>
                          {user.role === 'admin' ? (
                            <span className="text-[9px] font-bold uppercase bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded">
                              Admin
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              Anunciante
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px] sm:max-w-[210px]">{user.email}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Botón Eliminar Usuario */}
                      {!isProtectedAdmin && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(user);
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title={`Eliminar usuario ${user.fullName || user.firstName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="p-1 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  {/* Badges de Estado de Avisos */}
                  <div className="flex items-center gap-2 flex-wrap mb-4">
                    {user.activeAdsCount > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        {user.activeAdsCount} {user.activeAdsCount === 1 ? 'activo' : 'activos'}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-lg">
                        0 activos
                      </span>
                    )}

                    {user.expiredAdsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {user.expiredAdsCount} {user.expiredAdsCount === 1 ? 'expirado' : 'expirados'}
                      </span>
                    )}

                    {user.pendingAdsCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg">
                        {user.pendingAdsCount} por validar
                      </span>
                    )}

                    {user.ads.length === 0 && (
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg">
                        Sin publicaciones
                      </span>
                    )}
                  </div>
                </div>

                {/* Métricas Inferiores */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1" title="Total visualizaciones recibidas">
                      <Eye className="w-3.5 h-3.5 text-slate-400" />
                      <strong>{user.totalViews}</strong> vistas
                    </span>
                    <span className="flex items-center gap-1 text-emerald-700 font-semibold" title="Total contactos de WhatsApp">
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>{user.totalClicks}</strong> WhatsApp
                    </span>
                  </div>

                  <span className="text-[11px] text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                    Ver Historial ({user.ads.length})
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL / INSPECTOR DE HISTORIAL DE ANUNCIOS DEL USUARIO --- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white flex-shrink-0 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl flex items-center justify-center shadow-inner flex-shrink-0">
                  {extractOnlyFirstName(selectedUser.firstName || selectedUser.fullName, selectedUser.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                      Expediente de Usuario
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      ID: {selectedUser.id}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {selectedUser.fullName || selectedUser.firstName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-300 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-400" />
                      {selectedUser.email}
                    </span>
                    {selectedUser.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-400" />
                        {selectedUser.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition flex-shrink-0"
                title="Cerrar ventana"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Resumen de Métricas del Usuario */}
            <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
              <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Avisos</span>
                <p className="text-lg font-black text-slate-900">{selectedUser.ads.length}</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-emerald-200 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-700 uppercase block">Activos Ahora</span>
                <p className="text-lg font-black text-emerald-600">{selectedUser.activeAdsCount}</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Expirados</span>
                <p className="text-lg font-black text-slate-700">{selectedUser.expiredAdsCount}</p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Vistas / WhatsApp</span>
                <p className="text-lg font-black text-slate-900">
                  {selectedUser.totalViews} / <span className="text-emerald-600">{selectedUser.totalClicks}</span>
                </p>
              </div>
            </div>

            {/* Listado del Historial de Avisos del Usuario */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Historial Cronológico de Anuncios Publicados ({selectedUser.ads.length})
                </h4>
                <span className="text-[11px] text-slate-400">
                  Del más reciente al más antiguo
                </span>
              </div>

              {selectedUser.ads.length === 0 ? (
                <div className="py-12 text-center space-y-3 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Briefcase className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Este usuario aún no tiene anuncios</p>
                  <p className="text-xs text-slate-500">
                    Aparecerán aquí cuando publique ofertas desde la sección de publicación.
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {selectedUser.ads.map(ad => {
                    const expInfo = getAdExpirationDetails(ad);

                    return (
                      <div
                        key={ad.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition space-y-3 ${
                          expInfo.isActive
                            ? 'bg-white border-emerald-200 shadow-xs'
                            : expInfo.isExpired
                            ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                            : 'bg-amber-50/50 border-amber-200'
                        }`}
                      >
                        {/* Fila Superior del Aviso: Estados y Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Badge de Estado Principal */}
                            {expInfo.isActive ? (
                              <span className="inline-flex items-center gap-1 text-xs font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Activo • {expInfo.timeLabel}
                              </span>
                            ) : expInfo.isExpired ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-black bg-red-100 text-red-800 px-2.5 py-0.5 rounded-lg border border-red-200">
                                <Clock className="w-3.5 h-3.5 text-red-600" />
                                {expInfo.timeLabel}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-xs font-black bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-lg border border-amber-200">
                                <AlertCircle className="w-3.5 h-3.5" />
                                {expInfo.timeLabel}
                              </span>
                            )}

                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {ad.city}
                            </span>

                            <span className="text-xs text-slate-500 font-medium">
                              {ad.category?.name || 'Clasificado'}
                            </span>
                          </div>

                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {ad.id}
                          </span>
                        </div>

                        {/* Título y Descripción */}
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {ad.title}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {ad.description}
                          </p>
                        </div>

                        {/* Metadatos Adicionales */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                          {ad.salary_info && (
                            <div>
                              <span className="text-[10px] text-slate-400 block font-medium">Salario:</span>
                              <span className="font-bold text-slate-800">{ad.salary_info}</span>
                            </div>
                          )}

                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Contacto:</span>
                            <span className="font-mono text-slate-800 font-bold">{ad.contact_phone}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Vigencia Pagada:</span>
                            <span className="font-bold text-slate-800">
                              {ad.payment?.days_contracted || 7} días (S/ {(ad.payment?.amount_paid || 0).toFixed(2)})
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Código Yape:</span>
                            <span className="font-mono text-emerald-800 font-bold">
                              {ad.payment?.yape_validation_code || 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Métricas y Enlaces */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-slate-500">
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              {ad.metrics?.views_count || 0} vistas
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-bold">
                              <MessageCircle className="w-3.5 h-3.5" />
                              {ad.metrics?.whatsapp_clicks || 0} clicks WhatsApp
                            </span>
                          </div>

                          {expInfo.isActive && (
                            <Link
                              href={`/?search=${encodeURIComponent(ad.title)}`}
                              target="_blank"
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                              <span>Ver en tablón público</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer del Modal con Acción de Eliminar Usuario */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between flex-shrink-0">
              {selectedUser.role !== 'admin' && selectedUser.email !== 'admin@chambaaltoque.pe' ? (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedUser;
                    setUserToDelete(target);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Usuario</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">Administrador principal protegido</span>
              )}

              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-800 hover:bg-slate-900 text-white transition"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN DEFINITIVA --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-red-100 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                ¿Eliminar este usuario definitivamente?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Estás a punto de eliminar a{' '}
                <strong className="text-slate-900 font-bold">{userToDelete.fullName || userToDelete.firstName}</strong>{' '}
                (<span className="font-mono text-slate-700">{userToDelete.email}</span>).
              </p>
              <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-left text-xs text-red-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-600" />
                  Esta acción es permanente e irreversible:
                </p>
                <ul className="list-disc list-inside text-[11px] text-red-700 space-y-0.5 ml-1">
                  <li>Se borrará la cuenta del directorio de usuarios.</li>
                  <li>Se eliminarán todos sus {userToDelete.ads.length} anuncios clasificados ({userToDelete.activeAdsCount} activos, {userToDelete.expiredAdsCount} expirados).</li>
                </ul>
              </div>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteError(null);
                }}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-red-600 hover:bg-red-700 active:scale-95 text-white transition shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, Eliminar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
