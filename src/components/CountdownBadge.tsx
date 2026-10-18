'use client';

import React from 'react';
import { differenceInHours, differenceInDays, isPast, parseISO } from 'date-fns';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CountdownBadgeProps {
  endDate?: string | null;
  status: string;
}

export function CountdownBadge({ endDate, status }: CountdownBadgeProps) {
  if (status === 'pendiente_pago') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        Pendiente de validación
      </span>
    );
  }

  if (status === 'expirado' || (endDate && isPast(parseISO(endDate)))) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Aviso Expirado
      </span>
    );
  }

  if (!endDate) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Activo
      </span>
    );
  }

  const end = parseISO(endDate);
  const now = new Date();
  const hoursLeft = differenceInHours(end, now);
  const daysLeft = differenceInDays(end, now);

  // Lógica condicional requerida:
  // Si le quedan más de 24 horas -> "Faltan X días"
  // Si le quedan menos de 24 horas -> "Finaliza en X horas"
  if (hoursLeft <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <AlertTriangle className="w-3.5 h-3.5" />
        Por expirar
      </span>
    );
  }

  if (hoursLeft <= 24) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300 animate-pulse">
        <Clock className="w-3.5 h-3.5 text-orange-600" />
        Finaliza en {hoursLeft} {hoursLeft === 1 ? 'hora' : 'horas'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <Clock className="w-3.5 h-3.5 text-emerald-600" />
      Faltan {daysLeft} {daysLeft === 1 ? 'día' : 'días'}
    </span>
  );
}
